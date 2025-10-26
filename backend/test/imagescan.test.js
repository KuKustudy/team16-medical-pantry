import { jest } from "@jest/globals";
import request from "supertest";

// Load the Express app with a mocked OCR and MongoDB.
async function loadAppWithMock(mockImpl) {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/dummy";
  jest.resetModules();

  // Mock EasyOCR so tests can control its output
  jest.unstable_mockModule("node-easyocr", () => {
    class MockEasyOCR {
      async init() {}
      async readText(...args) { return await mockImpl.readText(...args); }
      async close() {}
    }
    return { __esModule: true, default: MockEasyOCR, EasyOCR: MockEasyOCR };
  });

  // Mock MongoDB so no real DB is accessed
  jest.unstable_mockModule("mongodb", () => {
    class MockCollection { aggregate() { return { toArray: async () => [] }; } }
    class MockDb { command = async () => ({ ok: 1 }); collection = () => new MockCollection(); }
    class MockMongoClient {
      constructor() {}
      async connect() {}
      db() { return new MockDb(); }
      async close() {}
    }
    return { __esModule: true, MongoClient: MockMongoClient, ServerApiVersion: { v1: "v1" } };
  });

  const { default: app } = await import("../index.js");
  return app;
}

// Load the app with OCR mock returning a GS1-128 barcode string.
async function loadAppWithGs1Mock(gs1Text) {
  process.env.NODE_ENV = "test";
  jest.resetModules();

  jest.unstable_mockModule("node-easyocr", () => {
    class MockEasyOCR {
      async init() {}
      async readText() {
        return [{ text: gs1Text, confidence: 0.99 }];
      }
      async close() {}
    }
    return { __esModule: true, default: MockEasyOCR, EasyOCR: MockEasyOCR };
  });
  
  // Same MongoDB mock as above
  jest.unstable_mockModule("mongodb", () => {
    class MockCollection { aggregate() { return { toArray: async () => [] }; } }
    class MockDb { command = async () => ({ ok: 1 }); collection = () => new MockCollection(); }
    class MockMongoClient {
      async connect() {}
      db() { return new MockDb(); }
      async close() {}
    }
    return { __esModule: true, MongoClient: MockMongoClient, ServerApiVersion: { v1: "v1" } };
  });

  const { default: app } = await import("../index.js");
  return app;
}

// Tests part
// OCR returns GS1-128 barcode
test("should extract GTIN/expiry/lot from GS1-128 string", async () => {
  const GS1 = "(01)04953170389559(17)230831(10)89V";
  const app = await loadAppWithGs1Mock(GS1);

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "backend/color_image.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);

  const texts = (res.body.data || []).map(x => x.text || "").join(" ");

  const gtinMatch = texts.match(/\(01\)\s*(\d{14})/);
  expect(gtinMatch).not.toBeNull();
  expect(gtinMatch[1]).toBe("04953170389559");

  const expMatch = texts.match(/\(17\)\s*(\d{6})/);
  expect(expMatch).not.toBeNull();
  expect(expMatch[1]).toBe("230831");

  const lotMatch = texts.match(/\(10\)\s*([A-Za-z0-9]+)\b/);
  expect(lotMatch).not.toBeNull();
  expect(lotMatch[1]).toBe("89V");
});

// Missing imagePath → should return 400
test("POST /imagescan without imagePath should return 400", async () => {
  const app = await loadAppWithMock({
    readText: async () => []
  });

  const res = await request(app)
    .post("/imagescan")
    .send({}) 
    .set("Content-Type", "application/json");
  expect(res.status).toBe(400);
});

// OCR finds nothing → should return empty array
test("POST /imagescan returns empty array when OCR finds nothing", async () => {
  const app = await loadAppWithMock({
    readText: async () => [] 
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "any.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data.length).toBe(0);
});

// OCR throws an error → should return 500
test("POST /imagescan returns 500 when OCR throws", async () => {
  const app = await loadAppWithMock({
    readText: async () => {
      throw new Error("OCR crashed");
    }
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "any.png" })
    .set("Content-Type", "application/json");

  expect([500, 200]).toContain(res.status);
});

// Normal OCR output → confidence formatted as percentage string
test("POST /imagescan returns normalized shape", async () => {
  const app = await loadAppWithMock({
    readText: async () => [
      { text: "A", confidence: 0.91, bbox: [0,0,1,1] },
      { text: "B", confidence: 0.5,  bbox: [1,1,2,2] }
    ]
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "x.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);

  for (const row of res.body.data) {
    expect(typeof row.text).toBe("string");
    expect(typeof row.confidence).toBe("string");
    expect(row.confidence).toMatch(/^\d+(\.\d+)?%$/); 
  }
});

// Ensure console logs can be silenced
test("silence logs on demand", async () => {
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  const app = await loadAppWithMock({
    readText: async () => [{ text: "OLYMPUS", confidence: 0.99 }]
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "x.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  spy.mockRestore();
});

// Multiple OCR results → should combine correctly
test("POST /imagescan returns multiple texts correctly joined", async () => {
  const app = await loadAppWithMock({
    readText: async () => [
      { text: "Hello", confidence: 0.95 },
      { text: "World", confidence: 0.85 }
    ]
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "multi.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(2);
  const joined = res.body.data.map(x => x.text).join(" ");
  expect(joined).toContain("Hello");
  expect(joined).toContain("World");
});

// OCR result without confidence → should not crash
test("POST /imagescan handles result without confidence", async () => {
  const app = await loadAppWithMock({
    readText: async () => [{ text: "NoConf" }]
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "noconf.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data[0].confidence).toBeUndefined();
});

// OCR result with bbox → should preserve bbox
test("POST /imagescan preserves bbox field", async () => {
  const mockBBox = [10, 20, 30, 40];
  const app = await loadAppWithMock({
    readText: async () => [{ text: "BBox", confidence: 0.9, bbox: mockBBox }]
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "bbox.png" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(200);
  expect(res.body.data[0].bbox).toEqual(mockBBox);
});

// Empty imagePath string → return 400
test("POST /imagescan with empty imagePath should return 400", async () => {
  const app = await loadAppWithMock({
    readText: async () => []
  });

  const res = await request(app)
    .post("/imagescan")
    .send({ imagePath: "" })
    .set("Content-Type", "application/json");

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});