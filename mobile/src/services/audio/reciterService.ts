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
