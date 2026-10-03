import { afterAll, describe, expect, it } from "vitest";
import { callGemini } from "@/lib/ai/gemini";

const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;

function stubFetch(handler) {
  globalThis.fetch = handler;
}

afterAll(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
});

describe("gemini request deadline", () => {
  it("refuses to call out with no API key", async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(callGemini({ system: "s", prompt: "p" })).rejects.toThrow(
      "GEMINI_API_KEY is not set",
    );

    process.env.GEMINI_API_KEY = "test-key";
  });

  it("times out a request that never settles, instead of hanging forever", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    stubFetch((_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "TimeoutError";
          reject(error);
        });
      }),
    );

    await expect(callGemini({ system: "s", prompt: "p" })).rejects.toThrow(/timed out/);
  }, 20000);

  it("passes an abort signal on every request", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    let seen = null;

    stubFetch(async (_url, init) => {
      seen = init.signal;
      return {
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }),
      };
    });

    await callGemini({ system: "s", prompt: "p" });

    expect(seen).toBeInstanceOf(AbortSignal);
    expect(seen.aborted).toBe(false);
  });

  it("still reports a real HTTP failure", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    stubFetch(async () => ({ ok: false, status: 429, text: async () => "rate limited" }));

    await expect(callGemini({ system: "s", prompt: "p" })).rejects.toThrow(/429/);
  });
});