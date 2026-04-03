import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "./base-url";

describe("normalizeBaseUrl", () => {
  it("strips trailing slashes", () => {
    expect(normalizeBaseUrl("https://api.example.com/v1/")).toBe("https://api.example.com/v1");
  });

  it("forces https for known hosting domains", () => {
    expect(normalizeBaseUrl("http://x.railway.app")).toBe("https://x.railway.app");
  });
});
