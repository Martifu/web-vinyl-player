import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LIBRARY_BASE = path.join(process.cwd(), 'public', 'library');
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
    try {
        const body = await request.json();
        const { library }: { library: LibraryData } = body;

        // Ensure library folder exists
        await fs.mkdir(LIBRARY_BASE, { recursive: true });

        // Save library.json
        await fs.writeFile(LIBRARY_FILE, JSON.stringify(library, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving library:', error);
        return NextResponse.json({ error: 'Failed to save library' }, { status: 500 });
    }
}
