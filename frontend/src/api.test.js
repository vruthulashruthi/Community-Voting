import { afterEach, describe, expect, it } from "vitest";

import { getAuthToken, setAuthToken } from "./api";

afterEach(() => {
  setAuthToken(null);
});

describe("auth token helpers", () => {
  it("stores and reads auth token", () => {
    setAuthToken("token-123");
    expect(getAuthToken()).toBe("token-123");
  });

  it("removes auth token", () => {
    setAuthToken("token-123");
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });
});
