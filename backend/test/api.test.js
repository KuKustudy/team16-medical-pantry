import { jest } from "@jest/globals";
import request from "supertest";

async function loadAppWithFetchMock({ fetchImpl }) {
  process.env.NODE_ENV = "test";
  jest.resetModules();

  jest.unstable_mockModule("node-easyocr", () => {
    class MockEasyOCR { async init(){} async readText(){ return []; } async close(){} }
    return { __esModule: true, default: MockEasyOCR, EasyOCR: MockEasyOCR };
  });

  global.fetch = jest.fn(fetchImpl);

  const { default: app } = await import("../index.js");
  return { app, fetchMock: global.fetch };
}

describe("/api", () => {
  test("returns FDA data via GTIN path", async () => {
    const fake = { results: [{ openfda: { upc: "0368001578592", generic_name: "DEMO" } }] };

    const { app, fetchMock } = await loadAppWithFetchMock({
      fetchImpl: async (url) => ({
        json: async () => fake
      })
    });

    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);

    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain('api.fda.gov/drug/enforcement.json?search=status:"Ongoing"');
    expect(calledUrl).toContain('openfda.upc:"0368001578592"');
    expect(calledUrl).toContain('"&limit=10');
  });

  test("handles empty results (200 with empty results array)", async () => {
    const fake = { results: [] };

    const { app } = await loadAppWithFetchMock({
      fetchImpl: async () => ({ json: async () => fake })
    });

    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
  });

  test("returns 500 when fetch throws", async () => {
    const { app } = await loadAppWithFetchMock({
      fetchImpl: async () => { throw new Error("network failed"); }
    });

    const res = await request(app).get("/api");
    expect(res.status).toBe(500);
    expect(res.text).toBe("Error fetching FDA data");
  });

  test("returns 500 when response.json throws", async () => {
    const { app } = await loadAppWithFetchMock({
      fetchImpl: async () => ({ json: async () => { throw new Error("bad JSON"); } })
    });

    const res = await request(app).get("/api");
    expect(res.status).toBe(500);
    expect(res.text).toBe("Error fetching FDA data");
  });

  test("query URL contains status filter and limit", async () => {
    const { app, fetchMock } = await loadAppWithFetchMock({
      fetchImpl: async (url) => ({ json: async () => ({ results: [] }) })
    });

    await request(app).get("/api");

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain('status:"Ongoing"');
    expect(url).toContain('"&limit=10')
  });
});