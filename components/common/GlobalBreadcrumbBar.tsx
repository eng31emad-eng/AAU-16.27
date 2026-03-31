'use client'
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminRoutes, publicRoutes } from '@/config/routes';

type BreadcrumbLabel = { ar: string; en: string };

type BreadcrumbHistoryItem = {
  pathname: string;
  label: BreadcrumbLabel;
};

const HISTORY_KEY = 'breadcrumbHistory';
const MAX_HISTORY = 10;

const readHistory = (): BreadcrumbHistoryItem[] => {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as BreadcrumbHistoryItem[]) : [];
  } catch {
    return [];
  }
};

const writeHistory = (items: BreadcrumbHistoryItem[]) => {
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};

const getLabelForPath = (pathname: string): BreadcrumbLabel => {
  const allRoutes = [...publicRoutes, ...adminRoutes];
  const direct = allRoutes.find(route => route.href === pathname);
  if (direct) return { ar: direct.ar, en: direct.en };

  const baseMatch = allRoutes.find(route => pathname.startsWith(`${route.href}/`));
  if (baseMatch) return { ar: baseMatch.ar, en: baseMatch.en };

  const lastSegment = pathname.split('/').filter(Boolean).pop() || pathname;
  const fallback = decodeURIComponent(lastSegment).replace(/-/g, ' ');
  return { ar: fallback, en: fallback };
};

export const GlobalBreadcrumbBar = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [hasLocalBreadcrumb, setHasLocalBreadcrumb] = useState(true);
  const [historyItems, setHistoryItems] = useState<BreadcrumbHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    return readHistory();
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkLocal = () => {
      const hasLocal = !!document.querySelector('[data-breadcrumb="local"]');
      setHasLocalBreadcrumb(hasLocal);
    };
    checkLocal();
    const observer = new MutationObserver(() => checkLocal());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const label = getLabelForPath(pathname);
    setHistoryItems(prev => {
      const last = prev[prev.length - 1];
      if (last?.pathname === pathname) return prev;

      const next = [...prev, { pathname: pathname, label }];
      const trimmed = next.slice(-MAX_HISTORY);
      if (typeof window !== 'undefined') writeHistory(trimmed);
      return trimmed;
    });
  }, [pathname]);

  const breadcrumbItems = useMemo(() => {
    if (historyItems.length === 0) {
      return [{ pathname: pathname, label: getLabelForPath(pathname) }];
    }
    return historyItems.slice(-3);
  }, [historyItems, pathname]);

  const isRTL = typeof document !== 'undefined'
    ? document.documentElement.dir === 'rtl'
    : language === 'ar';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleBack = () => {
    if (historyItems.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  if (hasLocalBreadcrumb) return null;

  return (
    <div data-breadcrumb="global" className="border-b border-border bg-background/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            <ChevronIcon className="h-4 w-4" />
            {t('رجوع', 'Back')}
          </button>

          <nav
            aria-label={t('فتات الخبز', 'Breadcrumb')}
            className="flex items-center gap-2 text-sm text-muted-foreground min-w-0"
          >
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              const hideOnMobile = breadcrumbItems.length === 3 && index === 0;
              const label = t(item.label.ar, item.label.en);

              return (
                <div
                  key={`${item.pathname}-${index}`}
                  className={`flex items-center gap-2 ${hideOnMobile ? 'hidden sm:flex' : 'flex'}`}
                >
                  {index > 0 && <ChevronIcon className="h-4 w-4" />}
                  {isLast ? (
                    <span className="text-foreground font-medium truncate max-w-[10rem] sm:max-w-[14rem]">
                      {label}
                    </span>
                  ) : (
                    <Link href={item.pathname}
                      className="hover:text-foreground transition-colors truncate max-w-[10rem] sm:max-w-[14rem]"
                    >
                      {label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};




