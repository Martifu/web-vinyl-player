import Dexie, { type EntityTable } from 'dexie';

export interface Vinyl {
  id: string; // uuid
  title: string;
  artist: string;
  userName?: string; // Optional - library is now global
  coverImage: string; // base64 or url
  coverFront?: Blob | string; // Optional - for backwards compat
  createdAt: number;
}

export interface Track {
  id: string;
  vinylId: string;
  title: string;
  order: number;
  side: 'A' | 'B';
  diskNumber: number; // Support multi-disk albums
  duration?: string;
  audioSrc?: string; // base64 data URL
}

const db = new Dexie('VinylPlayerDB') as Dexie & {
  vinyls: EntityTable<Vinyl, 'id'>;
  tracks: EntityTable<Track, 'id'>;
  // Legacy support if needed, but we try to move to vinyls
  disks: EntityTable<Vinyl, 'id'>;
};

// Schema declaration:
db.version(5).stores({
  vinyls: 'id, title, artist, userName, createdAt',
  tracks: 'id, vinylId, order, diskNumber', // Index diskNumber
  // 'disks' table is deprecated and will be dropped. Code uses db.vinyls
});

// Alias for compatibility if we want to use 'disks' table as 'vinyls'
db.disks = db.vinyls;

export { db };
