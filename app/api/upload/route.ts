import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Use UPLOADS_DIR for Docker, fallback to public/library for local dev
const LIBRARY_BASE = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'library');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const vinylId = formData.get('vinylId') as string;
        const fileType = formData.get('fileType') as string; // 'cover' or 'audio'
        const trackIndex = formData.get('trackIndex') as string | null;
        const file = formData.get('file') as File;

        if (!vinylId || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create vinyl folder path (global - no user folder)
        const vinylFolder = path.join(LIBRARY_BASE, `vinyl-${vinylId}`);
        await fs.mkdir(vinylFolder, { recursive: true });

        // Determine filename
        let fileName: string;
        if (fileType === 'cover') {
            const ext = file.name.split('.').pop() || 'jpg';
            fileName = `cover.${ext}`;
        } else {
            const ext = file.name.split('.').pop() || 'mp3';
            fileName = `track-${trackIndex}.${ext}`;
        }

        const filePath = path.join(vinylFolder, fileName);

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        // Return the API path for serving (not public path since UPLOADS_DIR is outside public)
        const publicPath = `/api/files/vinyl-${vinylId}/${fileName}`;

        return NextResponse.json({ success: true, path: publicPath });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
