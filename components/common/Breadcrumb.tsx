'use client'
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: { ar: string; en: string };
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const { t, language } = useLanguage();
  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <nav
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 text-xs font-medium text-muted-foreground/80 mb-6 animate-fade-in shadow-sm hover:bg-white/15 transition-all"
      aria-label={t('فتات الخبز', 'Breadcrumb')}
    >
      <Link href="/"
        className="hover:text-secondary flex items-center gap-1.5 transition-colors group"
        aria-label={t('الرئيسية', 'Home')}
      >
        <div className="p-1 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
          <Home className="w-3 h-3 text-secondary" />
        </div>
        <span className="hidden sm:inline">{t('الرئيسية', 'Home')}</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronIcon className="w-3 h-3 opacity-40" />
          {item.href ? (
            <Link href={item.href} className="hover:text-secondary transition-colors truncate max-w-[120px] sm:max-w-none">
              {t(item.label.ar, item.label.en)}
            </Link>
          ) : (
            <span className="text-foreground font-bold truncate max-w-[150px] sm:max-w-none">
              {t(item.label.ar, item.label.en)}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};



