import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vercel/blob/client", () => ({
  handleUpload: vi.fn(),
}));

import { handleUpload } from "@vercel/blob/client";
import { POST } from "@/app/api/blob-upload/route";

const mockHandleUpload = vi.mocked(handleUpload);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/blob-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/blob-upload", () => {
  it("returns handleUpload result on success", async () => {
    mockHandleUpload.mockResolvedValue({ type: "blob.generate-client-token" } as never);

    const res = await POST(makeRequest({ type: "blob.generate-client-token" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ type: "blob.generate-client-token" });
  });

  it("rejects upload with invalid path prefix via onBeforeGenerateToken", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockHandleUpload.mockImplementation(async ({ onBeforeGenerateToken }: any) => {
      await onBeforeGenerateToken("wrong-prefix/file.png");
      return {} as never;
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid upload path/i);
  });

  it("allows upload with correct feedback-attachments prefix", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockHandleUpload.mockImplementation(async ({ onBeforeGenerateToken }: any) => {
      const result = await onBeforeGenerateToken("feedback-attachments/screenshot.png");
      return (result ?? {}) as never;
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
  });

  it("returns 400 when handleUpload throws", async () => {
    mockHandleUpload.mockRejectedValue(new Error("Storage unavailable"));

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Storage unavailable");
  });
});
