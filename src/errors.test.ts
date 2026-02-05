import { describe, it, expect } from "vitest";
import { fromHttpStatus, networkError, createError } from "./errors";
import { ErrorCodes, PaymentStatuses } from "./types";

describe("fromHttpStatus", () => {
  it("returns AUTH_ERROR for 401", () => {
    const err = fromHttpStatus(401);
    expect(err.code).toBe("AUTH_ERROR");
    expect(err.retryable).toBe(false);
  });

  it("returns NOT_FOUND for 404", () => {
    const err = fromHttpStatus(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.retryable).toBe(false);
  });

  it("returns RATE_LIMITED for 429", () => {
    const err = fromHttpStatus(429);
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.retryable).toBe(true);
  });

  it("returns UNKNOWN for other status codes", () => {
    const err = fromHttpStatus(500);
    expect(err.code).toBe("UNKNOWN");
    expect(err.retryable).toBe(true);
  });

  it("uses custom message when provided", () => {
    const err = fromHttpStatus(401, "Custom auth message");
    expect(err.message).toBe("Custom auth message");
  });
});

describe("networkError", () => {
  it("creates a retryable NETWORK_ERROR", () => {
    const err = networkError("Connection refused");
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.message).toBe("Connection refused");
    expect(err.retryable).toBe(true);
  });
});

describe("createError", () => {
  it("creates an error with the given properties", () => {
    const err = createError("AUTH_ERROR", "test", false);
    expect(err.code).toBe("AUTH_ERROR");
    expect(err.message).toBe("test");
    expect(err.retryable).toBe(false);
  });
});

describe("ErrorCodes", () => {
  it("exports all error codes as constants", () => {
    expect(ErrorCodes.NETWORK_ERROR).toBe("NETWORK_ERROR");
    expect(ErrorCodes.AUTH_ERROR).toBe("AUTH_ERROR");
    expect(ErrorCodes.RATE_LIMITED).toBe("RATE_LIMITED");
    expect(ErrorCodes.NOT_FOUND).toBe("NOT_FOUND");
    expect(ErrorCodes.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(ErrorCodes.UNKNOWN).toBe("UNKNOWN");
  });
});

describe("PaymentStatuses", () => {
  it("exports all payment statuses as constants", () => {
    expect(PaymentStatuses.INITIATED).toBe("initiated");
    expect(PaymentStatuses.PENDING).toBe("pending");
    expect(PaymentStatuses.SUCCEEDED).toBe("succeeded");
    expect(PaymentStatuses.FAILED).toBe("failed");
    expect(PaymentStatuses.CANCELLED).toBe("cancelled");
    expect(PaymentStatuses.EXPIRED).toBe("expired");
  });
});
