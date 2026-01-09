import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Use UPLOADS_DIR for Docker, fallback to public/library for local dev
const LIBRARY_BASE = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'library');

// Content type mapping
const MIME_TYPES: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const filePath = path.join(LIBRARY_BASE, ...pathSegments);

        // Security: ensure path doesn't escape LIBRARY_BASE
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(LIBRARY_BASE))) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
        }

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Read file
        const fileBuffer = await fs.readFile(filePath);

        // Determine content type
        const ext = path.extname(filePath).toLowerCase().slice(1);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
}
