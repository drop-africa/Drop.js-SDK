import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Poller } from "./poller";
import type { DropPaymentStatus, DropError } from "./types";

describe("Poller", () => {
  let statusChanges: DropPaymentStatus[];
  let errors: DropError[];

  beforeEach(() => {
    vi.useFakeTimers();
    statusChanges = [];
    errors = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createPoller(overrides = {}): Poller {
    return new Poller({
      apiBaseUrl: "https://api.test.com/api/v1",
      paymentAccountId: "test-account-id",
      paymentIntentId: "test-id",
      clientSecret: "pi_secret_test",
      onStatusChange: (s) => statusChanges.push(s),
      onError: (e) => errors.push(e),
      ...overrides,
    });
  }

  it("fetches status on start", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          paymentIntentId: "test-id",
          status: "PaymentInitiated",
          currency: "GMD",
          amount: 100,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test.com/api/v1/payment-accounts/test-account-id/payment-intents/test-id/status",
      {
        method: "GET",
        headers: { "client-secret": "pi_secret_test" },
      },
    );

    poller.stop();
  });

  it("emits status change when status changes", async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      const status =
        callCount === 1 ? "PaymentInitiated" : "PaymentPending";
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            paymentIntentId: "test-id",
            status,
            currency: "GMD",
            amount: 100,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(3000);

    expect(statusChanges).toContain("pending");

    poller.stop();
  });

  it("stops polling on terminal status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          paymentIntentId: "test-id",
          status: "PaymentSucceeded",
          currency: "GMD",
          amount: 100,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(10000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(statusChanges).toEqual(["succeeded"]);

    poller.stop();
  });

  it("stops polling on 401 error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(10000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errors[0].code).toBe("AUTH_ERROR");

    poller.stop();
  });

  it("stops polling on 404 error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(10000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errors[0].code).toBe("NOT_FOUND");

    poller.stop();
  });

  it("applies backoff on 429 without Retry-After", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);
    expect(errors[0].code).toBe("RATE_LIMITED");

    // Should schedule next poll with backoff (3000 * 1.5 = 4500ms)
    await vi.advanceTimersByTimeAsync(3000);
    expect(fetchMock).toHaveBeenCalledTimes(1); // not yet

    await vi.advanceTimersByTimeAsync(1500);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    poller.stop();
  });

  it("stops after max consecutive failures", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    // Run through 5 consecutive failures
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(30000);
    }

    // After 5 failures it should stop
    const callsBefore = fetchMock.mock.calls.length;
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetchMock.mock.calls.length).toBe(callsBefore);

    poller.stop();
  });

  it("returns current status via getStatus", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          paymentIntentId: "test-id",
          status: "PaymentPending",
          currency: "GMD",
          amount: 100,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    expect(poller.getStatus()).toBe("initiated");

    poller.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(poller.getStatus()).toBe("pending");

    poller.stop();
  });

  it("stops polling on destroy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          paymentIntentId: "test-id",
          status: "PaymentInitiated",
          currency: "GMD",
          amount: 100,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const poller = createPoller();
    poller.start();

    await vi.advanceTimersByTimeAsync(0);
    poller.stop();

    await vi.advanceTimersByTimeAsync(10000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
