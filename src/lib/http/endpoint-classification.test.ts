import { describe, expect, it } from "vitest";
import { urlMatchesEndpoint } from "./endpoint-classification";

describe("urlMatchesEndpoint", () => {
  it("matches exact paths with optional trailing slash normalization", () => {
    expect(urlMatchesEndpoint("/auth/login", "/auth/login")).toBe(true);
    expect(urlMatchesEndpoint("/auth/login/", "/auth/login")).toBe(true);
  });

  it("matches prefix for trailing-slash endpoint patterns", () => {
    expect(urlMatchesEndpoint("/jobs/status/abc", "/jobs/status/")).toBe(true);
  });

  it("ignores query string for matching", () => {
    expect(urlMatchesEndpoint("/categories?x=1", "/categories")).toBe(true);
  });
});
