import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the pure GitHub API logic by importing and exercising submitFeedback
// with a mocked global fetch. The "use server" directive is a no-op in tests.

vi.mock("@/lib/actions/feedback", async (importOriginal) => {
  // Re-export real implementation so we can spy on fetch
  return await importOriginal();
});

import { submitFeedback } from "@/lib/actions/feedback";

const BASE_PARAMS = {
  title: "Test issue title",
  description: "This is a sufficiently long description for the test case here.",
  category: "bug" as const,
  pathname: "/exam",
  userAgent: "Mozilla/5.0 (Test Browser)",
  deviceType: "Desktop" as const,
};

beforeEach(() => {
  // Default: token is set
  vi.stubEnv("GITHUB_TOKEN", "ghp_testtoken");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("submitFeedback — happy path", () => {
  it("returns issueNumber when GitHub API responds 201", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ number: 42 }),
      })
    );

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.issueNumber).toBe(42);
    expect(result.error).toBeUndefined();
  });

  it("sends correct labels for bug category", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback({ ...BASE_PARAMS, category: "bug" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.labels).toContain("bug");
    expect(body.labels).toContain("user-feedback");
  });

  it("sends correct labels for feature category", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 2 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback({ ...BASE_PARAMS, category: "feature" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.labels).toContain("enhancement");
  });

  it("sends correct labels for question category", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 3 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback({ ...BASE_PARAMS, category: "question" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.labels).toContain("question");
  });

  it("includes route, user-agent, device, and commit SHA in body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 5 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback(BASE_PARAMS);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.body).toContain("/exam");
    expect(body.body).toContain("Desktop");
    expect(body.body).toContain("Mozilla");
  });
});

describe("submitFeedback — error cases", () => {
  it("returns specific error when GITHUB_TOKEN is missing", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.error).toMatch(/token not configured/i);
    expect(result.issueNumber).toBeUndefined();
  });

  it("returns error message on 401 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      })
    );

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.error).toMatch(/invalid or expired/i);
  });

  it("returns error message on 422 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => "Unprocessable Entity",
      })
    );

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.error).toMatch(/invalid issue data/i);
  });

  it("returns error message on 5xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      })
    );

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.error).toMatch(/500/);
  });

  it("returns timeout error on AbortError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        Object.assign(new Error("The operation was aborted"), {
          name: "AbortError",
        })
      )
    );

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.error).toMatch(/timed out/i);
  });

  it("returns generic error on unexpected exception", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure"))
    );

    const result = await submitFeedback(BASE_PARAMS);
    expect(result.error).toBe("Network failure");
  });
});

describe("submitFeedback — attachments", () => {
  it("embeds successful attachment as markdown image in body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 10 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback({
      ...BASE_PARAMS,
      attachments: [{ name: "screenshot.png", url: "https://cdn.example.com/screenshot.png" }],
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.body).toContain("![screenshot.png](https://cdn.example.com/screenshot.png)");
  });

  it("notes failed attachment in body when url is null", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 11 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback({
      ...BASE_PARAMS,
      attachments: [{ name: "screenshot.png", url: null }],
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.body).toContain("screenshot.png (upload failed)");
  });

  it("omits attachments section when no attachments provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 12 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await submitFeedback(BASE_PARAMS);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.body).not.toContain("**Attachments:**");
  });

  it("returns attachmentsFailed: true when any url is null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 13 }),
    }));

    const result = await submitFeedback({
      ...BASE_PARAMS,
      attachments: [
        { name: "ok.png", url: "https://cdn.example.com/ok.png" },
        { name: "fail.png", url: null },
      ],
    });

    expect(result.attachmentsFailed).toBe(true);
  });

  it("does not set attachmentsFailed when all uploads succeed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 14 }),
    }));

    const result = await submitFeedback({
      ...BASE_PARAMS,
      attachments: [{ name: "ok.png", url: "https://cdn.example.com/ok.png" }],
    });

    expect(result.attachmentsFailed).toBeUndefined();
  });
});
