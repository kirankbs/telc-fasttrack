import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vercel/blob", () => ({
  list: vi.fn(),
  del: vi.fn(),
}));

import { list, del } from "@vercel/blob";
import { GET } from "@/app/api/cron/cleanup-feedback-attachments/route";

const mockList = vi.mocked(list);
const mockDel = vi.mocked(del);

const CRON_SECRET = "test-cron-secret";

function makeRequest(secret?: string): Request {
  return new Request("http://localhost/api/cron/cleanup-feedback-attachments", {
    headers: secret ? { Authorization: `Bearer ${secret}` } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", CRON_SECRET);
});

describe("GET /api/cron/cleanup-feedback-attachments", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 when secret is wrong", async () => {
    const res = await GET(makeRequest("wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("deletes old blobs and returns count", async () => {
    const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    mockList.mockResolvedValue({
      blobs: [
        { url: "https://blob.vercel.com/old1.png", uploadedAt: oldDate, pathname: "feedback-attachments/old1.png", size: 100, downloadUrl: "" },
        { url: "https://blob.vercel.com/old2.png", uploadedAt: oldDate, pathname: "feedback-attachments/old2.png", size: 200, downloadUrl: "" },
      ],
      cursor: undefined,
      hasMore: false,
    } as never);
    mockDel.mockResolvedValue(undefined);

    const res = await GET(makeRequest(CRON_SECRET));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(2);
    expect(mockDel).toHaveBeenCalledWith([
      "https://blob.vercel.com/old1.png",
      "https://blob.vercel.com/old2.png",
    ]);
  });

  it("skips recent blobs and returns deleted: 0", async () => {
    const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    mockList.mockResolvedValue({
      blobs: [
        { url: "https://blob.vercel.com/new1.png", uploadedAt: recentDate, pathname: "feedback-attachments/new1.png", size: 100, downloadUrl: "" },
      ],
      cursor: undefined,
      hasMore: false,
    } as never);

    const res = await GET(makeRequest(CRON_SECRET));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(0);
    expect(mockDel).not.toHaveBeenCalled();
  });

  it("paginates through multiple pages", async () => {
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    mockList
      .mockResolvedValueOnce({
        blobs: [{ url: "https://blob.vercel.com/p1.png", uploadedAt: oldDate, pathname: "feedback-attachments/p1.png", size: 100, downloadUrl: "" }],
        cursor: "cursor-abc",
        hasMore: true,
      } as never)
      .mockResolvedValueOnce({
        blobs: [{ url: "https://blob.vercel.com/p2.png", uploadedAt: oldDate, pathname: "feedback-attachments/p2.png", size: 100, downloadUrl: "" }],
        cursor: undefined,
        hasMore: false,
      } as never);
    mockDel.mockResolvedValue(undefined);

    const res = await GET(makeRequest(CRON_SECRET));
    const json = await res.json();
    expect(json.deleted).toBe(2);
    expect(mockList).toHaveBeenCalledTimes(2);
  });
});
