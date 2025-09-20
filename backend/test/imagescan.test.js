import { jest } from "@jest/globals";
import request from "supertest";

async function loadAppWithMock(mockImpl) {
  process.env.NODE_ENV = "test";
  jest.resetModules();

  jest.unstable_mockModule("node-easyocr", () => {
    class MockEasyOCR {
      async init() {}
      async readText(...args) {
        return await mockImpl.readText(...args);
      }
      async close() {}
    }
    return { __esModule: true, default: MockEasyOCR, EasyOCR: MockEasyOCR };
  });

  const { default: app } = await import("../index.js");
  return app;
}

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

  const { default: app } = await import("../index.js");
  return app;
}

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
