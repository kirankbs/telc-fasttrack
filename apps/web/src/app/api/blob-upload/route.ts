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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = (await request.formData()) as unknown as {
      get(name: string): File | string | null;
    };
    const file = formData.get("file");

    if (!(file instanceof File)) {
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

    const blob = await put(`feedback-attachments/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
