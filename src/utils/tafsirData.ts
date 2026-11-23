import { TOTAL_MUSHAF_PAGES, type MushafDataset } from './mushafData';

export type TafsirEditionId =
  | 'ar-tafsir-al-mukhtasar'
  | 'al-muyassar-fi-al-gharib'
  | 'ar-tafsir-muyassar'
  | 'ar-tafsir-as-saadi'
  | 'fath-al-qadir-al-shawkani';

export interface TafsirEditionMeta {
  id: TafsirEditionId;
  title: string;
  shortTitle: string;
  author: string;
  description: string;
}

export const DEFAULT_TAFSIR_EDITION_ID: TafsirEditionId = 'ar-tafsir-al-mukhtasar';
const TAFSIR_EDITION_STORAGE_KEY = 'talakah_tafsir_edition_v1';
const TAFSIR_FONT_SIZE_STORAGE_KEY = 'talakah_tafsir_font_size_v1';

export const TAFSIR_EDITIONS: readonly TafsirEditionMeta[] = [
  {
    id: 'ar-tafsir-al-mukhtasar',
    title: 'المختصر في التفسير',
    shortTitle: 'المختصر',
    author: 'مركز تفسير للدراسات القرآنية',
    description: 'تفسير مختصر ومباشر آية بآية، بأسلوب واضح قريب من زبدة التفسير.',
  },
  {
    id: 'al-muyassar-fi-al-gharib',
    title: 'الميسّر في غريب القرآن',
    shortTitle: 'غريب القرآن',
    author: 'نخبة من العلماء',
    description: 'بيان موجز لمعاني الألفاظ والمفردات القرآنية الصعبة فقط.',
  },
  {
    id: 'ar-tafsir-muyassar',
    title: 'التفسير الميسّر',
    shortTitle: 'الميسّر',
    author: 'مجمع الملك فهد لطباعة المصحف',
    description: 'تفسير ميسّر معتمد للآيات مع ذكر أسماء السور ومقاصدها.',
  },
  {
    id: 'ar-tafsir-as-saadi',
    title: 'تفسير السعدي',
    shortTitle: 'السعدي',
    author: 'الشيخ عبد الرحمن بن ناصر السعدي',
    description: 'تيسير الكريم الرحمن بأسلوب إيماني وتربوي سلس وعميق المعاني.',
  },
  {
    id: 'fath-al-qadir-al-shawkani',
    title: 'فتح القدير',
    shortTitle: 'فتح القدير',
    author: 'الإمام محمد بن علي الشوكاني',
    description: 'المرجع الجامع الذي اختُصر منه كتاب زبدة التفسير في الدراية والرواية.',
  },
];

export function isValidTafsirEditionId(value: string | null): value is TafsirEditionId {
  return Boolean(value && TAFSIR_EDITIONS.some((ed) => ed.id === value));
}

export function loadSavedTafsirEdition(): TafsirEditionId {
  if (typeof window === 'undefined') return DEFAULT_TAFSIR_EDITION_ID;
  try {
    const saved = window.localStorage.getItem(TAFSIR_EDITION_STORAGE_KEY);
    return isValidTafsirEditionId(saved) ? saved : DEFAULT_TAFSIR_EDITION_ID;
  } catch {
    return DEFAULT_TAFSIR_EDITION_ID;
  }
}

export function saveTafsirEdition(editionId: TafsirEditionId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TAFSIR_EDITION_STORAGE_KEY, editionId);
  } catch {
    // Ignore storage quota issues
  }
}

export function loadSavedTafsirFontSize(): number {
  if (typeof window === 'undefined') return 17;
  try {
    const raw = Number(window.localStorage.getItem(TAFSIR_FONT_SIZE_STORAGE_KEY));
    if (Number.isFinite(raw) && raw >= 14 && raw <= 24) return raw;
    return 17;
  } catch {
    return 17;
  }
}

export function saveTafsirFontSize(size: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TAFSIR_FONT_SIZE_STORAGE_KEY, String(size));
  } catch {
    // Ignore storage quota issues
  }
}

interface RawTafsirEntry {
  ayah?: number;
  surah?: number;
  text?: string;
}

type RawTafsirPayload = RawTafsirEntry[] | { ayahs?: RawTafsirEntry[] };

const surahTafsirCache = new Map<string, Map<number, string>>();
const surahTafsirInFlight = new Map<string, Promise<Map<number, string>>>();

export function cleanTafsirRawText(raw: string): string {
  return raw
    .replace(/[\u200A\u200B\u200C\u2060\uFEFF]/g, '')
    .replace(/(\S)\(p-[٠-٩0-9]+\)(\S)/g, '$1 $2')
    .replace(/\(p-[٠-٩0-9]+\)/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]*\n\s*\*\s*\*\s*\*\s*$/g, '')
    .replace(/؎/g, ' • ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchJsonWithFallback(urls: string[]): Promise<RawTafsirPayload> {
  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as RawTafsirPayload;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Failed to load tafsir');
    }
  }
  throw lastError ?? new Error('Failed to load tafsir');
}

export function getCachedSurahTafsir(
  editionId: TafsirEditionId,
  surahId: number
): Map<number, string> | null {
  return surahTafsirCache.get(`${editionId}:${surahId}`) ?? null;
}

export function fetchSurahTafsir(
  editionId: TafsirEditionId,
  surahId: number
): Promise<Map<number, string>> {
  const cacheKey = `${editionId}:${surahId}`;
  const cached = surahTafsirCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const pending = surahTafsirInFlight.get(cacheKey);
  if (pending) return pending;

  const urls = [
    `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${editionId}/${surahId}.json`,
    `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/${editionId}/${surahId}.json`,
  ];

  const promise = fetchJsonWithFallback(urls)
    .then((payload) => {
      const rows = Array.isArray(payload) ? payload : payload?.ayahs ?? [];
      const ayahMap = new Map<number, string>();
      for (const row of rows) {
        if (typeof row?.ayah === 'number' && typeof row?.text === 'string') {
          const cleaned = cleanTafsirRawText(row.text);
          if (cleaned) {
            ayahMap.set(row.ayah, cleaned);
          }
        }
      }
      surahTafsirCache.set(cacheKey, ayahMap);
      surahTafsirInFlight.delete(cacheKey);
      return ayahMap;
    })
    .catch((err) => {
      surahTafsirInFlight.delete(cacheKey);
      throw err;
    });

  surahTafsirInFlight.set(cacheKey, promise);
  return promise;
}

export function prefetchSurahTafsir(editionId: TafsirEditionId, surahId: number): void {
  const cacheKey = `${editionId}:${surahId}`;
  if (surahTafsirCache.has(cacheKey) || surahTafsirInFlight.has(cacheKey)) return;
  fetchSurahTafsir(editionId, surahId).catch(() => {
    // Ignore background prefetch errors; active fetch handles user-facing errors
  });
}

export interface ExtractedAyahInfo {
  text: string;
  pageNum: number | null;
}

export function extractAyahTextFromDataset(
  dataset: MushafDataset | null,
  surahId: number,
  ayahNum: number
): ExtractedAyahInfo {
  if (!dataset || !Array.isArray(dataset.pages)) {
    return { text: '', pageNum: null };
  }

  const surahMeta = dataset.surahs.find((s) => s.id === surahId);
  const startIdx = Math.max(0, (surahMeta?.startPage ?? 1) - 1);
  const parts: string[] = [];
  let foundPageNum: number | null = null;
  let collecting = false;

  for (let pIdx = startIdx; pIdx < Math.min(TOTAL_MUSHAF_PAGES, dataset.pages.length); pIdx++) {
    const rawPage = dataset.pages[pIdx];
    if (!rawPage) continue;

    for (const row of rawPage.rows) {
      if (row.k !== 't' || !row.r) continue;
      for (const run of row.r) {
        if (run.s === surahId && run.a === ayahNum) {
          collecting = true;
          if (foundPageNum === null) {
            foundPageNum = pIdx + 1;
          }
          const cleaned = run.t
            .replace(/\u06DE/g, '')
            .replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, '');
          if (cleaned) {
            parts.push(cleaned);
          }
          if (run.e === 1) {
            return { text: parts.join(' '), pageNum: pIdx + 1 };
          }
        } else if (collecting) {
          return { text: parts.join(' '), pageNum: foundPageNum };
        }
      }
    }
  }

  return { text: parts.join(' '), pageNum: foundPageNum };
}
