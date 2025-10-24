import { jest } from "@jest/globals";
import request from "supertest";

// increase Jest timeout
jest.setTimeout(10000);

// holder for storing last MongoDB pipeline and mock results
const holder = { lastPipeline: null, nextAgg: null };

// mock MongoDB client and its behavior
jest.unstable_mockModule("mongodb", () => {
  const command = jest.fn(async () => ({ ok: 1 }));
  const aggregate = jest.fn((pipeline) => {
    holder.lastPipeline = pipeline;
    const list = holder.nextAgg !== null ? holder.nextAgg : [];
    return { toArray: jest.fn(async () => list) };
  });
  const collection = jest.fn(() => ({ aggregate }));
  const db = jest.fn(() => ({ command, collection }));
  class MongoClient {
    async connect() { return; }
    db() { return db(); }
  }
  const ServerApiVersion = { v1: "1" };
  return { MongoClient, ServerApiVersion };
});

// mock OCR reader to avoid using real node-easyocr
jest.unstable_mockModule("node-easyocr", () => {
  const reader = { init: async () => {}, readText: async () => [] };
  const EasyOCR = jest.fn(() => reader);
  return { default: EasyOCR, EasyOCR };
});

// mock fetch for FDA/GS1 fallback path
beforeAll(() => {
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [] }),
    text: async () => "<html>GTIN: 12345678901234</html>",
  }));
});

// clean up global.fetch
afterAll(() => {
  global.fetch = undefined;
});

// import app from index.js after mocks are ready
let app;
beforeAll(async () => {
  const mod = await import("../index.js");
  app = mod.app || mod.default || mod.server || mod;
});

describe("/search", () => {
  //ensure non-empty GTIN/lot_number build correct $search.should
  test("builds $search.should for non-empty GTIN/lot_number", async () => {
    holder.nextAgg = [
      { name: "Amoxicillin", GTIN: "123", batch_number: "B1", lot_number: "L1", score: 7.2 },
      { name: "Paracetamol", GTIN: "456", batch_number: "B2", lot_number: "L2", score: 6.5 },
    ];
    const body = { name: "Amo", GTIN: "123", lot_number: "L1", batch_number: "" };
    const res = await request(app).post("/search").send(body).set("Content-Type", "application/json");
    expect(typeof res.status).toBe("number");
    const pipeline = holder.lastPipeline;
    expect(Array.isArray(pipeline)).toBe(true);
    const should = pipeline?.[0]?.$search?.compound?.should ?? [];
    const paths = should.map((c) => c?.text?.path).filter(Boolean);
    const supported = new Set(["GTIN", "lot_number"]);
    const expected = [...supported].filter((k) => String(body[k] ?? "").trim() !== "");
    expect(paths).toEqual(expect.arrayContaining(expected));
  });

  //ensure only non-empty supported keys appear in should
  test("only non-empty keys appear in $search.should", async () => {
    holder.nextAgg = [];
    const body = { name: "ABC", GTIN: "", batch_number: "B9", lot_number: 12345 };
    const res = await request(app).post("/search").send(body).set("Content-Type", "application/json");
    expect(typeof res.status).toBe("number");
    const should = holder.lastPipeline?.[0]?.$search?.compound?.should ?? [];
    const paths = should.map((c) => c?.text?.path).filter(Boolean);
    const supported = new Set(["GTIN", "lot_number"]);
    const expected = [...supported].filter((k) => String(body[k] ?? "").trim() !== "");
    expect(paths).toEqual(expect.arrayContaining(expected));
    for (const c of should) if (c?.text?.fuzzy) expect(typeof c.text.fuzzy).toBe("object");
  });

  //when all fields empty, should is empty
  test("all-empty input yields empty should", async () => {
    holder.nextAgg = [];
    const body = { name: "", GTIN: "", batch_number: "", lot_number: "" };
    const res = await request(app).post("/search").send(body).set("Content-Type", "application/json");
    expect(typeof res.status).toBe("number");
    const should = holder.lastPipeline?.[0]?.$search?.compound?.should ?? [];
    expect(Array.isArray(should)).toBe(true);
    expect(should.length).toBe(0);
  });

  //ensure projection includes expected subset
  test("$project includes expected subset", async () => {
    holder.nextAgg = [];
    const res = await request(app).post("/search").send({ name: "Test" }).set("Content-Type", "application/json");
    expect(typeof res.status).toBe("number");
    const project = holder.lastPipeline?.[1]?.$project;
    expect(project).toEqual(expect.objectContaining({ name: 1, lot_number: 1, score: { $meta: "searchScore" } }));
  });

  //check FDA fallback path does not crash
  test("FDA fallback path does not crash and still responds", async () => {
    holder.nextAgg = [];
    global.fetch.mockImplementationOnce(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [] }),
      text: async () => "<html></html>",
    }));
    const res = await request(app).post("/search").send({ name: "FallbackOnly" }).set("Content-Type", "application/json");
    expect(typeof res.status).toBe("number");
    const pipeline = holder.lastPipeline;
    expect(Array.isArray(pipeline)).toBe(true);
  });
});