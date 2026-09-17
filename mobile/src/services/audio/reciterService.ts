export type ReciterStyle = 'Murattal' | 'Mujawwad';

export interface Reciter {
  id: number;
  name: string;
  nameFa: string;
  style: ReciterStyle;
  styleFa: string;
  qirat: string;
  qiratFa: string;
}

export const AVAILABLE_RECITERS: Reciter[] = [
  {
    id: 201,
    name: 'Shahriar Parhizgar',
    nameFa: 'استاد شهریار پرهیزگار',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 7,
    name: 'Mishari Rashid al-Afasy',
    nameFa: 'مشاری راشد العفاسی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 9,
    name: 'Mohamed Siddiq al-Minshawi',
    nameFa: 'محمد صدیق منشاوی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 202,
    name: 'Mahmoud Khalil Al-Husary',
    nameFa: 'محمود خلیل الحصری',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 203,
    name: 'Karim Mansouri',
    nameFa: 'استاد کریم منصوری',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 204,
    name: 'Hamed Shakernejad',
    nameFa: 'استاد حامد شاکرنژاد',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 205,
    name: 'Abbas Emamjomeh',
    nameFa: 'استاد عباس امام‌جمعه',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 206,
    name: 'Mohammad Hossein Saeidian',
    nameFa: 'استاد محمدحسین سعیدیان',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 207,
    name: 'Ahmad Abolghasemi',
    nameFa: 'استاد احمد ابوالقاسمی',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 208,
    name: 'Mahdi Foroughi',
    nameFa: 'استاد مهدی فروغی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 2,
    name: 'AbdulBaset AbdulSamad',
    nameFa: 'عبدالباسط عبدالصمد',
    style: 'Mujawwad',
    styleFa: 'تحقیق',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 3,
    name: 'Abdur-Rahman as-Sudais',
    nameFa: 'عبدالرحمن السدیس',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 4,
    name: 'Abu Bakr al-Shatri',
    nameFa: 'ابوبکر الشاطری',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 6,
    name: 'Hani ar-Rifai',
    nameFa: 'هانی الرفاعی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 10,
    name: 'Saud ash-Shuraym',
    nameFa: 'سعود الشریم',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
  {
    id: 12,
    name: 'Maher Al Muaiqly',
    nameFa: 'ماهر المعیقلی',
    style: 'Murattal',
    styleFa: 'ترتیل',
    qirat: 'Hafs',
    qiratFa: 'حفص از عاصم',
  },
];

export const DEFAULT_RECITER_ID = 201;

export const EVERYAYAH_BASE_URL = 'https://everyayah.com/data';

/**
 * Mapping of reciter IDs to verified EveryAyah audio folder directories.
 * Iranian masters without an individual EveryAyah directory fall back gracefully
 * to Ostad Shahriar Parhizgar (Parhizgar_48kbps) to ensure audio always plays.
 */
export const RECITER_AUDIO_SUBPATHS: Record<number, string> = {
  201: 'Parhizgar_48kbps',
  7: 'Alafasy_128kbps',
  9: 'Minshawy_Murattal_128kbps',
  202: 'Husary_128kbps',
  203: 'Karim_Mansoori_40kbps',
  204: 'Parhizgar_48kbps', // fallback for Shakernejad
  205: 'Parhizgar_48kbps', // fallback for Emamjomeh
  206: 'Parhizgar_48kbps', // fallback for Saeidian
  207: 'Parhizgar_48kbps', // fallback for Dabbagh
  208: 'Parhizgar_48kbps', // fallback for Raziye
  209: 'Parhizgar_48kbps', // fallback for Foroughi
  1: 'Abdul_Basit_Murattal_192kbps',
  2: 'Abdul_Basit_Mujawwad_128kbps',
  4: 'Abu_Bakr_Ash-Shaatree_128kbps',
  6: 'Husary_Muallim_128kbps',
  12: 'MaherAlMuaiqly128kbps',
};

/**
 * Formats canonical 3-digit chapter and 3-digit verse numbers into an MP3 file name.
 * e.g., (1, 1) -> '001001.mp3', (18, 28) -> '018028.mp3'
 */
export function formatVerseAudioFilename(chapterId: number, verseNumber: number): string {
  const ch = String(chapterId).padStart(3, '0');
  const v = String(verseNumber).padStart(3, '0');
  return `${ch}${v}.mp3`;
}

/**
 * Resolves full CDN streaming URL for a specific verse and reciter.
 */
export function getVerseAudioUrl(reciterId: number, chapterId: number, verseNumber: number): string {
  const subpath = RECITER_AUDIO_SUBPATHS[reciterId] || RECITER_AUDIO_SUBPATHS[DEFAULT_RECITER_ID];
  const filename = formatVerseAudioFilename(chapterId, verseNumber);
  return `${EVERYAYAH_BASE_URL}/${subpath}/${filename}`;
}

export function getReciterById(id: number): Reciter {
  const found = AVAILABLE_RECITERS.find((r) => r.id === id);
  return found || AVAILABLE_RECITERS[0];
}

export function searchReciters(
  query: string,
  style: 'all' | ReciterStyle = 'all'
): Reciter[] {
  const normalizedQuery = query.trim().toLowerCase();

  return AVAILABLE_RECITERS.filter((reciter) => {
    if (style !== 'all' && reciter.style !== style) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      reciter.name.toLowerCase().includes(normalizedQuery) ||
      reciter.nameFa.includes(normalizedQuery) ||
      reciter.styleFa.includes(normalizedQuery)
    );
  });
}
