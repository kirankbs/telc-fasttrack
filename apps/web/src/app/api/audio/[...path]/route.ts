// This route serves binary MP3 files from disk and cannot use static imports.
// Allowlisted from the no-restricted-imports fs guard (issue #110).
// eslint-disable-next-line no-restricted-imports
import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const ASSETS_DIR =
  process.env.AUDIO_DIR ??
  path.resolve(process.cwd(), '../mobile');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path;
  const filePath = path.join(ASSETS_DIR, ...segments);

  // Prevent directory traversal
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(ASSETS_DIR))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!resolved.endsWith('.mp3')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const buffer = await readFile(resolved);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
