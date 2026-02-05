import { describe, it, expect } from "vitest";
import { mapStatus, isTerminal } from "./status-map";

describe("mapStatus", () => {
  it("maps PaymentInitiated to initiated", () => {
    expect(mapStatus("PaymentInitiated")).toBe("initiated");
  });

  it("maps PaymentPending to pending", () => {
    expect(mapStatus("PaymentPending")).toBe("pending");
  });

  it("maps PaymentSucceeded to succeeded", () => {
    expect(mapStatus("PaymentSucceeded")).toBe("succeeded");
  });

  it("maps PaymentFailed to failed", () => {
    expect(mapStatus("PaymentFailed")).toBe("failed");
  });

  it("maps PaymentCancelled to cancelled", () => {
    expect(mapStatus("PaymentCancelled")).toBe("cancelled");
  });

  it("maps PaymentExpired to expired", () => {
    expect(mapStatus("PaymentExpired")).toBe("expired");
  });

  it("returns null for refund statuses", () => {
    expect(mapStatus("RefundInitiated")).toBeNull();
    expect(mapStatus("RefundPending")).toBeNull();
    expect(mapStatus("RefundSucceeded")).toBeNull();
  });

  it("returns null for unknown statuses", () => {
    expect(mapStatus("SomeUnknownStatus")).toBeNull();
  });
});

describe("isTerminal", () => {
  it("identifies succeeded as terminal", () => {
    expect(isTerminal("succeeded")).toBe(true);
  });

  it("identifies failed as terminal", () => {
    expect(isTerminal("failed")).toBe(true);
  });

  it("identifies cancelled as terminal", () => {
    expect(isTerminal("cancelled")).toBe(true);
  });

  it("identifies expired as terminal", () => {
    expect(isTerminal("expired")).toBe(true);
  });

  it("identifies initiated as non-terminal", () => {
    expect(isTerminal("initiated")).toBe(false);
  });

  it("identifies pending as non-terminal", () => {
    expect(isTerminal("pending")).toBe(false);
  });
});
