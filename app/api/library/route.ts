import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Use UPLOADS_DIR for Docker, fallback to public/library for local dev
const LIBRARY_BASE = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'library');
const LIBRARY_FILE = path.join(LIBRARY_BASE, 'library.json');

export interface VinylData {
    id: string;
    title: string;
    artist: string;
    coverPath: string;
    createdAt: number;
}

export interface TrackData {
    id: string;
    vinylId: string;
    title: string;
    order: number;
    side: 'A' | 'B';
    diskNumber: number;
    audioPath: string;
}

export interface LibraryData {
    vinyls: VinylData[];
    tracks: TrackData[];
}

// GET: Return the global library
export async function GET() {
    try {
        // Ensure library folder exists
        await fs.mkdir(LIBRARY_BASE, { recursive: true });

        // Try to read library.json
        const libraryContent = await fs.readFile(LIBRARY_FILE, 'utf-8');
        const library: LibraryData = JSON.parse(libraryContent);

        return NextResponse.json({ exists: true, library });
    } catch {
        // Library doesn't exist yet - return empty
        const emptyLibrary: LibraryData = { vinyls: [], tracks: [] };
        return NextResponse.json({ exists: false, library: emptyLibrary });
    }
}

// POST: Save the global library
export async function POST(request: NextRequest) {
    console.log('[API/library POST] Received request');
    console.log('[API/library POST] LIBRARY_BASE:', LIBRARY_BASE);
    console.log('[API/library POST] LIBRARY_FILE:', LIBRARY_FILE);

    try {
        const body = await request.json();
        const { library }: { library: LibraryData } = body;

        console.log('[API/library POST] Library data:', library?.vinyls?.length || 0, 'vinyls,', library?.tracks?.length || 0, 'tracks');

        // Ensure library folder exists
        await fs.mkdir(LIBRARY_BASE, { recursive: true });
        console.log('[API/library POST] Directory ensured:', LIBRARY_BASE);

        // Save library.json
        await fs.writeFile(LIBRARY_FILE, JSON.stringify(library, null, 2));
        console.log('[API/library POST] File written successfully:', LIBRARY_FILE);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API/library POST] Error:', error);
        return NextResponse.json({ error: 'Failed to save library', details: String(error) }, { status: 500 });
    }
}
