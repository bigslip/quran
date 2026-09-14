import AvailableTranslation from 'types/AvailableTranslation';

/**
 * Country flag emojis corresponding to each language code / name.
 */
export const LANGUAGE_FLAGS: Record<string, string> = {
  persian: '🇮🇷',
  farsi: '🇮🇷',
  arabic: '🇸🇦',
  english: '🇬🇧',
  urdu: '🇵🇰',
  turkish: '🇹🇷',
  french: '🇫🇷',
  german: '🇩🇪',
  spanish: '🇪🇸',
  russian: '🇷🇺',
  indonesian: '🇮🇩',
  bengali: '🇧🇩',
  malay: '🇲🇾',
  bosnian: '🇧🇦',
  dutch: '🇳🇱',
  italian: '🇮🇹',
  portuguese: '🇵🇹',
  swedish: '🇸🇪',
  norwegian: '🇳🇴',
  polish: '🇵🇱',
  chinese: '🇨🇳',
  japanese: '🇯🇵',
  korean: '🇰🇷',
  hindi: '🇮🇳',
  albanian: '🇦🇱',
  thai: '🇹🇭',
  vietnamese: '🇻🇳',
  somali: '🇸🇴',
  kazakh: '🇰🇿',
  uzbek: '🇺🇿',
  azeri: '🇦🇿',
  tajik: '🇹🇯',
  kurdish: '🇮🇶',
  dari: '🇦🇫',
  pashto: '🇦🇫',
  hebrew: '🇮🇱',
  tamil: '🇮🇳',
  telugu: '🇮🇳',
  malayalam: '🇮🇳',
  marathi: '🇮🇳',
  gujarati: '🇮🇳',
  kannada: '🇮🇳',
  assamese: '🇮🇳',
  swahili: '🇹🇿',
  hausa: '🇳🇬',
  yoruba: '🇳🇬',
  amharic: '🇪🇹',
  ukrainian: '🇺🇦',
  tatar: '🇷🇺',
  chechen: '🇷🇺',
  bulgarian: '🇧🇬',
  czech: '🇨🇿',
  romanian: '🇷🇴',
  finnish: '🇫🇮',
  sindhi: '🇵🇰',
  'uighur, uyghur': '🇨🇳',
  divehi: '🇲🇻',
  'divehi, dhivehi, maldivian': '🇲🇻',
  bambara: '🇲🇱',
  kinyarwanda: '🇷🇼',
  oromo: '🇪🇹',
  nepali: '🇳🇵',
  'central khmer': '🇰🇭',
  maranao: '🇵🇭',
  tagalog: '🇵🇭',
  'sinhala, sinhalese': '🇱🇰',
  amazigh: '🇩🇿',
  ganda: '🇺🇬',
  'yau,yuw': '🇵🇬',
};

/**
 * Endonym (Native script name) for each language.
 */
export const LANGUAGE_NATIVE_NAMES: Record<string, string> = {
  persian: 'فارسی',
  farsi: 'فارسی',
  arabic: 'العربية',
  english: 'English',
  urdu: 'اردو',
  turkish: 'Türkçe',
  french: 'Français',
  german: 'Deutsch',
  spanish: 'Español',
  russian: 'Русский',
  indonesian: 'Bahasa Indonesia',
  bengali: 'বাংলা',
  malay: 'Bahasa Melayu',
  bosnian: 'Bosanski',
  dutch: 'Nederlands',
  italian: 'Italiano',
  portuguese: 'Português',
  swedish: 'Svenska',
  norwegian: 'Norsk',
  polish: 'Polski',
  chinese: '中文',
  japanese: '日本語',
  korean: '한국어',
  hindi: 'हिन्दी',
  albanian: 'Shqip',
  thai: 'ภาษาไทย',
  vietnamese: 'Tiếng Việt',
  somali: 'Soomaali',
  kazakh: 'Қазақша',
  uzbek: 'Oʻzbekcha',
  azeri: 'Azərbaycan',
  tajik: 'Тоҷикӣ',
  kurdish: 'کوردی',
  dari: 'دری',
  pashto: 'پښتو',
  hebrew: 'עברית',
  tamil: 'தமிழ்',
  telugu: 'తెలుగు',
  malayalam: 'മലയാളം',
  marathi: 'मराठी',
  gujarati: 'ગુજરાતી',
  kannada: 'ಕನ್ನಡ',
  assamese: 'অসমীয়া',
  swahili: 'Kiswahili',
  hausa: 'Hausa',
  yoruba: 'Yorùbá',
  amharic: 'አማርኛ',
  ukrainian: 'Українська',
  tatar: 'Татарча',
  chechen: 'Нохчийн',
  bulgarian: 'Български',
  czech: 'Čeština',
  romanian: 'Română',
  finnish: 'Suomi',
  sindhi: 'سنڌي',
  'uighur, uyghur': 'ئۇيغۇرچە',
  divehi: 'ދިވެހި',
  'divehi, dhivehi, maldivian': 'ދިވެހި',
  bambara: 'Bamanankan',
  kinyarwanda: 'Ikinyarwanda',
  oromo: 'Afaan Oromoo',
  nepali: 'नेपाली',
  'central khmer': 'ភាសាខ្មែរ',
  maranao: 'Mëranaw',
  tagalog: 'Tagalog',
  'sinhala, sinhalese': 'සිංহල',
  amazigh: 'Tamaziɣt',
  ganda: 'Luganda',
  'yau,yuw': 'Yau',
};

/**
 * Native translator titles and author names mapped by translation ID.
 */
export const TRANSLATION_NATIVE_MAP: Record<number, { name: string; authorName?: string }> = {
  // English
  19: { name: 'M. Pickthall', authorName: 'Mohammed Marmaduke Pickthall' },
  20: { name: 'Saheeh International', authorName: 'Saheeh International' },
  22: { name: 'A. Yusuf Ali', authorName: 'Abdullah Yusuf Ali' },
  57: { name: 'Transliteration', authorName: 'English Transliteration' },
  84: { name: 'T. Usmani', authorName: 'Mufti Taqi Usmani' },
  85: { name: 'M.A.S. Abdel Haleem', authorName: 'Abdul Haleem' },
  95: { name: 'Tafheem-ul-Quran', authorName: 'Sayyid Abul Ala Maududi' },
  149: { name: "Bridges' Translation", authorName: 'Fadel Soliman' },
  203: { name: 'Al-Hilali & Khan', authorName: 'Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan' },

  // Persian
  29: { name: 'حسین تاجی کله‌داری', authorName: 'حسین تاجی کله‌داری' },
  135: { name: 'مرکز اسلام هاوس', authorName: 'IslamHouse.com' },

  // Urdu
  54: { name: 'مولانا محمد جوناگڑھی', authorName: 'مولانا محمد جوناگڑھی' },
  97: { name: 'تفہیم القرآن', authorName: 'سید ابو الاعلیٰ مودودی' },
  151: { name: 'شیخ الہند محمود الحسن (تفسیر عثمانی)', authorName: 'شیخ الہند محمود الحسن' },
  156: { name: 'فی ظلال القرآن', authorName: 'سید ابراهیم قطب' },
  158: { name: 'بیان القرآن', authorName: 'ڈاکٹر اسرار احمد' },
  234: { name: 'فتح محمد جالندھری', authorName: 'فتح محمد جالندھری' },
  819: { name: 'مولانا وحید الدین خان', authorName: 'مولانا وحید الدین خان' },
  831: { name: 'سید ابو الاعلیٰ مودودی (رومن اردو)', authorName: 'سید ابو الاعلیٰ مودودی' },

  // Turkish
  52: { name: 'Elmalılı Hamdi Yazır', authorName: 'Elmalılı Hamdi Yazır' },
  77: { name: 'Diyanet İşleri Başkanlığı', authorName: 'Diyanet İşleri' },
  112: { name: 'Şaban Piriş', authorName: 'Şaban Piriş' },
  124: { name: 'Müslim Şahin', authorName: 'Müslim Şahin' },
  210: { name: 'Dar Al-Salam (Diyanet Vakfı)', authorName: 'Dar Al-Salam Center' },

  // Russian
  45: { name: 'Эльмир Кулиев', authorName: 'Эльмир Кулиев' },
  78: { name: 'Министерство вакуфов Египта (Аль-Мунтахаб)', authorName: 'Министерство вакуфов Египта' },
  79: { name: 'Абу Адель', authorName: 'Абу Адель' },

  // French
  31: { name: 'Muhammad Hamidullah', authorName: 'Muhammad Hamidullah' },
  136: { name: 'Fondation Islamique Montada', authorName: 'Fondation Islamique Montada' },
  779: { name: 'Rashid Maash', authorName: 'Rashid Maash' },

  // German
  27: { name: 'Frank Bubenheim & Nadeem Elyas', authorName: 'Frank Bubenheim & Nadeem Elyas' },
  208: { name: 'Abu Reda Muhammad ibn Ahmad', authorName: 'Abu Reda Muhammad ibn Ahmad' },

  // Spanish
  83: { name: 'Sheikh Isa García', authorName: 'Sheikh Isa García' },
  140: { name: 'Fundación Islámica Montada', authorName: 'Fundación Islámica Montada' },
  199: { name: 'Centro Internacional Noor', authorName: 'Centro Internacional Noor' },

  // Bengali
  161: { name: 'তাইসিরুল কুরআন', authorName: 'তাওহীদ পাবলিকেশন্স' },
  162: { name: 'রাওয়াঈউল বায়ান', authorName: 'বায়ান ফাউন্ডেশন' },
  163: { name: 'মুহিউদ্দীন খান', authorName: 'দারুসসালাম পাবলিকেশন' },
  213: { name: 'ড. আবু বকর মুহাম্মাদ যাকারিয়া', authorName: 'ড. আবু বকর মুহাম্মাদ যাকারিয়া' },

  // Indonesian
  33: { name: 'Kementerian Agama Republik Indonesia', authorName: 'Kemenag RI' },
  134: { name: "Kompleks Percetakan Al-Qur'an Raja Fahd", authorName: 'King Fahad Quran Complex' },
  141: { name: 'Perusahaan As-Sabiq', authorName: 'The Sabiq Company' },

  // Kurdish
  81: { name: 'بورهان موحه‌مه‌د ئه‌مین', authorName: 'بورهان موحه‌مه‌د ئه‌مین' },
  143: { name: 'موحه‌مه‌د ساڵح بامۆکی', authorName: 'موحه‌مه‌د ساڵح بامۆکی' },

  // Bosnian
  25: { name: 'Muhamed Mehanović', authorName: 'Muhamed Mehanović' },
  126: { name: 'Besim Korkut', authorName: 'Besim Korkut' },
  214: { name: 'Centar Dar Al-Salam', authorName: 'Dar Al-Salam Center' },

  // Dutch
  144: { name: 'Sofian S. Siregar', authorName: 'Sofian S. Siregar' },
  235: { name: 'Malak Faris Abdalsalaam', authorName: 'Malak Faris Abdalsalaam' },

  // Italian
  153: { name: 'Hamza Roberto Piccardo', authorName: 'Hamza Roberto Piccardo' },
  209: { name: 'Othman al-Sharif', authorName: 'Othman al-Sharif' },

  // Portuguese
  43: { name: 'Samir El-Hayek', authorName: 'Samir El-Hayek' },
  103: { name: 'Helmi Nasr', authorName: 'Helmi Nasr' },

  // Albanian
  47: { name: 'Përkthimi Shqip', authorName: 'Albanian' },
  88: { name: 'Hasan Efendi Nahi', authorName: 'Hasan Efendi Nahi' },
  89: { name: 'Sherif Ahmeti', authorName: 'Sherif Ahmeti' },

  // Swedish & Norwegian & Polish & Finnish & Czech & Romanian
  48: { name: 'Knut Bernström', authorName: 'Knut Bernström' },
  41: { name: 'Einar Berg', authorName: 'Norwegian' },
  42: { name: 'Józef Bielawski', authorName: 'Józef Bielawski' },
  30: { name: 'Suomenkielinen käännös', authorName: 'Finnish' },
  26: { name: 'Český překlad', authorName: 'Czech' },
  44: { name: 'George Grigore', authorName: 'George Grigore' },
  782: { name: 'Liga Islamică și Culturală', authorName: 'Islamic and Cultural League' },

  // Chinese
  56: { name: '马坚 (Ma Jian - 简体中文)', authorName: '马坚' },
  109: { name: '穆罕默德·麦肯 (Muhammad Makin)', authorName: 'Muhammad Makin' },

  // Japanese
  35: { name: '三田了一 (Ryoichi Mita)', authorName: '三田了一' },
  218: { name: 'サイード佐藤 (Saeed Sato)', authorName: 'サイード佐藤' },

  // Korean
  36: { name: '한국어 번역', authorName: 'Korean' },
  219: { name: '최영길 (Hamed Choi)', authorName: '최영길' },

  // Hindi, Gujarati, Marathi, Telugu, Tamil, Kannada, Malayalam, Assamese
  122: { name: 'मौलाना अज़ीज़ुल हक़ अल-उमरी', authorName: 'Maulana Azizul Haque' },
  225: { name: 'રબીલા અલ-ઉમરી', authorName: 'Rabila Al-Umry' },
  226: { name: 'मोहम्मद शफी अन्सारी', authorName: 'Muhammad Shafi’i Ansari' },
  227: { name: 'మౌలానా అబ్దుర్-రహీమ్', authorName: 'Maulana Abder-Rahim' },
  50: { name: 'ஜான் டிரஸ்ட் பவுண்டேஷன்', authorName: 'Jan Trust Foundation' },
  133: { name: 'அப்துல் ஹமீது பாகவி', authorName: 'Abdul Hameed Baqavi' },
  229: { name: 'ஷேக் உமர் ஷரீப்', authorName: 'Sheikh Omar Sharif' },
  771: { name: 'ಕನ್ನಡ ಅನುವಾದ', authorName: 'Kannada Translation' },
  37: { name: 'ചെറിയമുണ്ടം അബ്ദുൽ ഹമീദ് & കുഞ്ഞി മുഹമ്മദ്', authorName: 'Abdul Hameed & Kunhi Mohammed' },
  80: { name: 'മുഹമ്മദ് കാരകുന്ന് & വാണിദാസ് എളയാവൂർ', authorName: 'Muhammad Karakunnu & Vanidas Elayavoor' },
  224: { name: 'അബ്ദുൽ ഹമീദ് ഹൈദർ & കുഞ്ഞി മുഹമ്മദ്', authorName: 'Abdul-Hamid Haidar & Kanhi Muhammad' },
  120: { name: 'শ্বায়খ ৰফীকুল ইছলাম', authorName: 'Shaykh Rafeequl Islam' },

  // Azeri, Uzbek, Kazakh, Tajik, Tatar, Chechen
  23: { name: 'Məmmədəliyev & Bünyadov', authorName: 'Ziya Bünyadov & Vasim Məmmədəliyev' },
  75: { name: 'Əlixan Musayev', authorName: 'Əlixan Musayev' },
  55: { name: 'Muhammad Sodiq Muhammad Yusuf (Lotin)', authorName: 'Muhammad Sodiq Muhammad Yusuf' },
  101: { name: 'Алоуддин Мансур', authorName: 'Alauddin Mansour' },
  127: { name: 'Муҳаммад Содиқ Муҳаммад Юсуф', authorName: 'Муҳаммад Содиқ Муҳаммад Юсуф' },
  113: { name: 'Халифа Алтай', authorName: 'Халифа Алтай' },
  222: { name: 'Халифа Алтай (Жаңа басылым)', authorName: 'Халифа Алтай' },
  74: { name: 'Абдулмуҳаммад Оятӣ', authorName: 'Абдулмуҳаммад Оятӣ' },
  139: { name: 'Хоҷа Миров ва Хоҷа Мир', authorName: 'Хоҷа Миров ва Хоҷа Мир' },
  223: { name: 'Маркаزی пешравони тарҷума', authorName: 'Pioneers of Translation Center' },
  53: { name: 'Татарча тәрҗемә', authorName: 'Tatar' },
  106: { name: 'Магомед Магомедов', authorName: 'Магомед Магомедов' },

  // Pashto, Dari, Sindhi, Uighur, Divehi
  118: { name: 'زکریا عبدالسلام', authorName: 'زکریا عبدالسلام' },
  785: { name: 'مولوی محمد انور بدخشانی', authorName: 'مولوی محمد انور بدخشانی' },
  238: { name: 'مولانا تاج محمود امروٽي', authorName: 'تاج محمود امروٽي' },
  76: { name: 'مۇھەممەد سالىھ', authorName: 'مۇھەممەد سالىھ' },
  86: { name: 'ރައީސުލްޖުމްހޫރިއްޔާގެ އޮފީސް', authorName: 'Office of the president of Maldives' },
  840: { name: 'އަބޫބަކުރު އިބްރާހީމް ޢަލީ (ބަކުރުބެ)', authorName: 'Abu Bakr Ibrahim Ali' },

  // African & Others
  32: { name: 'Abubakar Mahmoud Gumi', authorName: 'Abubakar Mahmoud Gumi' },
  115: { name: 'Abubakar Mahmood Jummi', authorName: 'Abubakar Mahmood Jummi' },
  125: { name: 'Shaykh Abu Rahimah Mikael Aykyuni', authorName: 'Shaykh Abu Rahimah Mikael Aykyuni' },
  87: { name: 'ሳዲቅ እና ሳኒ', authorName: 'Sadiq and Sani' },
  111: { name: 'Ghaali Apapuur Apaghuuna', authorName: 'Ghali Apapur Apaghuna' },
  46: { name: 'Maxamuud Maxamed Cabduh', authorName: 'Mahmud Muhammad Abduh' },
  49: { name: 'Ali Muhsin Al-Barwani', authorName: 'Ali Muhsin Al-Barwani' },
  231: { name: 'Dr. Abdullah Muhammad Abu Bakr & Sheikh Nasir Khamis', authorName: 'Dr. Abdullah Muhammad Abu Bakr' },
  39: { name: 'Abdullah Muhammad Basmeih', authorName: 'Abdullah Muhammad Basmeih' },
  51: { name: 'ศูนย์กษัตริย์ฟาฮัดเพื่อการพิมพ์อัลกุรอาน', authorName: 'King Fahad Quran Complex' },
  230: { name: 'สมาคมสถาบันและมหาวิทยาลัย', authorName: 'Society of Institutes and Universities' },
  217: { name: 'Д-р Михайло Якубович', authorName: 'Д-р Михайло Якубович' },
  220: { name: 'Trung tâm Tiên phong Dịch thuật (Ruwwad)', authorName: 'Ruwwad Center' },
  221: { name: 'Hasan Abdul-Karim', authorName: 'Hasan Abdul-Karim' },
  233: { name: 'מרכז דאר אל-סלאם', authorName: 'Dar Al-Salam Center' },
  236: { name: 'Ramdane At Mansour', authorName: 'Ramdane At Mansour' },
  237: { name: 'Цветан Теофанов', authorName: 'Tzvetan Theophanov' },
  774: { name: "Ishyirahamwe ry'Abayisilamu mu Rwanda", authorName: 'Rwanda Muslims Association' },
  795: { name: 'Suliman Kanti', authorName: 'Suliman Kanti' },
  796: { name: 'Baba Mamady Jani', authorName: 'Baba Mamady Jani' },
  798: { name: 'Abdul Hamid Silika', authorName: 'Abdul Hamid Silika' },
  108: { name: 'अहल अल-हदीस सेन्ट्रल सोसाइटी नेपाल', authorName: 'Ahl Al-Hadith Central Society' },
  128: { name: 'សមាគមអភិវឌ្ឍន៍សហគមន៍ឥស្លាមកម្ពុជា', authorName: 'Cambodian Muslim Community' },
  228: { name: 'රුව්වාද් පරිවર્තන මධ්‍යස්ථානය', authorName: 'Ruwwad Center' },
  38: { name: 'Maranao Translation', authorName: 'Maranao' },
  211: { name: 'Dar Al-Salam Center', authorName: 'Dar Al-Salam Center' },
  232: { name: 'African Development Foundation', authorName: 'African Development Foundation' },
};

/**
 * Get country flag for a language.
 */
export const getLanguageFlag = (language: string): string => {
  if (!language) return '🌐';
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_FLAGS[normalized] || '🌐';
};

/**
 * Get native endonym for a language.
 */
export const getLanguageNativeName = (language: string): string => {
  if (!language) return '';
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_NATIVE_NAMES[normalized] || '';
};

/**
 * Format language group header with country flag and native name.
 * e.g. "🇮🇷 Persian (فارسی)" or "🇸🇦 Arabic (العربية)" or "🇬🇧 English"
 */
export const getLanguageHeaderTitle = (language: string): string => {
  if (!language) return '';
  const flag = getLanguageFlag(language);
  const nativeName = getLanguageNativeName(language);
  const capitalized = language.charAt(0).toUpperCase() + language.slice(1);

  if (nativeName && nativeName.toLowerCase() !== capitalized.toLowerCase()) {
    return `${flag} ${capitalized} (${nativeName})`;
  }
  return `${flag} ${capitalized}`;
};

/**
 * Get native translator display name for a translation object.
 */
export const getTranslationNativeName = (translation: AvailableTranslation): string => {
  if (!translation) return '';
  if (translation.id && TRANSLATION_NATIVE_MAP[translation.id]) {
    return TRANSLATION_NATIVE_MAP[translation.id].name;
  }
  return translation.translatedName?.name || translation.name || translation.authorName || '';
};

/**
 * Get secondary/original author name if different from native title.
 */
export const getTranslationSecondaryName = (translation: AvailableTranslation): string | null => {
  if (!translation) return null;
  const nativeName = getTranslationNativeName(translation);
  const fallback = translation.translatedName?.name || translation.name || '';
  if (fallback && fallback.toLowerCase() !== nativeName.toLowerCase()) {
    return fallback;
  }
  if (translation.authorName && translation.authorName.toLowerCase() !== nativeName.toLowerCase()) {
    return translation.authorName;
  }
  return null;
};
