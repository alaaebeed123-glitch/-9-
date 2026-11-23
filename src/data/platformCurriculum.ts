import type { TajweedRuleKind } from '../utils/tajweedRules';

export interface ReadingUnitTab {
  num: string;
  subTab: string;
  label: string;
  /** Additional subTabs that should highlight this parent tab */
  matchSubTabs?: string[];
}

export interface ReadingUnitConfig {
  id: string;
  unitOrder: string;
  title: string;
  shortTitle: string;
  symbol: string;
  defaultSubTab: string;
  tabs: ReadingUnitTab[];
  tajweedBridge: {
    topicId: string;
    label: string;
    hint: string;
  };
  mushafBridge: {
    page: number;
    surahLabel: string;
    hint: string;
  };
}

export const READING_UNITS: ReadingUnitConfig[] = [
  {
    id: 'letters',
    unitOrder: 'الوحدة الأولى',
    title: 'الحروف الهجائية والتأسيس',
    shortTitle: 'الحروف الهجائية',
    symbol: 'أ',
    defaultSubTab: 'baa',
    tabs: [
      { num: '١', subTab: 'alphabet_book', label: 'لوحة الحروف (ص ٢)' },
      { num: '٢', subTab: 'baa', label: 'بستان الحروف الهجائية' },
    ],
    tajweedBridge: {
      topicId: 'lathawiya',
      label: 'باب الحروف اللثوية (ث، ذ، ظ)',
      hint: 'مخارج الحروف المتقاربة في النطق',
    },
    mushafBridge: {
      page: 1,
      surahLabel: 'سورة الفاتحة (ص ١)',
      hint: 'تطبيق قراءة الحروف في المصحف',
    },
  },
  {
    id: 'huroof',
    unitOrder: 'الوحدة الثانية',
    title: 'أشكال الحروف وقواعد الوصل',
    shortTitle: 'أشكال الحروف',
    symbol: 'ـبـ',
    defaultSubTab: 'wasl',
    tabs: [
      { num: '١', subTab: 'wasl', label: 'قواعد الوصل' },
      { num: '٢', subTab: 'rafasa', label: 'الحروف الرفّاسة' },
      { num: '٣', subTab: 'letter_positions_book', label: 'مواضع الحروف (ص ٦)' },
      { num: '٤', subTab: 'similarities_book', label: 'الحروف المتشابهة (ص ٧)' },
    ],
    tajweedBridge: {
      topicId: 'lathawiya',
      label: 'باب الحروف اللثوية',
      hint: 'التمييز بين المتشابهات نطقاً (ث/س، ذ/ز، ظ/ز)',
    },
    mushafBridge: {
      page: 604,
      surahLabel: 'سورة الإخلاص والفلق والناس (ص ٦٠٤)',
      hint: 'ملاحظة رسم ووصل الحروف في المصحف',
    },
  },
  {
    id: 'fatha',
    unitOrder: 'الوحدة الثالثة',
    title: 'حركة الفتح',
    shortTitle: 'حركة الفتح',
    symbol: 'ـَ',
    defaultSubTab: 'words',
    tabs: [
      { num: '١', subTab: 'explain', label: 'شرح الفتح' },
      { num: '٢', subTab: 'fatha_letters_book', label: 'حروف الكتاب (ص ٣–٥)' },
      {
        num: '٣',
        subTab: 'stage1',
        label: 'المقاطع والأشكال',
        matchSubTabs: ['stage1', 'stage2'],
      },
      {
        num: '٤',
        subTab: 'stage3',
        label: 'المتشابهات والدمج',
        matchSubTabs: ['stage3', 'minimal_words', 'blend'],
      },
      { num: '٥', subTab: 'words', label: 'كلمات وجمل (ص ٨–١٢)' },
      { num: '٦', subTab: 'generator', label: 'المولد الذكي' },
      { num: '٧', subTab: 'games', label: 'ألعاب وتحديات' },
    ],
    tajweedBridge: {
      topicId: 'lathawiya',
      label: 'باب الحروف اللثوية',
      hint: 'ضبط إخراج اللسان في كلمات الفتح',
    },
    mushafBridge: {
      page: 603,
      surahLabel: 'سورة المسد والنصر (ص ٦٠٣)',
      hint: 'تطبيق القراءة بالحركات في قصار السور',
    },
  },
  {
    id: 'kasra',
    unitOrder: 'الوحدة الرابعة',
    title: 'حركة الكسر',
    shortTitle: 'حركة الكسر',
    symbol: 'ـِ',
    defaultSubTab: 'kasra_intro',
    tabs: [
      { num: '١', subTab: 'kasra_intro', label: 'درس الكسر (ص ١٣)' },
      {
        num: '٢',
        subTab: 'stage1',
        label: 'المقاطع والأشكال',
        matchSubTabs: ['stage1', 'stage2'],
      },
      {
        num: '٣',
        subTab: 'stage3',
        label: 'المقارنات والمتشابهات',
        matchSubTabs: ['stage3', 'minimal_words'],
      },
      { num: '٤', subTab: 'words', label: 'كلمات وجمل (ص ١٤–١٧)' },
      { num: '٥', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'lathawiya',
      label: 'باب الحروف اللثوية',
      hint: 'إتمام الكسر مع سلامة المخرج',
    },
    mushafBridge: {
      page: 1,
      surahLabel: 'سورة الفاتحة (ص ١)',
      hint: 'تطبيق إتمام الكسرة في آيات الفاتحة',
    },
  },
  {
    id: 'damma',
    unitOrder: 'الوحدة الخامسة',
    title: 'حركة الضم',
    shortTitle: 'حركة الضم',
    symbol: 'ـُ',
    defaultSubTab: 'damma_intro',
    tabs: [
      { num: '١', subTab: 'damma_intro', label: 'درس الضم (ص ١٨)' },
      {
        num: '٢',
        subTab: 'stage1',
        label: 'المقاطع والأشكال',
        matchSubTabs: ['stage1', 'stage2'],
      },
      {
        num: '٣',
        subTab: 'stage3',
        label: 'المتشابهات والثنائيات',
        matchSubTabs: ['stage3', 'minimal_words'],
      },
      { num: '٤', subTab: 'words', label: 'كلمات وجمل (ص ١٩–٢٣)' },
      { num: '٥', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'qalqalah',
      label: 'باب حروف القلقلة',
      hint: 'التمهيد لضبط الحركات قبل السكون',
    },
    mushafBridge: {
      page: 604,
      surahLabel: 'سورة الإخلاص (ص ٦٠٤)',
      hint: 'تطبيق إتمام الضم في قصار السور',
    },
  },
  {
    id: 'madd_alif',
    unitOrder: 'الوحدة السادسة',
    title: 'المد بالألف',
    shortTitle: 'المد بالألف',
    symbol: 'ـَا',
    defaultSubTab: 'stage1',
    tabs: [
      {
        num: '١',
        subTab: 'stage1',
        label: 'المقاطع والأشكال',
        matchSubTabs: ['stage1', 'stage2'],
      },
      { num: '٢', subTab: 'stage3', label: 'مقارنة الفتح والمد' },
      { num: '٣', subTab: 'words', label: 'كلمات وجمل (ص ٢٤–٢٧)' },
      { num: '٤', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'lathawiya',
      label: 'باب الحروف اللثوية',
      hint: 'ضبط الحروف اللثوية مع المد الطبيعي',
    },
    mushafBridge: {
      page: 1,
      surahLabel: 'سورة الفاتحة (ص ١)',
      hint: 'تطبيق المد الطبيعي في المصحف المجوّد',
    },
  },
  {
    id: 'madd_ya',
    unitOrder: 'الوحدة السابعة',
    title: 'المد بالياء',
    shortTitle: 'المد بالياء',
    symbol: 'ـِي',
    defaultSubTab: 'stage1',
    tabs: [
      {
        num: '١',
        subTab: 'stage1',
        label: 'المقاطع والأشكال',
        matchSubTabs: ['stage1', 'stage2'],
      },
      { num: '٢', subTab: 'stage3', label: 'مقارنة الكسر والمد' },
      { num: '٣', subTab: 'words', label: 'كلمات وجمل (ص ٢٨–٣١)' },
      { num: '٤', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'noon_sakinah',
      label: 'أحكام النون الساكنة والتنوين',
      hint: 'الربط بين المدود وأحكام التلاوة',
    },
    mushafBridge: {
      page: 602,
      surahLabel: 'سورة الكوثر والكافرون (ص ٦٠٢–٦٠٣)',
      hint: 'تطبيق المد بالياء في السور القصار',
    },
  },
  {
    id: 'madd_waw',
    unitOrder: 'الوحدة الثامنة',
    title: 'المد بالواو ومراجعة المدود',
    shortTitle: 'المد بالواو',
    symbol: 'ـُو',
    defaultSubTab: 'stage1',
    tabs: [
      {
        num: '١',
        subTab: 'stage1',
        label: 'المقاطع والأشكال',
        matchSubTabs: ['stage1', 'stage2'],
      },
      { num: '٢', subTab: 'stage3', label: 'مقارنة الضم والمد' },
      { num: '٣', subTab: 'words', label: 'كلمات وجمل (ص ٣٢–٣٥)' },
      { num: '٤', subTab: 'madd_review_book', label: 'مراجعة المدود (ص ٣٦–٣٨)' },
      { num: '٥', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'noon_sakinah',
      label: 'أحكام النون الساكنة والتنوين',
      hint: 'الانتقال من المدود إلى أحكام التلاوة',
    },
    mushafBridge: {
      page: 603,
      surahLabel: 'سورة الكافرون والنصر (ص ٦٠٣)',
      hint: 'تطبيق المدود الثلاثة في المصحف الشريف',
    },
  },
  {
    id: 'sukun',
    unitOrder: 'الوحدة التاسعة',
    title: 'تدريب السكون واللام القمرية',
    shortTitle: 'تدريب السكون',
    symbol: 'ـْ',
    defaultSubTab: 'explain',
    tabs: [
      { num: '١', subTab: 'explain', label: 'شرح السكون' },
      {
        num: '٢',
        subTab: 'stage1',
        label: 'المقاطع والمقارنات',
        matchSubTabs: ['stage1', 'stage2', 'stage3'],
      },
      {
        num: '٣',
        subTab: 'qamariyya_intro',
        label: 'اللام القمرية',
        matchSubTabs: ['qamariyya_intro', 'qamariyya_words'],
      },
      {
        num: '٤',
        subTab: 'sukun_quran_words',
        label: 'السكون في المصحف (ص ٣٩–٤٦)',
        matchSubTabs: ['sukun_quran_words', 'sukun_qamariyya_book', 'sukun_quran_adv'],
      },
      { num: '٥', subTab: 'sukun_imla_book', label: 'الإملاء والقصص (ص ٤٧–٤٩)' },
      { num: '٦', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'qalqalah',
      label: 'باب حروف القلقلة (قُطْبُ جَدّ)',
      hint: 'تطبيق القلقلة على الحروف الساكنة',
    },
    mushafBridge: {
      page: 604,
      surahLabel: 'سورة الإخلاص والفلق (ص ٦٠٤)',
      hint: 'استخراج السكون والقلقلة من المصحف',
    },
  },
  {
    id: 'tanween',
    unitOrder: 'الوحدة العاشرة',
    title: 'تدريب التنوين',
    shortTitle: 'تدريب التنوين',
    symbol: 'ـً',
    defaultSubTab: 'explain',
    tabs: [
      { num: '١', subTab: 'explain', label: 'سر التنوين' },
      {
        num: '٢',
        subTab: 'tanween_fath_stage1',
        label: 'المقاطع والأشكال والمقارنات',
        matchSubTabs: ['tanween_fath_stage1', 'tanween_kasr_stage1', 'tanween_damm_stage1', 'stage1', 'stage2', 'stage3'],
      },
      {
        num: '٣',
        subTab: 'tanween_fath_words',
        label: 'تنوين الفتح (ص ٥٠–٥٢)',
        matchSubTabs: ['tanween_fath_words', 'tanween_fath_sentences'],
      },
      {
        num: '٤',
        subTab: 'tanween_kasr_words',
        label: 'تنوين الكسر (ص ٥٣–٥٥)',
        matchSubTabs: ['tanween_kasr_words', 'tanween_kasr_sentences'],
      },
      {
        num: '٥',
        subTab: 'tanween_damm_words',
        label: 'تنوين الضم (ص ٥٦–٥٧)',
        matchSubTabs: ['tanween_damm_words', 'tanween_damm_sentences'],
      },
      {
        num: '٦',
        subTab: 'tanween_review_quran',
        label: 'المراجعة والإملاء (ص ٥٨–٦١)',
        matchSubTabs: ['tanween_review_quran', 'tanween_review_imla', 'book_pages'],
      },
      { num: '٧', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'noon_sakinah',
      label: 'باب أحكام النون الساكنة والتنوين',
      hint: 'الإظهار والإدغام والإقلاب والإخفاء للتنوين',
    },
    mushafBridge: {
      page: 592,
      surahLabel: 'سورة الغاشية (ص ٥٩٢)',
      hint: 'تطبيق أحكام التنوين في المصحف المجوّد',
    },
  },
  {
    id: 'shadda',
    unitOrder: 'الوحدة الحادية عشرة',
    title: 'تدريب الشدة واللام الشمسية',
    shortTitle: 'تدريب الشدة',
    symbol: 'ـّ',
    defaultSubTab: 'explain',
    tabs: [
      { num: '١', subTab: 'explain', label: 'شرح الشدة' },
      {
        num: '٢',
        subTab: 'stage1',
        label: 'المقاطع والأشكال والمقارنات',
        matchSubTabs: ['stage1', 'stage2', 'stage3', 'shadda_shamsiyya_stage1', 'shadda_tanween_stage1'],
      },
      {
        num: '٣',
        subTab: 'shadda_fath_book',
        label: 'الشدة بالفتح والشمسية (ص ٦٢–٦٥)',
        matchSubTabs: ['shadda_fath_book', 'shadda_shamsiyya_book'],
      },
      {
        num: '٤',
        subTab: 'shadda_kasr_book',
        label: 'الكسر والضم (ص ٦٦–٧٢)',
        matchSubTabs: ['shadda_kasr_book', 'shadda_kasr_imla', 'shadda_damm_book'],
      },
      {
        num: '٥',
        subTab: 'shadda_tanween_book',
        label: 'المراجعة والتنوين (ص ٧٣–٧٦)',
        matchSubTabs: ['shadda_review_book', 'shadda_tanween_book', 'book_pages'],
      },
      { num: '٦', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'noon_meem',
      label: 'باب النون والميم المشددتان',
      hint: 'تطبيق الغنة الكاملة بمقدار حركتين',
    },
    mushafBridge: {
      page: 604,
      surahLabel: 'سورة الناس (ص ٦٠٤)',
      hint: 'تطبيق الشدة والغنة في المصحف الشريف',
    },
  },
  {
    id: 'tajweed',
    unitOrder: 'الوحدة الثانية عشرة',
    title: 'أحكام التلاوة ورسم المصحف',
    shortTitle: 'أحكام التلاوة والمصحف',
    symbol: '۞',
    defaultSubTab: 'explain',
    tabs: [
      {
        num: '١',
        subTab: 'explain',
        label: 'مختبر التلاوة والبطاقات',
        matchSubTabs: ['explain', 'stage1', 'stage3'],
      },
      { num: '٢', subTab: 'tajweed_madd_book', label: 'المدود الفرعية (ص ٧٧–٧٩)' },
      {
        num: '٣',
        subTab: 'tajweed_noon_book',
        label: 'النون والميم (ص ٨٠–٨٤)',
        matchSubTabs: ['tajweed_noon_book', 'tajweed_meem_book'],
      },
      {
        num: '٤',
        subTab: 'tajweed_misc_book',
        label: 'القلقلة والترتيل (ص ٨٥–٨٩)',
        matchSubTabs: ['tajweed_misc_book', 'tajweed_review_book'],
      },
      {
        num: '٥',
        subTab: 'tajweed_rasm_book',
        label: 'رسم المصحف والهمزة (ص ٩٠–٩٣)',
        matchSubTabs: ['tajweed_rasm_book', 'tajweed_hamza_book', 'book_pages'],
      },
      { num: '٦', subTab: 'generator', label: 'المولد الذكي' },
    ],
    tajweedBridge: {
      topicId: 'noon_sakinah',
      label: 'برنامج التجويد التفاعلي',
      hint: 'مخارج مرئية وتمارين تفاعلية للأحكام',
    },
    mushafBridge: {
      page: 1,
      surahLabel: 'المصحف الشريف المجوّد (ص ١)',
      hint: 'التطبيق المباشر على صفحات المصحف',
    },
  },
];

export function getReadingUnitById(catId: string): ReadingUnitConfig {
  const normalized =
    catId === 'vowels'
      ? 'fatha'
      : catId === 'madd'
        ? 'madd_alif'
        : catId === 'qamariyya'
          ? 'sukun'
          : catId;
  return READING_UNITS.find((u) => u.id === normalized) || READING_UNITS[2]; // default fatha
}

export function resolveActiveReadingTab(unit: ReadingUnitConfig, subTab: string): string {
  for (const tab of unit.tabs) {
    if (tab.subTab === subTab) return tab.subTab;
    if (tab.matchSubTabs && tab.matchSubTabs.includes(subTab)) return tab.subTab;
  }
  return unit.defaultSubTab;
}

export interface TajweedBridgeConfig {
  readingBridge: {
    mainCat: string;
    subTab: string;
    label: string;
    hint: string;
  };
  mushafBridge: {
    page: number;
    surahLabel: string;
    hint: string;
  };
}

export const TAJWEED_CURRICULUM_BRIDGES: Record<string, TajweedBridgeConfig> = {
  lathawiya: {
    readingBridge: {
      mainCat: 'huroof',
      subTab: 'similarities_book',
      label: 'الحروف المتشابهة نطقاً في التدريب القرائي',
      hint: 'مراجعة التأسيس القرائي قبل المخرج',
    },
    mushafBridge: {
      page: 602,
      surahLabel: 'تطبيق في المصحف الشريف (سورة الكوثر · ص ٦٠٢)',
      hint: 'عرض كامل بوضع البث والشرح',
    },
  },
  noon_meem: {
    readingBridge: {
      mainCat: 'shadda',
      subTab: 'explain',
      label: 'تأسيس الشدة في التدريب القرائي',
      hint: 'فهم الحرف المشدد قبل تطبيق الغنة',
    },
    mushafBridge: {
      page: 604,
      surahLabel: 'تطبيق في المصحف الشريف (سورة الناس · ص ٦٠٤)',
      hint: 'استخراج النون والميم المشددتين',
    },
  },
  qalqalah: {
    readingBridge: {
      mainCat: 'sukun',
      subTab: 'explain',
      label: 'تأسيس السكون في التدريب القرائي',
      hint: 'إتقان الوقف على الساكن أساس القلقلة',
    },
    mushafBridge: {
      page: 604,
      surahLabel: 'تطبيق في المصحف الشريف (سورة الإخلاص والفلق · ص ٦٠٤)',
      hint: 'مواضع القلقلة الكبرى والصغرى',
    },
  },
  noon_sakinah: {
    readingBridge: {
      mainCat: 'tanween',
      subTab: 'explain',
      label: 'تأسيس التنوين في التدريب القرائي',
      hint: 'التمييز بين النون الساكنة والتنوين',
    },
    mushafBridge: {
      page: 592,
      surahLabel: 'تطبيق في المصحف الشريف (سورة الغاشية · ص ٥٩٢)',
      hint: 'تطبيق أحكام النون الساكنة والتنوين',
    },
  },
};

export interface MushafLegendTarget {
  program: 'tajweed' | 'reading';
  topicId?: string;
  mainCat?: string;
  subTab?: string;
  tooltip: string;
}

export const MUSHAF_LEGEND_TARGETS: Record<TajweedRuleKind, MushafLegendTarget> = {
  maddLong: {
    program: 'reading',
    mainCat: 'tajweed',
    subTab: 'tajweed_madd_book',
    tooltip: 'اضغط لشرح المدود الفرعية في التدريب القرائي',
  },
  ghunnah: {
    program: 'tajweed',
    topicId: 'noon_meem',
    tooltip: 'اضغط لشرح الغنة والنون والميم المشددتين في برنامج التجويد',
  },
  qalqalah: {
    program: 'tajweed',
    topicId: 'qalqalah',
    tooltip: 'اضغط لشرح باب حروف القلقلة في برنامج التجويد',
  },
  idgham: {
    program: 'tajweed',
    topicId: 'noon_sakinah',
    tooltip: 'اضغط لشرح أحكام النون الساكنة والإدغام في برنامج التجويد',
  },
};

export interface SafaraProgressSnapshot {
  readingMainCat: string;
  readingSubTab: string;
  tajweedTopic: string;
  mushafPage: number;
  mushafSurah: string;
}

const PROGRESS_STORAGE_KEY = 'safara_unified_progress_v1';

const DEFAULT_SNAPSHOT: SafaraProgressSnapshot = {
  readingMainCat: 'fatha',
  readingSubTab: 'words',
  tajweedTopic: 'noon_sakinah',
  mushafPage: 1,
  mushafSurah: 'الفاتحة',
};

export function loadSafaraProgress(): SafaraProgressSnapshot {
  if (typeof window === 'undefined') return DEFAULT_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_SNAPSHOT;
    const parsed = JSON.parse(raw) as Partial<SafaraProgressSnapshot>;
    return {
      readingMainCat: typeof parsed.readingMainCat === 'string' && parsed.readingMainCat ? parsed.readingMainCat : DEFAULT_SNAPSHOT.readingMainCat,
      readingSubTab: typeof parsed.readingSubTab === 'string' && parsed.readingSubTab ? parsed.readingSubTab : DEFAULT_SNAPSHOT.readingSubTab,
      tajweedTopic: typeof parsed.tajweedTopic === 'string' && parsed.tajweedTopic ? parsed.tajweedTopic : DEFAULT_SNAPSHOT.tajweedTopic,
      mushafPage: typeof parsed.mushafPage === 'number' && parsed.mushafPage >= 1 && parsed.mushafPage <= 604 ? parsed.mushafPage : DEFAULT_SNAPSHOT.mushafPage,
      mushafSurah: typeof parsed.mushafSurah === 'string' && parsed.mushafSurah ? parsed.mushafSurah : DEFAULT_SNAPSHOT.mushafSurah,
    };
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

export function saveSafaraProgress(patch: Partial<SafaraProgressSnapshot>): SafaraProgressSnapshot {
  const next = { ...loadSafaraProgress(), ...patch };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
  return next;
}
