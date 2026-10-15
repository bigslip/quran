import fs from 'fs/promises';
import path from 'path';

// Directories
const DATA_DIR = path.join(process.cwd(), 'data/qdc');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public/data/qdc');
const SEARCH_OUTPUT_DIR = path.join(process.cwd(), 'public/data/search');
const BACKUP_SEARCH_OUTPUT_DIR = path.join(process.cwd(), 'data/search');

async function resolveDataFile(relPath: string): Promise<string> {
  const p1 = path.join(DATA_DIR, relPath);
  try {
    await fs.access(p1);
    return p1;
  } catch {
    return path.join(PUBLIC_DATA_DIR, relPath);
  }
}

// Popular Quranic Ayahs with rich search terms and descriptions
const POPULAR_AYAHS = [
  {
    key: '2:255',
    name: 'Ayatul Kursi (The Throne Verse)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    aliases: [
      'ayatul kursi',
      'ayat al kursi',
      'throne verse',
      'kursi',
      'آية الكرسي',
      '2:255',
      'allah there is no deity except him',
      'ایت الکرسی',
    ],
  },
  {
    key: '2:285',
    name: 'Amanar Rasul (The Messenger has Believed)',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ',
    aliases: ['amanar rasul', 'amanar rasool', 'amanna rasool', 'آمن الرسول', '2:285'],
  },
  {
    key: '2:286',
    name: 'La Yukallifullahu Nafsan (Al-Baqarah 286)',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    aliases: ['2:286', 'la yukallifullahu nafsan', 'end of baqarah', 'لا يكلف الله نفسا'],
  },
  {
    key: '3:18',
    name: 'Shahidallah (Allah Witnesses - 3:18)',
    arabic: 'شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ',
    aliases: ['3:18', 'shahidallah', 'شهد الله'],
  },
  {
    key: '3:26',
    name: 'Ayat al-Mulk (Say: O Allah, Owner of Sovereignty - 3:26)',
    arabic: 'قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ',
    aliases: ['3:26', 'ayat al mulk', 'qul allahumma malikal mulk', 'قل اللهم مالك الملك'],
  },
  {
    key: '9:128',
    name: 'Laqad Jaakum Rasoolun (At-Tawbah 128)',
    arabic: 'لَقَدْ جَاءَكُمْ رَسُولٌ مِنْ أَنْفُسِكُمْ',
    aliases: ['9:128', 'laqad jaakum rasul', 'لقد جاءكم رسول'],
  },
  {
    key: '18:10',
    name: 'Dua of Ashab al-Kahf (Al-Kahf 10)',
    arabic: 'رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً',
    aliases: ['18:10', 'kahf 10', 'rabbana atina min ladunka rahmah', 'ربنا آتنا من لدنك رحمة'],
  },
  {
    key: '18:110',
    name: 'Qul Innama Ana Basharun (Al-Kahf 110)',
    arabic: 'قُلْ إِنَّمَا أَنَا بَشَرٌ مِثْلُكُمْ',
    aliases: ['18:110', 'kahf 110', 'qul innama ana bashar', 'قل إنما أنا بشر مثلكم'],
  },
  {
    key: '21:87',
    name: 'Dua of Yunus / Ayat al-Karimah (21:87)',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    aliases: [
      '21:87',
      'dua yunus',
      'dua e yunus',
      'ayat kareema',
      'la ilaha illa anta subhanaka',
      'لا إله إلا أنت سبحانك',
    ],
  },
  {
    key: '24:35',
    name: 'Ayat an-Nur (The Light Verse - 24:35)',
    arabic: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
    aliases: [
      '24:35',
      'ayat an nur',
      'ayatun nur',
      'light verse',
      'allah is the light',
      'آية النور',
      'الله نور السماوات والأرض',
    ],
  },
  {
    key: '36:58',
    name: 'Salamun Qawlan (Yasin 58)',
    arabic: 'سَلَامٌ قَوْلًا مِنْ رَبٍّ رَحِيمٍ',
    aliases: [
      '36:58',
      'salamun qawlan',
      'yasin 58',
      'yaseen 58',
      'سلام قولا من رب رحيم',
      'peace a word from a merciful lord',
    ],
  },
  {
    key: '55:13',
    name: 'Fabiayyi Ala-i Rabbikuma Tukadhdhiban (Ar-Rahman 13)',
    arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    aliases: ['55:13', 'fabiayyi ala', 'which of the favors of your lord', 'فبأي آلاء ربكما تكذبان'],
  },
  {
    key: '59:22',
    name: 'Huwallahul Ladhi La Ilaha Illa Huwa (Al-Hashr 22)',
    arabic: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ',
    aliases: ['59:22', 'last verses of hashr', 'huwallahul ladhi', 'هو الله الذي لا إله إلا هو'],
  },
  {
    key: '67:1',
    name: 'Tabarakalladhi Biyadihil Mulk (Al-Mulk 1)',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
    aliases: ['67:1', 'mulk 1', 'tabarakalladhi', 'تبارك الذي بيده الملك'],
  },
  {
    key: '94:5',
    name: 'Fa Inna Maal Usri Yusra (Ash-Sharh 5)',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    aliases: ['94:5', 'with hardship comes ease', 'fa inna maal usri yusra', 'فإن مع العسر يسرا'],
  },
  {
    key: '112:1',
    name: 'Qul Huwallahu Ahad (Al-Ikhlas 1)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    aliases: ['112:1', 'ikhlas 1', 'qul huwallahu ahad', 'say he is allah one', 'قل هو الله أحد'],
  },
];

async function generateSearchIndex() {
  console.log('Generating offline search index...');

  // 1. Chapters
  const chaptersPath = await resolveDataFile('chapters.json');
  const chaptersData = JSON.parse(await fs.readFile(chaptersPath, 'utf-8'));
  const chapters = chaptersData.chapters || [];

  let chaptersFa: any[] = [];
  try {
    const faPath = await resolveDataFile('chapters_fa.json');
    const faData = JSON.parse(await fs.readFile(faPath, 'utf-8'));
    chaptersFa = faData.chapters || [];
  } catch {}

  let chaptersAr: any[] = [];
  try {
    const arPath = await resolveDataFile('chapters_ar.json');
    const arData = JSON.parse(await fs.readFile(arPath, 'utf-8'));
    chaptersAr = arData.chapters || [];
  } catch {}

  const chaptersIndex = chapters.map((ch: any) => {
    const faMatch = chaptersFa.find((f: any) => f.id === ch.id);
    const arMatch = chaptersAr.find((a: any) => a.id === ch.id);

    const aliases: string[] = [
      ch.name_simple.toLowerCase(),
      ch.name_complex.toLowerCase(),
      ch.name_arabic,
      ch.translated_name?.name?.toLowerCase() || '',
      `surah ${ch.name_simple.toLowerCase()}`,
      `surah ${ch.id}`,
      `chapter ${ch.id}`,
      String(ch.id),
    ];

    if (ch.slug?.slug) {
      aliases.push(ch.slug.slug.toLowerCase());
      aliases.push(ch.slug.slug.replace(/-/g, ' ').toLowerCase());
    }

    if (faMatch?.translated_name?.name) {
      aliases.push(faMatch.translated_name.name.toLowerCase());
    }
    if (arMatch?.name_arabic) {
      aliases.push(arMatch.name_arabic);
    }

    // Common romanization variations
    const cleanSimple = ch.name_simple.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    aliases.push(cleanSimple);

    return {
      type: 'surah',
      resultType: 'surah',
      id: ch.id,
      key: String(ch.id),
      name: ch.name_simple,
      nameArabic: ch.name_arabic,
      nameComplex: ch.name_complex,
      transliteratedName: ch.name_simple,
      translatedName: ch.translated_name?.name || '',
      revelationPlace: ch.revelation_place,
      versesCount: ch.verses_count,
      pages: ch.pages,
      slug: ch.slug?.slug,
      aliases: Array.from(new Set(aliases.filter(Boolean))),
    };
  });

  // 2. Juzs (1..30)
  const juzsIndex = Array.from({ length: 30 }, (_, i) => {
    const juzNumber = i + 1;
    return {
      type: 'juz',
      resultType: 'juz',
      id: juzNumber,
      key: String(juzNumber),
      juzNumber,
      name: `Juz ${juzNumber}`,
      nameArabic: `الجزء ${juzNumber}`,
      aliases: [
        `juz ${juzNumber}`,
        `j${juzNumber}`,
        `juz${juzNumber}`,
        `para ${juzNumber}`,
        `sipara ${juzNumber}`,
        `جزء ${juzNumber}`,
      ],
    };
  });

  // 3. Pages (1..604)
  let pagesLookup: any = null;
  try {
    const lookupPath = await resolveDataFile('pages-lookup-v2.json');
    pagesLookup = JSON.parse(await fs.readFile(lookupPath, 'utf-8'));
  } catch {}

  const pagesIndex = Array.from({ length: 604 }, (_, i) => {
    const pageNumber = i + 1;
    const pageData = pagesLookup?.pages?.[String(pageNumber)];
    return {
      type: 'page',
      resultType: 'page',
      id: pageNumber,
      key: String(pageNumber),
      pageNumber,
      name: `Page ${pageNumber}`,
      nameArabic: `صفحة ${pageNumber}`,
      firstVerseKey: pageData?.first_verse_key || '',
      lastVerseKey: pageData?.last_verse_key || '',
      aliases: [
        `page ${pageNumber}`,
        `p ${pageNumber}`,
        `p${pageNumber}`,
        `page${pageNumber}`,
        `صفحة ${pageNumber}`,
      ],
    };
  });

  // 4. Popular Ayahs
  const popularAyahsIndex = POPULAR_AYAHS.map((item) => ({
    type: 'ayah',
    resultType: 'ayah',
    key: item.key,
    name: item.name,
    arabic: item.arabic,
    aliases: item.aliases,
  }));

  // 5. Build core translation and verse summary for full-text search
  console.log('Loading verses and translations for full-text index...');
  const versesMap = new Map<string, any>();

  for (let page = 1; page <= 604; page++) {
    try {
      const pagePath = await resolveDataFile(`pages/${page}.json`);
      const pageData = JSON.parse(await fs.readFile(pagePath, 'utf-8'));
      for (const v of pageData.verses || []) {
        if (!versesMap.has(v.verse_key)) {
          const textUthmani = v.text_uthmani ||
            (v.words ? v.words.filter((w: any) => w.char_type_name === 'word').map((w: any) => w.text_uthmani).join(' ') : '');
          const textImlaeiSimple = v.text_imlaei_simple ||
            (v.words ? v.words.filter((w: any) => w.char_type_name === 'word').map((w: any) => w.text_imlaei_simple).join(' ') : '');

          versesMap.set(v.verse_key, {
            id: v.id,
            key: v.verse_key,
            verseKey: v.verse_key,
            verseNumber: v.verse_number,
            chapterId: Number(v.verse_key.split(':')[0]),
            pageNumber: v.page_number,
            juzNumber: v.juz_number,
            hizbNumber: v.hizb_number,
            textUthmani,
            textImlaeiSimple,
            enTranslation: '',
            faTranslation: '',
          });
        }
      }
    } catch {}
  }

  // Helper to attach translation text
  const attachTranslation = async (fileName: string, field: 'enTranslation' | 'faTranslation') => {
    try {
      const transPath = await resolveDataFile(`translations/${fileName}`);
      const transData = JSON.parse(await fs.readFile(transPath, 'utf-8'));
      if (transData.byVerseKey) {
        for (const [k, val] of Object.entries<any>(transData.byVerseKey)) {
          if (versesMap.has(k) && !versesMap.get(k)[field]) {
            versesMap.get(k)[field] = (val.text || '').replace(/<sup[^>]*>.*?<\/sup>/g, '');
          }
        }
      } else if (Array.isArray(transData.verses)) {
        for (const item of transData.verses) {
          if (item.translations && item.translations[0]) {
            const rawText = item.translations[0].text || '';
            const cleanText = rawText.replace(/<sup[^>]*>.*?<\/sup>/g, '');
            if (versesMap.has(item.verse_key) && !versesMap.get(item.verse_key)[field]) {
              versesMap.get(item.verse_key)[field] = cleanText;
            }
          }
        }
      }
    } catch {}
  };

  // Load English Translations (20 = Saheeh International, 84 = Taqi Usmani, 131)
  await attachTranslation('20.json', 'enTranslation');
  await attachTranslation('84.json', 'enTranslation');
  await attachTranslation('131.json', 'enTranslation');

  // Load Persian Translations (135 = IslamHouse, 29 = Hussein Dari, 136)
  await attachTranslation('135.json', 'faTranslation');
  await attachTranslation('29.json', 'faTranslation');
  await attachTranslation('136.json', 'faTranslation');

  const versesArray = Array.from(versesMap.values());

  const searchIndexPayload = {
    generatedAt: new Date().toISOString(),
    totalChapters: chaptersIndex.length,
    totalJuzs: juzsIndex.length,
    totalPages: pagesIndex.length,
    totalPopularAyahs: popularAyahsIndex.length,
    totalVerses: versesArray.length,
    chapters: chaptersIndex,
    juzs: juzsIndex,
    pages: pagesIndex,
    popularAyahs: popularAyahsIndex,
    verses: versesArray,
  };

  await fs.mkdir(SEARCH_OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(SEARCH_OUTPUT_DIR, 'search-index.json'),
    JSON.stringify(searchIndexPayload, null, 2),
  );

  await fs.mkdir(BACKUP_SEARCH_OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(BACKUP_SEARCH_OUTPUT_DIR, 'search-index.json'),
    JSON.stringify(searchIndexPayload, null, 2),
  );

  console.log(`✅ Offline search index generated with:
  - ${chaptersIndex.length} chapters
  - ${juzsIndex.length} juzs
  - ${pagesIndex.length} pages
  - ${popularAyahsIndex.length} popular ayahs
  - ${versesArray.length} indexed verses
  Saved to: public/data/search/search-index.json and data/search/search-index.json`);
}

generateSearchIndex().catch(console.error);
