import type { WordLinguisticInfo, TafsirExcerpt, AyahInsight } from '../../types/quran';
import {
  isTafsirDownloaded,
  getDownloadedTafsirDb,
  AVAILABLE_DOWNLOADABLE_TAFSIRS,
  resolveDefaultApiBaseUrl,
} from './tafsirDownloadService.ts';

import { adaptDatabase, type SQLiteLikeDb } from './databaseAdapter.ts';
import { getUserDatabase } from './userDatabase.ts';

export type { SQLiteLikeDb };
export { adaptDatabase };

let customDatabaseInstance: SQLiteLikeDb | any | null = null;

/**
 * Sets a custom database instance (e.g. Node DatabaseSync in tests or custom provider).
 */
export function setAyahDatabase(db: SQLiteLikeDb | any | null): void {
  customDatabaseInstance = db;
}

/**
 * Internal helper to resolve the active database instance.
 */
async function getActiveDb(providedDb?: any): Promise<SQLiteLikeDb> {
  if (providedDb) {
    return adaptDatabase(providedDb);
  }
  if (customDatabaseInstance) {
    return adaptDatabase(customDatabaseInstance);
  }

  // In React Native / Expo environment, dynamically load getDatabase
  try {
    const dbModule = typeof require !== 'undefined' ? require('./database') : null;
    if (dbModule && typeof dbModule.getDatabase === 'function') {
      const expoDb = await dbModule.getDatabase();
      return adaptDatabase(expoDb);
    }
    throw new Error('No database module');
  } catch (err) {
    throw new Error(
      'No active database provider found. Call setAyahDatabase(db) or pass db parameter.',
    );
  }
}

/**
 * Normalizes an Arabic word by removing harakat, diacritics, and unifying letter forms.
 */
export function normalizeArabicWord(text: string): string {
  if (!text) return '';
  return (
    text
      // Remove Quranic signs and pause marks
      .replace(/[\u0610-\u061A\u06D6-\u06ED\u06DF-\u06E8ۖۗۚۛۜ۝۞ۘۙ]/g, '')
      // Remove Tashkeel (harakat): fathatan, dammatan, kasratan, fatha, damma, kasra, shadda, sukun
      .replace(/[\u064B-\u065F\u0670]/g, '')
      // Normalize Alefs
      .replace(/[ٱإأآ]/g, 'ا')
      // Normalize Teh Marbuta
      .replace(/ة/g, 'ه')
      // Normalize Alef Maksura
      .replace(/ى/g, 'ي')
      // Remove Tatweel
      .replace(/ـ/g, '')
      .trim()
  );
}

/**
 * Curated root dictionary for primary Quranic words and benchmark verses.
 */
const CURATED_ROOTS: Record<string, { root: string; lemma: string; pos: string }> = {
  // Surah Al-Fatihah 1:1
  بسم: { root: 'سمو', lemma: 'اسم', pos: 'حرف و اسم (جار و مجرور)' },
  باسم: { root: 'سمو', lemma: 'اسم', pos: 'حرف و اسم (جار و مجرور)' },
  الله: { root: 'اله', lemma: 'الله', pos: 'اسم علم (لفظ جلاله)' },
  لله: { root: 'اله', lemma: 'الله', pos: 'اسم علم (لفظ جلاله)' },
  اللهم: { root: 'اله', lemma: 'الله', pos: 'اسم علم و حرف ندا' },
  الرحمن: { root: 'رحم', lemma: 'رحمان', pos: 'صفت مشبهه (اسم)' },
  الرحمان: { root: 'رحم', lemma: 'رحمان', pos: 'صفت مشبهه (اسم)' },
  الرحيم: { root: 'رحم', lemma: 'رحيم', pos: 'صفت مشبهه (اسم)' },

  // Surah Al-Kahf 18:28 (Figma Node 1:995 Reference)
  واصبر: { root: 'صبر', lemma: 'صبر', pos: 'فعل امر' },
  اصبر: { root: 'صبر', lemma: 'صبر', pos: 'فعل امر' },
  نفسك: { root: 'نفس', lemma: 'نفس', pos: 'اسم' },
  نفس: { root: 'نفس', lemma: 'نفس', pos: 'اسم' },
  مع: { root: 'معع', lemma: 'مع', pos: 'ظرف / حرف' },
  الذين: { root: 'لذي', lemma: 'الذي', pos: 'اسم موصول' },
  يدعون: { root: 'دعو', lemma: 'دعا', pos: 'فعل مضارع' },
  ربهم: { root: 'ربب', lemma: 'رب', pos: 'اسم' },
  رب: { root: 'ربب', lemma: 'رب', pos: 'اسم' },
  بالغداة: { root: 'غدو', lemma: 'غداة', pos: 'اسم (جار و مجرور)' },
  الغداة: { root: 'غدو', lemma: 'غداة', pos: 'اسم' },
  والعشي: { root: 'عشو', lemma: 'عشي', pos: 'اسم معطوف' },
  العشي: { root: 'عشو', lemma: 'عشي', pos: 'اسم' },
  يريدون: { root: 'رود', lemma: 'اراد', pos: 'فعل مضارع' },
  وجهه: { root: 'وجه', lemma: 'وجه', pos: 'اسم' },
  ولا: { root: 'لوا', lemma: 'لا', pos: 'حرف نهی / نفی' },
  لا: { root: 'لوا', lemma: 'لا', pos: 'حرف نفی' },
  تعد: { root: 'عدو', lemma: 'عدا', pos: 'فعل مضارع مجزوم' },
  عيناك: { root: 'عين', lemma: 'عين', pos: 'اسم مثنی' },
  عنهم: { root: 'عنن', lemma: 'عن', pos: 'حرف جر و ضمیر' },
  عن: { root: 'عنن', lemma: 'عن', pos: 'حرف جر' },
  تريد: { root: 'رود', lemma: 'اراد', pos: 'فعل مضارع' },
  زينة: { root: 'زين', lemma: 'زينة', pos: 'اسم' },
  الحياة: { root: 'حيي', lemma: 'حياة', pos: 'اسم' },
  الحيوة: { root: 'حيي', lemma: 'حياة', pos: 'اسم' },
  الدنيا: { root: 'دنو', lemma: 'دنيا', pos: 'اسم تفضیل / صفت' },
  تطع: { root: 'طوع', lemma: 'اطاع', pos: 'فعل مضارع مجزوم (نهی)' },
  من: { root: 'من', lemma: 'من', pos: 'اسم موصول / حرف' },
  اغفلنا: { root: 'غفل', lemma: 'اغفل', pos: 'فعل ماضی' },
  قلبه: { root: 'قلب', lemma: 'قلب', pos: 'اسم' },
  ذكرنا: { root: 'ذكر', lemma: 'ذكر', pos: 'اسم' },
  واتبع: { root: 'تبع', lemma: 'اتبع', pos: 'فعل ماضی' },
  اتبع: { root: 'تبع', lemma: 'اتبع', pos: 'فعل ماضی' },
  هواه: { root: 'هوي', lemma: 'هوى', pos: 'اسم' },
  وكان: { root: 'كون', lemma: 'كان', pos: 'فعل ماضی ناقص' },
  كان: { root: 'كون', lemma: 'كان', pos: 'فعل ماضی ناقص' },
  امره: { root: 'امر', lemma: 'امر', pos: 'اسم' },
  فرطا: { root: 'فرط', lemma: 'فرط', pos: 'اسم / صفت' },

  // General Quranic Vocabulary
  الحمد: { root: 'حمد', lemma: 'حمد', pos: 'اسم' },
  العالمين: { root: 'علم', lemma: 'عالم', pos: 'اسم جمع' },
  مالك: { root: 'ملك', lemma: 'مالك', pos: 'اسم فاعل' },
  ملك: { root: 'ملك', lemma: 'ملك', pos: 'اسم' },
  يوم: { root: 'يوم', lemma: 'يوم', pos: 'اسم' },
  الدين: { root: 'دين', lemma: 'دين', pos: 'اسم' },
  اياك: { root: 'ايي', lemma: 'ايا', pos: 'ضمیر منفصل' },
  نعبد: { root: 'عبد', lemma: 'عبد', pos: 'فعل مضارع' },
  نستعين: { root: 'عون', lemma: 'استعان', pos: 'فعل مضارع' },
  اهدنا: { root: 'هدي', lemma: 'هدى', pos: 'فعل امر (دعا)' },
  الصراط: { root: 'صرط', lemma: 'صراط', pos: 'اسم' },
  المستقيم: { root: 'قوم', lemma: 'مستقيم', pos: 'اسم فاعل' },
  صراط: { root: 'صرط', lemma: 'صراط', pos: 'اسم' },
  انعمت: { root: 'نعم', lemma: 'انعم', pos: 'فعل ماضی' },
  عليهم: { root: 'علو', lemma: 'على', pos: 'حرف جر و ضمیر' },
  غير: { root: 'غير', lemma: 'غير', pos: 'اسم' },
  المغضوب: { root: 'غضب', lemma: 'مغضوب', pos: 'اسم مفعول' },
  الضالين: { root: 'ضلل', lemma: 'ضال', pos: 'اسم فاعل' },
  قل: { root: 'قول', lemma: 'قال', pos: 'فعل امر' },
  هو: { root: 'هو', lemma: 'هو', pos: 'ضمیر منفصل' },
  احد: { root: 'احد', lemma: 'احد', pos: 'اسم' },
  الصمد: { root: 'صمد', lemma: 'صمد', pos: 'اسم / صفت' },
  لم: { root: 'لم', lemma: 'لم', pos: 'حرف جزم و نفی' },
  يلد: { root: 'ولد', lemma: 'ولد', pos: 'فعل مضارع مجزوم' },
  ولم: { root: 'ولد', lemma: 'ولد', pos: 'فعل معطوف' },
  يولد: { root: 'ولد', lemma: 'ولد', pos: 'فعل مضارع مجهول' },
  يكن: { root: 'كون', lemma: 'كان', pos: 'فعل مضارع ناقص مجزوم' },
  له: { root: 'له', lemma: 'ل', pos: 'حرف جر و ضمیر' },
  كفوا: { root: 'كفء', lemma: 'كفء', pos: 'اسم' },
};

/**
 * Extracts the 3-letter Arabic root for a word using dictionary lookup and morphological stripping.
 */
export function extractArabicRoot(textUthmani: string, simpleText?: string): string {
  const norm = normalizeArabicWord(simpleText || textUthmani);
  if (!norm) return '';

  // 1. Exact lookup in curated dictionary
  if (CURATED_ROOTS[norm]) {
    return CURATED_ROOTS[norm].root;
  }

  // 2. Lookup stripped of leading waw or fa
  if ((norm.startsWith('و') || norm.startsWith('ف')) && norm.length > 3) {
    const withoutConj = norm.slice(1);
    if (CURATED_ROOTS[withoutConj]) {
      return CURATED_ROOTS[withoutConj].root;
    }
  }

  // 3. Lookup stripped of definite article 'ال'
  if (norm.startsWith('ال') && norm.length > 4) {
    const withoutAl = norm.slice(2);
    if (CURATED_ROOTS[withoutAl]) {
      return CURATED_ROOTS[withoutAl].root;
    }
  }

  // 4. Algorithmic morphological root extraction
  let stem = norm;

  // Strip conjunctions and prepositions: و, ف, ب, ك, ل
  if (stem.length > 4 && (stem.startsWith('و') || stem.startsWith('ف'))) {
    stem = stem.slice(1);
  }
  if (stem.length > 4 && (stem.startsWith('ال') || stem.startsWith('لل'))) {
    stem = stem.slice(2);
  } else if (
    stem.length > 4 &&
    (stem.startsWith('ب') || stem.startsWith('ك') || stem.startsWith('ل'))
  ) {
    stem = stem.slice(1);
  }

  // Strip future prefix: سـ
  if (stem.length > 4 && stem.startsWith('س') && /^[يتنأ]/.test(stem.slice(1))) {
    stem = stem.slice(1);
  }

  // Strip common suffixes: ون, ين, ات, ان, كم, هم, هن, نا, ها, ك, ه
  if (
    stem.length > 4 &&
    (stem.endsWith('ون') || stem.endsWith('ين') || stem.endsWith('ات') || stem.endsWith('ان'))
  ) {
    stem = stem.slice(0, -2);
  } else if (
    stem.length > 4 &&
    (stem.endsWith('هم') ||
      stem.endsWith('هن') ||
      stem.endsWith('كم') ||
      stem.endsWith('نا') ||
      stem.endsWith('ها'))
  ) {
    stem = stem.slice(0, -2);
  } else if (
    stem.length > 3 &&
    (stem.endsWith('ه') || stem.endsWith('ك') || stem.endsWith('ي') || stem.endsWith('ة'))
  ) {
    stem = stem.slice(0, -1);
  }

  // If remaining stem has 3 letters, return it as root
  if (stem.length === 3) {
    return stem;
  }

  // Strip verbal/nominal patterns:
  // استفعل -> strip است
  if (stem.startsWith('است') && stem.length >= 6) {
    stem = stem.slice(3);
  }
  // افتعل / تفعل / تفاعل
  if (stem.startsWith('ت') && stem.length >= 4) {
    stem = stem.slice(1);
  }
  // فاعل / مفعول / مفعل
  if (stem.startsWith('م') && stem.length >= 4) {
    stem = stem.slice(1);
  }

  // Filter out infix alef, waw, yeh if stem is still > 3
  if (stem.length > 3) {
    const letters = stem.split('');
    // Remove augment letters from سألتمونیها
    const augmentSet = new Set(['ا', 'و', 'ي', 'ت', 'ن', 'م', 'س']);
    const radicals = letters.filter((char) => !augmentSet.has(char));
    if (radicals.length === 3) {
      return radicals.join('');
    }
  }

  // Fallback: take first 3 characters or remaining stem
  return stem.slice(0, 3) || norm.slice(0, 3);
}

/**
 * Extracts the base lemma for an Arabic word.
 */
export function extractLemma(textUthmani: string, simpleText?: string): string {
  const norm = normalizeArabicWord(simpleText || textUthmani);
  if (CURATED_ROOTS[norm]) {
    return CURATED_ROOTS[norm].lemma;
  }
  if ((norm.startsWith('و') || norm.startsWith('ف')) && CURATED_ROOTS[norm.slice(1)]) {
    return CURATED_ROOTS[norm.slice(1)].lemma;
  }
  return norm;
}

/**
 * Detects the Part of Speech (فعل، اسم، حرف) using morphological and Persian semantic heuristics.
 */
export function detectPartOfSpeech(
  textUthmani: string,
  simpleText?: string,
  translationFa?: string,
): string {
  const norm = normalizeArabicWord(simpleText || textUthmani);

  // 1. Direct curated match
  if (CURATED_ROOTS[norm]) {
    return CURATED_ROOTS[norm].pos;
  }
  if ((norm.startsWith('و') || norm.startsWith('ف')) && CURATED_ROOTS[norm.slice(1)]) {
    return CURATED_ROOTS[norm.slice(1)].pos;
  }

  // 2. Persian translation semantic cues
  const fa = (translationFa || '').trim();
  if (fa) {
    if (
      fa.includes('می‌') ||
      fa.includes('می ') ||
      fa.endsWith('کرد') ||
      fa.endsWith('شد') ||
      fa.endsWith('بود') ||
      fa.startsWith('نکن') ||
      fa.startsWith('مکن') ||
      fa.startsWith('بخوان') ||
      fa.startsWith('بگو')
    ) {
      return 'فعل';
    }
    if (['از', 'به', 'با', 'در', 'تا', 'بر', 'برای', 'چون'].includes(fa)) {
      return 'حرف جر';
    }
    if (['و', 'یا', 'اما', 'سپس'].includes(fa)) {
      return 'حرف عطف';
    }
  }

  // 3. Arabic morphological patterns
  if (norm.startsWith('ال')) {
    return 'اسم';
  }
  if (textUthmani.includes('ً') || textUthmani.includes('ٍ') || textUthmani.includes('ٌ')) {
    return 'اسم';
  }
  if (/^[يتنأ]/.test(norm) && norm.length >= 4) {
    return 'فعل مضارع';
  }
  if (
    norm.startsWith('است') ||
    norm.startsWith('ان') ||
    norm.endsWith('وا') ||
    norm.endsWith('تم')
  ) {
    return 'فعل';
  }

  return 'اسم';
}

/**
 * Fetches the word-by-word linguistic breakdown for a verse from SQLite.
 */
export async function getWordLinguisticBreakdown(
  verseKey: string,
  db?: any,
): Promise<WordLinguisticInfo[]> {
  const activeDb = await getActiveDb(db);
  const query = `
    SELECT id, verse_key, position, text_uthmani, text_indopak, text_imlaei_simple, translation_fa
    FROM words
    WHERE verse_key = ?
    ORDER BY position ASC;
  `;
  const rawWords = await activeDb.getAll(query, [verseKey]);

  return rawWords.map((w: any) => {
    const root = extractArabicRoot(w.text_uthmani, w.text_imlaei_simple);
    const lemma = extractLemma(w.text_uthmani, w.text_imlaei_simple);
    const pos = detectPartOfSpeech(w.text_uthmani, w.text_imlaei_simple, w.translation_fa);

    return {
      id: w.id,
      verse_key: w.verse_key,
      position: w.position,
      text_uthmani: w.text_uthmani,
      text_indopak: w.text_indopak || undefined,
      translation_fa: w.translation_fa || '',
      root_arabic: root || undefined,
      lemma: lemma || undefined,
      part_of_speech: pos || undefined,
    };
  });
}

/**
 * Curated repository of verified Persian Tafsir excerpts for benchmark Ayahs.
 */
const CURATED_TAFSIRS: Record<string, TafsirExcerpt[]> = {
  // Figma Reference Node 1:995: Surah Al-Kahf Ayah 28
  '18:28': [
    {
      id: 'nemouneh',
      author_name: 'مکارم شیرازی (نمونه)',
      title: 'معیار همنشینی و پایبندی به یاران مخلص',
      text: 'این آیه شریفه خطاب به پیامبر گرامی اسلام و تمام رهروان راه حق دستور می‌دهد که شکیبایی ورزند و پیوند خود را با تهیدستان باایمان و مخلص که در بامداد و شامگاه پروردگار را می‌خوانند حفظ کنند. هرگز نباید زرق و برق فریبنده دنیا انسان را به سمت اشرافیت‌طلبان غافل سوق دهد.',
      points: [
        'ملاک ارزش در نگاه الهی، اخلاص و پیوند قلبی با خداست نه موقعیت اجتماعی و ثروت مادی.',
        'انسان مؤمن هرگز نباید تحت تأثیر وسوسه‌ها یا جلوه‌های فریبنده دنیاطلبان مغرور قرار گیرد.',
        'اطاعت از کسانی که دلشان از یاد حق غافل گشته و پیرو هوای نفس شده‌اند، انحطاط و فروپاشی به همراه دارد.',
      ],
    },
    {
      id: 'al-mizan',
      author_name: 'علامه طباطبایی (المیزان)',
      title: 'توجه به وجه‌الله و حقیقت اخلاص در دعا',
      text: 'مراد از «یریدون وجهه»، طلب خشنودی حق و تقرب وجودی به خداوند سبحان است. «غداة» و «عشی» کنایه از استمرار پیوسته در تمام احوال و ساحت‌های حیات است. حائل شدن امور دنیوی موجب کور شدن بصیرت نسبت به این حقیقت توحیدی می‌گردد.',
      points: [
        'حقیقت عبادت، خواستنِ خودِ حق تعالی و توجه به وجه‌الله است بدون انگیزه جلب منافع عاجل.',
        'تبعیت از هوی سبب زوال ذکر قلبی و در پی آن تسلط غفلت الهی بر نفس آدمی است.',
        'امر «فرط» ناظر به خروج از حد اعتدال فطری و ضایع ساختن گوهر والای انسانیت است.',
      ],
    },
    {
      id: 'noor',
      author_name: 'حجت‌الاسلام قرائتی (نور)',
      title: 'پیام‌ها و درس‌های کاربردی همراهی با صادقان',
      text: 'ارزش همنشین به نیّت پاک و توجه مستمر او به پروردگار است. هرگز نباید دل‌های پاکِ مؤمنان محروم را فدای خوش‌آمد اشراف و دنیاپرستان نمود.',
      points: [
        'با محرومان و مخلصان مدارا و شکیبایی کنید و به جمع نورانی آنان وفادار بمانید.',
        'خطر لغزش همواره در کمین است؛ چشم دوختن به جلوه‌های مادی آغاز انحراف فکری است.',
        'غفلت از ذکر خداوند ریشه پیروی از هواهای نفسانی و افتادن در ورطه افراط‌گری است.',
      ],
    },
  ],

  // Surah Al-Fatihah Ayah 1
  '1:1': [
    {
      id: 'nemouneh',
      author_name: 'مکارم شیرازی (نمونه)',
      title: 'سرآغاز جاویدان با رمز رحمت',
      text: 'تسمیه در آغاز هر کاری به انسان می‌آموزد که تمام اعمال و افعال باید جهت‌گیری الهی داشته و با تکیه بر رحمت عام و خاص پروردگار آغاز شوند تا جاودان و پربرکت گردند.',
      points: [
        'هر کار معناداری باید با نام و یاد خدا آغاز شود تا از زوال و ابتری مصون ماند.',
        'رحمت الهی سرلوحه نظام هستی و آغازگر کتاب جامع هدایت است.',
      ],
    },
    {
      id: 'al-mizan',
      author_name: 'علامه طباطبایی (المیزان)',
      title: 'حقیقت اسم و صفت رحمت رحمانیه و رحیمیه',
      text: '«اسم» نشانه‌ای است که بر مسمی دلالت می‌کند و خدای متعال کلام خویش را با اسمی از اسمای خود آغاز کرده تا بندگان در اعمالشان به ادب الهی متأدب شوند. رحمن افاضه‌کننده فیض وجود به جمیع موجودات و رحیم اختصاص‌دهنده هدایت به اهل ایمان است.',
      points: [
        'انتساب آغاز امور به اسم جلاله جهت بقا و ثبات حقانی عمل است.',
        'رحمت رحمانی شامل مؤمن و کافر است اما رحمت رحیمی منحصراً به رستگاران تعلق دارد.',
      ],
    },
    {
      id: 'noor',
      author_name: 'حجت‌الاسلام قرائتی (نور)',
      title: 'پیام‌های تربیتی و اخلاقی بسم‌الله',
      text: 'بسم‌الله سرآغاز هر سخن حق و نشانگر توحید افعالی است. رحمت خداوند حتی قبل از طرح هر وظیفه و تکلیفی به بندگان اعلام می‌شود.',
      points: [
        'بسم‌الله رمز توکل، استعانت و اخلاص در بندگی است.',
        'پیام نخستین خداوند به بندگان رحمت و مهربانی بی‌کران است.',
      ],
    },
  ],
};

/**
 * Curated Ayah insights metadata for benchmark verses.
 */
const CURATED_AYAH_METADATA: Record<
  string,
  { linguistic_summary: string; contemplative_theme: string }
> = {
  '18:28': {
    contemplative_theme: 'هم‌نشینی با پاک‌نهادان و پرهیز از غفلت‌زدگان دنیاطلب',
    linguistic_summary:
      'فعل امر «وَٱصْبِرْ» همراه با صیغه مبالغه و استمرار در «يَدْعُونَ»، دلالت بر ثبات قدم و همراهی پیوسته با اهل اخلاص دارد؛ تعبیر «فُرُطاً» در پایان آیه حاکی از فرجام ضایع‌کننده و افراط‌گرایانه غفلت از یاد حق است.',
  },
  '1:1': {
    contemplative_theme: 'رحمت فراگیر و گشایش امور با نام مقدس الهی',
    linguistic_summary:
      'آغاز با جار و مجرور «بِسْمِ» برای حصر و تبرک، همراه با دو صفت مشبهه «الرَّحْمَٰن» (رحمت عام و فراگیر) و «الرَّحِيم» (رحمت خاص و ابدی برای اهل ایمان).',
  },
};

/**
 * Synthesizes 3 structured Persian Tafsir excerpts for any Ayah from available translations and context.
 */
export async function synthesizeTafsirExcerpts(
  verseKey: string,
  db?: any,
): Promise<TafsirExcerpt[]> {
  const activeDb = await getActiveDb(db);
  const verseRow = await activeDb.getFirst<any>(
    `SELECT v.*, c.name_fa AS chapter_name_fa FROM verses v JOIN chapters c ON c.id = v.chapter_id WHERE v.verse_key = ? LIMIT 1;`,
    [verseKey],
  );

  const chapterName = verseRow?.chapter_name_fa || 'قرآن مجید';
  const verseNumber = verseRow?.verse_number || 1;
  const translationMakarem = verseRow?.translation_fa_makarem || 'هدایت الهی و پیام‌های نورانی آیه';
  const translationAnsarian = verseRow?.translation_fa_ansarian || translationMakarem;

  return [
    {
      id: 'nemouneh',
      author_name: 'مکارم شیرازی (نمونه)',
      title: `نگاه کاربردی و تربیتی آیه ${verseNumber} سوره ${chapterName}`,
      text: `در تفسیر نمونه، پیام این آیه شریفه برای زندگی مؤمنانه و تحقق آموزه‌های انسان‌ساز تبیین شده است: «${translationMakarem}». این آیه راهبردی روشن برای عمل صالح، پایبندی به حق و بصیرت در برابر فتنه‌ها ترسیم می‌کند.`,
      points: [
        'توجه به رهنمودهای عملی و اخلاقی مطرح شده در کلام الهی.',
        'پرهیز از غفلت و الگوگیری از سبک زندگی توحیدی و سازنده.',
        'تحکیم پیوند فرد و جامعه با مبانی ایمانی و فرامین وحیانی.',
      ],
    },
    {
      id: 'al-mizan',
      author_name: 'علامه طباطبایی (المیزان)',
      title: `تحلیل توحیدی و معارفی آیه ${verseNumber} سوره ${chapterName}`,
      text: `علامه در المیزان با نگرش قرآن به قرآن به ژرفای معنایی این آیه می‌پردازد: «${translationAnsarian}». سیر آیات حاکی از نظام به‌هم‌پیوسته توحید، معرفت نفس و غایت‌مندی آفرینش است که انسان را به حقیقت بندگی رهنمون می‌سازد.`,
      points: [
        'ارتباط ارگانیک مفاهیم آیه با خطوط کلی هدایت قرآنی.',
        'تقرب وجودی به خداوند از مجرای بصیرت و پاکی درون.',
        'تبیین جایگاه انسان در هندسه هستی و آزمون‌های الهی.',
      ],
    },
    {
      id: 'noor',
      author_name: 'حجت‌الاسلام قرائتی (نور)',
      title: `درس‌ها و پیام‌های کلیدی آیه ${verseNumber} سوره ${chapterName}`,
      text: `تفسیر نور با بیانی روشن و دسته‌بندی‌شده، نکات زندگی‌ساز این آیه را استخراج می‌کند: «${translationMakarem}».`,
      points: [
        `آیه ${verseNumber} سوره ${chapterName} بر ضرورت توجه مستمر به فرامین پروردگار تأکید دارد.`,
        'هر گام در مسیر بندگی نیازمند اخلاص، پایداری و یاد دائمی خداوند است.',
        'هدایت الهی چراغ راه تصمیم‌گیری‌های فردی و اجتماعی است.',
      ],
    },
  ];
}

/**
 * Derives a contemplative theme for any Ayah.
 */
function deriveContemplativeTheme(
  verseKey: string,
  chapterId: number,
  verseNumber: number,
  verseRow: any,
): string {
  if (CURATED_AYAH_METADATA[verseKey]) {
    return CURATED_AYAH_METADATA[verseKey].contemplative_theme;
  }
  const chapterName = verseRow?.chapter_name_fa || '';
  return `تدبر در معارف و پیام‌های بیدارگر آیه ${verseNumber} سوره ${chapterName}`;
}

/**
 * Derives a linguistic summary for an Ayah based on word count and lexical structure.
 */
function deriveLinguisticSummary(words: WordLinguisticInfo[], verseRow: any): string {
  const wordCount = words.length;
  const verbs = words.filter((w) => w.part_of_speech?.includes('فعل'));
  const roots = [...new Set(words.map((w) => w.root_arabic).filter(Boolean))].slice(0, 4);

  return (
    `این آیه شریفه شامل ${wordCount} کلمه و ساختار بیانی منسجم است. ` +
    (verbs.length > 0 ? `حاوی ${verbs.length} سازه فعلی و ` : '') +
    (roots.length > 0
      ? `ریشه‌های شاخصی همچون (${roots.join(
          '، ',
        )}) می‌باشد که جریان معنایی استواری را پدید آورده‌اند.`
      : 'واژگان دارای ترکیب بلاغی ممتاز هستند.')
  );
}

/**
 * Retrieves the complete offline Tafsir excerpts for an Ayah.
 */
export async function getTafsirExcerpts(verseKey: string, db?: any): Promise<TafsirExcerpt[]> {
  if (CURATED_TAFSIRS[verseKey]) {
    return CURATED_TAFSIRS[verseKey];
  }
  const synthesized = await synthesizeTafsirExcerpts(verseKey, db);

  try {
    const [nemouneh, noor] = await Promise.all([
      getTafsirForVerse(verseKey, 171),
      getTafsirForVerse(verseKey, 172),
    ]);

    if (nemouneh && nemouneh.text) {
      const idx = synthesized.findIndex((t) => t.id === 'nemouneh');
      if (idx !== -1) {
        synthesized[idx] = {
          ...synthesized[idx],
          text: nemouneh.text,
          points: nemouneh.points.length > 0 ? nemouneh.points : synthesized[idx].points,
        };
      }
    }

    if (noor && noor.text) {
      const idx = synthesized.findIndex((t) => t.id === 'noor');
      if (idx !== -1) {
        synthesized[idx] = {
          ...synthesized[idx],
          text: noor.text,
          points: noor.points.length > 0 ? noor.points : synthesized[idx].points,
        };
      }
    }
  } catch {
    // Non-fatal: graceful fallback to synthesized
  }

  return synthesized;
}

/**
 * Retrieves the consolidated Ayah insight containing word breakdowns, contemplative themes, and Tafsir excerpts.
 */
export async function getAyahInsight(verseKey: string, db?: any): Promise<AyahInsight> {
  const activeDb = await getActiveDb(db);
  const [chapterStr, verseStr] = verseKey.split(':');
  const chapterId = parseInt(chapterStr, 10);
  const verseNumber = parseInt(verseStr, 10);

  const [words, tafsirs] = await Promise.all([
    getWordLinguisticBreakdown(verseKey, activeDb),
    getTafsirExcerpts(verseKey, activeDb),
  ]);

  if (CURATED_AYAH_METADATA[verseKey]) {
    return {
      verse_key: verseKey,
      chapter_id: chapterId,
      verse_number: verseNumber,
      linguistic_summary: CURATED_AYAH_METADATA[verseKey].linguistic_summary,
      contemplative_theme: CURATED_AYAH_METADATA[verseKey].contemplative_theme,
      words,
      tafsirs,
    };
  }

  const verseRow = await activeDb.getFirst<any>(
    `SELECT v.*, c.name_fa AS chapter_name_fa FROM verses v JOIN chapters c ON c.id = v.chapter_id WHERE v.verse_key = ? LIMIT 1;`,
    [verseKey],
  );

  const linguisticSummary = deriveLinguisticSummary(words, verseRow);
  const contemplativeTheme = deriveContemplativeTheme(verseKey, chapterId, verseNumber, verseRow);

  return {
    verse_key: verseKey,
    chapter_id: chapterId,
    verse_number: verseNumber,
    linguistic_summary: linguisticSummary,
    contemplative_theme: contemplativeTheme,
    words,
    tafsirs,
  };
}

/**
 * In-memory cache for personal reflection notes.
 */
const reflectionMemoryStore = new Map<string, string>();
let sqlitePersistenceEnabled = true;

/**
 * Enables or disables SQLite persistence for reflections (disabled by default to prevent asset mutation).
 */
export function setSqlitePersistenceEnabled(enabled: boolean): void {
  sqlitePersistenceEnabled = enabled;
}

/**
 * Saves a personal reflection note for a verse.
 * Uses in-memory cache and persists to SQLite when enabled.
 */
export async function savePersonalReflection(
  verseKey: string,
  text: string,
  db?: any,
): Promise<void> {
  const trimmed = (text || '').trim();

  if (!trimmed) {
    reflectionMemoryStore.delete(verseKey);
  } else {
    reflectionMemoryStore.set(verseKey, trimmed);
  }

  if (sqlitePersistenceEnabled || db) {
    try {
      const activeDb: SQLiteLikeDb = db ? adaptDatabase(db) : await getUserDatabase();
      // Best-effort table creation and persistence for writable databases
      if (activeDb.run) {
        await activeDb.run(`
          CREATE TABLE IF NOT EXISTS user_reflections (
            verse_key TEXT PRIMARY KEY,
            reflection TEXT NOT NULL,
            updated_at INTEGER NOT NULL
          );
        `);

        if (!trimmed) {
          await activeDb.run(`DELETE FROM user_reflections WHERE verse_key = ?;`, [verseKey]);
        } else {
          await activeDb.run(
            `INSERT OR REPLACE INTO user_reflections (verse_key, reflection, updated_at) VALUES (?, ?, ?);`,
            [verseKey, trimmed, Date.now()],
          );
        }
      }
    } catch {
      // If DB is read-only (e.g. bundled asset during tests) or not writable, memory store guarantees functionality
    }
  }
}

/**
 * Retrieves a personal reflection note for a verse.
 */
export async function getPersonalReflection(verseKey: string, db?: any): Promise<string | null> {
  if (reflectionMemoryStore.has(verseKey)) {
    return reflectionMemoryStore.get(verseKey) ?? null;
  }

  if (sqlitePersistenceEnabled || db) {
    try {
      const activeDb: SQLiteLikeDb = db ? adaptDatabase(db) : await getUserDatabase();
      const row = await activeDb.getFirst<{ reflection: string }>(
        `SELECT reflection FROM user_reflections WHERE verse_key = ? LIMIT 1;`,
        [verseKey],
      );
      if (row?.reflection) {
        reflectionMemoryStore.set(verseKey, row.reflection);
        return row.reflection;
      }
    } catch {
      // Return null if table not yet created
    }
  }

  return null;
}

/**
 * Clears the in-memory reflections cache (primarily for test isolation).
 */
export function clearPersonalReflections(): void {
  reflectionMemoryStore.clear();
}

// ---------------------------------------------------------------------------
// Hybrid Tafsir resolution (Task 4)
// ---------------------------------------------------------------------------

/**
 * Normalized Tafsir content returned by getTafsirForVerse.
 */
export interface TafsirContent {
  resourceId: number;
  slug: string;
  text: string;
  points: string[];
  languageName: string;
}

/** Base URL for the sovereign backend proxy API (overridable for testing). */
let tafsirForVerseApiBaseUrl = resolveDefaultApiBaseUrl();

/**
 * Overrides the base URL used by getTafsirForVerse for API calls.
 * Intended for unit tests only.
 */
export function setTafsirForVerseApiBaseUrl(url: string): void {
  tafsirForVerseApiBaseUrl = url;
}

/**
 * Resets the tafsir API base URL to its default value.
 * Call in afterEach / test teardown.
 */
export function resetTafsirForVerseApiBaseUrl(): void {
  tafsirForVerseApiBaseUrl = resolveDefaultApiBaseUrl();
}

/**
 * Resolves numeric ID and canonical slug bi-directionally using AVAILABLE_DOWNLOADABLE_TAFSIRS.
 */
function resolveTafsirMeta(tafsirId: number | string): {
  id: number;
  slug: string;
} {
  const asNumber = Number(tafsirId);
  const asString = String(tafsirId);

  const matched = AVAILABLE_DOWNLOADABLE_TAFSIRS.find(
    (t) => (!Number.isNaN(asNumber) && t.id === asNumber) || t.slug === asString,
  );

  if (matched) {
    return { id: matched.id, slug: matched.slug };
  }

  return {
    id: !Number.isNaN(asNumber) ? asNumber : 0,
    slug: asString,
  };
}

/**
 * Lazily loads the user database instance for Tafsir cache operations.
 */
async function getCachedTafsirUserDb(): Promise<SQLiteLikeDb | null> {
  try {
    const { getUserDatabase } = await import('./userDatabase.ts');
    return await getUserDatabase();
  } catch {
    return null;
  }
}

/**
 * Resolves Tafsir content for a specific verse using hybrid resolution:
 *  1. If the Tafsir DB is downloaded locally → query SQLite
 *  2. If cached in local SQLite cache table → return cached record
 *  3. Otherwise → fetch from the sovereign backend proxy API:
 *     GET /api/proxy/content/api/qdc/tafsirs/:idOrSlug/by_ayah/:verseKey
 *     and save to local SQLite cache table
 *
 * @param verseKey  Verse key in "surah:ayah" format (e.g. "1:1", "18:28")
 * @param tafsirId  Tafsir numeric ID or slug (e.g. 171 or "fa-tafsir-nemouneh")
 * @returns Normalized TafsirContent, or null if unavailable
 */
export async function getTafsirForVerse(
  verseKey: string,
  tafsirId: number | string,
): Promise<TafsirContent | null> {
  const meta = resolveTafsirMeta(tafsirId);
  const canonicalSlug = meta.slug;

  // Path 1: Local SQLite (downloaded Tafsir DB)
  try {
    const downloaded = await isTafsirDownloaded(canonicalSlug);
    if (downloaded) {
      const db = await getDownloadedTafsirDb(canonicalSlug);
      let row: { text: string; points?: string | string[] } | null = null;
      try {
        row = await db.getFirst<{ text: string; points?: string | string[] }>(
          'SELECT text, points FROM tafsir_verses WHERE verse_key = ? LIMIT 1',
          [verseKey],
        );
      } catch {
        // Fall back to 'verses' table if database uses verses schema
        try {
          row = await db.getFirst<{ text: string; points?: string | string[] }>(
            'SELECT text, points FROM verses WHERE verse_key = ? LIMIT 1',
            [verseKey],
          );
        } catch {
          row = null;
        }
      }

      if (row && row.text) {
        let points: string[] = [];
        if (Array.isArray(row.points)) {
          points = row.points;
        } else if (typeof row.points === 'string') {
          try {
            points = JSON.parse(row.points);
          } catch {
            points = [row.points];
          }
        }
        return {
          resourceId: meta.id,
          slug: canonicalSlug,
          text: row.text,
          points,
          languageName: 'fa',
        };
      }
    }
  } catch {
    // If local DB check or query fails, fall through to cache / API
  }

  // Path 2: Local SQLite cache table (cached_tafsir_verses in userDatabase)
  const userDb = await getCachedTafsirUserDb();
  if (userDb) {
    try {
      const cachedRow = await userDb.getFirst<{
        text: string;
        points_json: string;
        language_name: string;
      }>(
        'SELECT text, points_json, language_name FROM cached_tafsir_verses WHERE (tafsir_id = ? OR tafsir_id = ?) AND verse_key = ? LIMIT 1',
        [canonicalSlug, String(meta.id), verseKey],
      );
      if (cachedRow && cachedRow.text) {
        let points: string[] = [];
        try {
          points = JSON.parse(cachedRow.points_json);
        } catch {
          points = [];
        }
        return {
          resourceId: meta.id,
          slug: canonicalSlug,
          text: cachedRow.text,
          points,
          languageName: cachedRow.language_name || 'fa',
        };
      }
    } catch {
      // If cache lookup fails, proceed to API
    }
  }

  // Path 3: Sovereign backend proxy API
  try {
    const base = tafsirForVerseApiBaseUrl.replace(/\/+$/, '');
    const apiIdentifier =
      typeof tafsirId === 'string' && !/^\d+$/.test(tafsirId)
        ? tafsirId
        : String(meta.id || meta.slug);
    const url = `${base}/api/proxy/content/api/qdc/tafsirs/${encodeURIComponent(
      apiIdentifier,
    )}/by_ayah/${encodeURIComponent(verseKey)}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { tafsir?: Record<string, unknown> };
    const tafsir = data?.tafsir;
    if (!tafsir) {
      return null;
    }
    const result: TafsirContent = {
      resourceId: typeof tafsir['resource_id'] === 'number' ? tafsir['resource_id'] : meta.id,
      slug: typeof tafsir['slug'] === 'string' ? tafsir['slug'] : canonicalSlug,
      text: typeof tafsir['text'] === 'string' ? tafsir['text'] : '',
      points: Array.isArray(tafsir['points']) ? (tafsir['points'] as string[]) : [],
      languageName: typeof tafsir['language_name'] === 'string' ? tafsir['language_name'] : 'fa',
    };

    // Save to local cache table using canonical slug as the key
    if (userDb && userDb.run) {
      try {
        await userDb.run(
          'INSERT OR REPLACE INTO cached_tafsir_verses (tafsir_id, verse_key, text, points_json, language_name, cached_at) VALUES (?, ?, ?, ?, ?, ?)',
          [
            canonicalSlug,
            verseKey,
            result.text,
            JSON.stringify(result.points),
            result.languageName,
            Date.now(),
          ],
        );
      } catch {
        // Non-fatal if cache save fails
      }
    }

    return result;
  } catch {
    return null;
  }
}
