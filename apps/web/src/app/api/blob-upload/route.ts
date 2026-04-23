import { put } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/heic",
  "application/pdf",
  "text/plain",
];

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("[blob-upload] BLOB_READ_WRITE_TOKEN is not set");
    return NextResponse.json(
      { error: "Blob storage not configured (missing token)" },
      { status: 500 }
    );
  }

  let file: File | null = null;
  try {
    const formData = (await request.formData()) as unknown as {
      get(name: string): File | string | null;
    };
    const entry = formData.get("file");
    if (entry instanceof File) file = entry;
  } catch (error) {
    console.error("[blob-upload] formData parse failed:", error);
    return NextResponse.json(
      {
        error: `Failed to parse upload: ${(error as Error).message}`,
        stage: "formData",
      },
      { status: 500 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 10 MB limit" },
      { status: 400 }
    );
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported content type: ${file.type}` },
      { status: 400 }
    );
  }

  try {
    console.log(
      `[blob-upload] put ${file.name} size=${file.size} type=${file.type}`
    );
    const blob = await put(`feedback-attachments/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token,
    });
    console.log(`[blob-upload] success url=${blob.url}`);
    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (error) {
    console.error("[blob-upload] put() failed:", error);
    return NextResponse.json(
      {
        error: `Blob upload failed: ${(error as Error).message}`,
        stage: "put",
      },
      { status: 500 }
    );
  }
}
