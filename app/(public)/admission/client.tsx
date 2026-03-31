'use client'
import { useLanguage } from '@/contexts/LanguageContext';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { AdmissionSection } from '@/components/AdmissionSection';
import { College, SitePage } from '@/types';

interface AdmissionProps {
    page: SitePage | null;
    colleges: College[];
}

const Admission = ({ page, colleges }: AdmissionProps) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            {page && (
                <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                    {page.heroImage ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-15"
                            style={{ backgroundImage: `url(${page.heroImage})` }}
                        />
                    ) : null}
                    <div className="container mx-auto px-4 py-14 relative z-10">
                        <div className="max-w-4xl">
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                                {t(page.titleAr, page.titleEn)}
                            </h1>
                            {(page.contentAr || page.contentEn) && (
                                <div
                                    className="prose prose-lg max-w-none text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground"
                                    dangerouslySetInnerHTML={{ __html: t(page.contentAr, page.contentEn) }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="container mx-auto px-4 py-8">
                <div data-breadcrumb="local">
                    <Breadcrumb items={[{ label: { ar: 'القبول والتسجيل', en: 'Admission' } }]} />
                </div>


                <AdmissionSection colleges={colleges} />
            </div>
        </div>
    );
};

export default Admission;
