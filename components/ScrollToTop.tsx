'use client'
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const ScrollToTop = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      className={`
        fixed bottom-24 md:bottom-32 right-8 md:right-10 z-40 rounded-full 
        w-10 h-10 md:w-12 md:h-12 p-0 
        shadow-xl transition-all duration-300 
        bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary/20
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}
      `}
      aria-label={t('العودة للأعلى', 'Scroll to top')}
    >
      <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
    </Button>
  );
};



