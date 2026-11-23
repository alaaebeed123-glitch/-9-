import type { AnnotationStroke } from './types';

const IDB_NAME = 'safara_annotations_db';
const IDB_VERSION = 1;
const STORE_SURFACES = 'surfaces';

interface SurfaceIdbRecord {
  surfaceId: string;
  strokes: AnnotationStroke[];
  updatedAt: number;
}

export interface SurfacePersistChange {
  surfaceId: string;
  strokes: AnnotationStroke[];
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openAnnotationsDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error('IndexedDB is unavailable in this environment'));
  }
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_SURFACES)) {
          db.createObjectStore(STORE_SURFACES, { keyPath: 'surfaceId' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error('Failed to open annotations IndexedDB'));
      };
      req.onblocked = () => {
        dbPromise = null;
        reject(new Error('Annotations IndexedDB open was blocked'));
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

export async function loadAllSurfacesFromIdb(): Promise<Record<string, AnnotationStroke[]>> {
  const db = await openAnnotationsDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_SURFACES, 'readonly');
      const store = tx.objectStore(STORE_SURFACES);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = (req.result ?? []) as SurfaceIdbRecord[];
        const out: Record<string, AnnotationStroke[]> = {};
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row && typeof row.surfaceId === 'string' && Array.isArray(row.strokes) && row.strokes.length > 0) {
            out[row.surfaceId] = row.strokes;
          }
        }
        resolve(out);
      };
      req.onerror = () => {
        reject(req.error ?? new Error('Failed to read annotations from IndexedDB'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

export async function saveSurfacesBatchToIdb(changes: SurfacePersistChange[]): Promise<void> {
  if (changes.length === 0) return;
  const db = await openAnnotationsDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_SURFACES, 'readwrite');
      const store = tx.objectStore(STORE_SURFACES);
      const now = Date.now();
      for (let i = 0; i < changes.length; i++) {
        const item = changes[i];
        if (!item.strokes || item.strokes.length === 0) {
          store.delete(item.surfaceId);
        } else {
          const record: SurfaceIdbRecord = {
            surfaceId: item.surfaceId,
            strokes: item.strokes,
            updatedAt: now,
          };
          store.put(record);
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB write aborted'));
    } catch (err) {
      reject(err);
    }
  });
}

export function isQuotaExceededError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number; message?: string };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014 ||
    (typeof e.message === 'string' && /quota/i.test(e.message))
  );
}
