import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

import { put } from "@vercel/blob";
import { POST } from "@/app/api/blob-upload/route";

const mockPut = vi.mocked(put);

type MockRequest = {
  formData: () => Promise<{ get(name: string): File | string | null }>;
};

function makeRequest(file: File | null): MockRequest {
  return {
    formData: async () => ({
      get: (name: string) => (name === "file" ? file : null),
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/blob-upload", () => {
  it("returns URL on successful upload", async () => {
    mockPut.mockResolvedValue({
      url: "https://blob.vercel.com/feedback-attachments/test.png",
      pathname: "feedback-attachments/test.png",
      contentDisposition: "inline",
      contentType: "image/png",
      downloadUrl: "",
    } as never);

    const file = new File(["hello"], "test.png", { type: "image/png" });
    const res = await POST(makeRequest(file) as never);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain("test.png");
    expect(json.name).toBe("test.png");
  });

  it("returns 400 when no file is provided", async () => {
    const res = await POST(makeRequest(null) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/no file/i);
  });

  it("returns 400 when file exceeds 10 MB", async () => {
    const big = new File(
      [new Uint8Array(11 * 1024 * 1024)],
      "big.png",
      { type: "image/png" }
    );
    const res = await POST(makeRequest(big) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/10 MB/i);
  });

  it("returns 400 for unsupported content type", async () => {
    const file = new File(["x"], "bad.exe", {
      type: "application/x-msdownload",
    });
    const res = await POST(makeRequest(file) as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/unsupported/i);
  });

  it("returns 500 when put throws", async () => {
    mockPut.mockRejectedValue(new Error("Storage unavailable"));
    const file = new File(["x"], "test.png", { type: "image/png" });
    const res = await POST(makeRequest(file) as never);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Storage unavailable");
  });
});
