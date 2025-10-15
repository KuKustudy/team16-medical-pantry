import { jest } from "@jest/globals";
import request from "supertest";

async function loadAppWithDbMock({ aggregateImpl, connectImpl, toArrayImpl }) {
  process.env.NODE_ENV = "test";
  jest.resetModules();

  jest.unstable_mockModule("node-easyocr", () => {
    class MockEasyOCR {
      async init() {}
      async readText() { return []; }
      async close() {}
    }
    return { __esModule: true, default: MockEasyOCR, EasyOCR: MockEasyOCR };
  });

  const mockAggregateArgHolder = { lastPipeline: null };

  jest.unstable_mockModule("mongodb", () => {
    class MockCollection {
      aggregate(pipeline) {
        mockAggregateArgHolder.lastPipeline = pipeline;
        const cursor = {
          toArray: async () => {
            if (toArrayImpl) return await toArrayImpl();
            if (aggregateImpl) return await aggregateImpl(pipeline);
            return [];
          }
        };
        return cursor;
      }
    }

    class MockDb {
      command = async () => ({ ok: 1 });
      collection = () => new MockCollection();
    }

    class MockMongoClient {
      constructor() {}
      async connect() {
        if (connectImpl) return await connectImpl();
        return;
      }
      db() { return new MockDb(); }
      async close() { return; }
    }

    return {
      __esModule: true,
      MongoClient: MockMongoClient,
      ServerApiVersion: { v1: "v1" }
    };
  });

  const { default: app } = await import("../index.js");
  return { app, mockAggregateArgHolder };
}

describe("/search", () => {
  test("returns aggregated results with multiple non-empty fields", async () => {
    const fakeDocs = [
      { name: "Amoxicillin", GTIN: "123", batch_number: "B1", lot_number: "L1", score: 7.2 },
      { name: "Paracetamol", GTIN: "456", batch_number: "B2", lot_number: "L2", score: 6.5 }
    ];

    const { app, mockAggregateArgHolder } = await loadAppWithDbMock({
      toArrayImpl: async () => fakeDocs
    });

    const res = await request(app)
      .post("/search")
      .send({ name: "Amo", GTIN: "123", lot_number: "L1", batch_number: "" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeDocs);

    const pipeline = mockAggregateArgHolder.lastPipeline;
    expect(Array.isArray(pipeline)).toBe(true);
    const should = pipeline?.[0]?.$search?.compound?.should ?? [];
    expect(should.length).toBe(3); 
  });

  test("builds $search.should only for non-empty keys with fuzzy matching", async () => {
    const { app, mockAggregateArgHolder } = await loadAppWithDbMock({
      toArrayImpl: async () => []
    });

    const body = { name: "ABC", GTIN: "", batch_number: "B9", lot_number: 12345 };
    const res = await request(app)
      .post("/search")
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);

    const should = mockAggregateArgHolder.lastPipeline?.[0]?.$search?.compound?.should ?? [];
    const paths = should.map(s => s.text?.path);
    expect(paths.sort()).toEqual(["batch_number", "lot_number", "name"].sort());

    const lotClause = should.find(s => s.text?.path === "lot_number");
    expect(lotClause.text.query).toBe(String(body.lot_number));
    expect(lotClause.text.fuzzy).toEqual({ maxEdits: 2 });
  });

  test("returns 500 if aggregate.toArray throws and still closes client", async () => {
    let closed = false;

    const { app } = await (async () => {
      process.env.NODE_ENV = "test";
      jest.resetModules();

      jest.unstable_mockModule("node-easyocr", () => {
        class MockEasyOCR { async init(){} async readText(){ return []; } async close(){} }
        return { __esModule: true, default: MockEasyOCR, EasyOCR: MockEasyOCR };
      });

      jest.unstable_mockModule("mongodb", () => {
        class MockCollection {
          aggregate() {
            return {
              toArray: async () => { throw new Error("agg failed"); }
            };
          }
        }
        class MockDb {
          command = async () => ({ ok: 1 });
          collection = () => new MockCollection();
        }
        class MockMongoClient {
          async connect() {}
          db() { return new MockDb(); }
          async close() { closed = true; }
        }
        return {
          __esModule: true,
          MongoClient: MockMongoClient,
          ServerApiVersion: { v1: "v1" }
        };
      });

      const { default: app } = await import("../index.js");
      return { app };
    })();

    const res = await request(app)
      .post("/search")
      .send({ name: "X" })
      .set("Content-Type", "application/json");

    expect([500, 502]).toContain(res.status); 
    expect(closed).toBe(true); 
  });
});

test("builds empty $search.should when all fields are empty", async () => {
  const { app, mockAggregateArgHolder } = await loadAppWithDbMock({
    toArrayImpl: async () => []
  });

  const res = await request(app)
    .post("/search")
    .send({ name: "", GTIN: "", batch_number: "", lot_number: "" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);

  const pipeline = mockAggregateArgHolder.lastPipeline;
  const should = pipeline?.[0]?.$search?.compound?.should ?? [];
  expect(Array.isArray(should)).toBe(true);
  expect(should.length).toBe(0);
});

test("pipeline includes $project with expected fields and meta score", async () => {
  const { app, mockAggregateArgHolder } = await loadAppWithDbMock({
    toArrayImpl: async () => []
  });

  await request(app)
    .post("/search")
    .send({ name: "Test" })
    .set("Content-Type", "application/json");

  const pipeline = mockAggregateArgHolder.lastPipeline;
  expect(Array.isArray(pipeline)).toBe(true);

  const project = pipeline?.[1]?.$project;
  expect(project).toBeTruthy();

  expect(project.name).toBe(1);
  expect(project.GTIN).toBe(1);
  expect(project.batch_number).toBe(1);
  expect(project.lot_number).toBe(1);

  expect(project.score).toEqual({ $meta: "searchScore" });
});
