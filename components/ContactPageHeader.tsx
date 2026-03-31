'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { MessageCircle } from 'lucide-react';
import type { ContactPageHeaderData } from '@/services/server/contact';

export const ContactPageHeader = ({ pageHeader }: { pageHeader?: ContactPageHeaderData }) => {
    const { t } = useLanguage();

    return (
        <>
            <Breadcrumb items={[{ label: { ar: 'تواصل معنا', en: 'Contact Us' } }]} />
            <div className="mb-12 text-center animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <MessageCircle className="w-4 h-4" />
                    {t(pageHeader?.badgeAr || 'تواصل معنا', pageHeader?.badgeEn || 'Contact Us')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    {t(pageHeader?.titleAr || 'نحن هنا للإجابة على استفساراتكم', pageHeader?.titleEn || 'We Are Here to Answer Your Questions')}
                </h1>
                <div className="w-32 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-6"></div>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    {t(pageHeader?.descriptionAr || '', pageHeader?.descriptionEn || '')}
                </p>
            </div>
        </>
    );
};
