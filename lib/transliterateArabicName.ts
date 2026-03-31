import { useLanguage } from '@/contexts/LanguageContext';

const ARABIC_NAME_MAP: Record<string, string> = {
  'ا': 'a',
  'أ': 'a',
  'إ': 'i',
  'آ': 'aa',
  'ب': 'b',
  'ت': 't',
  'ث': 'th',
  'ج': 'j',
  'ح': 'h',
  'خ': 'kh',
  'د': 'd',
  'ذ': 'dh',
  'ر': 'r',
  'ز': 'z',
  'س': 's',
  'ش': 'sh',
  'ص': 's',
  'ض': 'd',
  'ط': 't',
  'ظ': 'z',
  'ع': "'",
  'غ': 'gh',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y',
  'ى': 'a',
  'ة': 'h',
  'ء': "'",
  'ؤ': 'w',
  'ئ': 'y',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const ARABIC_DIACRITICS = new Set([
  '\u064b',
  '\u064c',
  '\u064d',
  '\u064e',
  '\u064f',
  '\u0650',
  '\u0651',
  '\u0652',
  '\u0670',
  '\u0640',
]);

export function transliterateArabicName(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  let result = '';
  for (const char of trimmed) {
    if (ARABIC_DIACRITICS.has(char)) continue;
    if (Object.prototype.hasOwnProperty.call(ARABIC_NAME_MAP, char)) {
      result += ARABIC_NAME_MAP[char];
      continue;
    }
    result += char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

interface DisplayNameProps {
  nameAr?: string;
  nameEn?: string;
}

export function DisplayName({ nameAr, nameEn }: DisplayNameProps) {
  const { language } = useLanguage();
  const arText = (nameAr || '').trim();
  const enText = (nameEn || '').trim();

  if (language === 'ar') {
    return arText || enText;
  }

  if (enText) return enText;
  return arText ? transliterateArabicName(arText) : '';
}
