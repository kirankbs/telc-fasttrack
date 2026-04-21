import { list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let deleted = 0;
  let cursor: string | undefined;

  do {
    const result = await list({
      prefix: "feedback-attachments/",
      cursor,
      limit: 100,
    });
    const old = result.blobs.filter(
      (b) => new Date(b.uploadedAt) < cutoff
    );
    if (old.length) {
      await del(old.map((b) => b.url));
      deleted += old.length;
    }
    cursor = result.cursor;
  } while (cursor);

  return NextResponse.json({ deleted });
}
