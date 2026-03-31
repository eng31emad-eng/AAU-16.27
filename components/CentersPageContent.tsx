'use client'
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Microscope, GraduationCap, BriefcaseBusiness, ArrowRight, ArrowLeft } from 'lucide-react';
import { CenterItem } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useRouter } from 'next/navigation'

const iconMap: Record<string, any> = {
    research: Microscope,
    training: GraduationCap,
    consulting: BriefcaseBusiness,
};

function resolveCenterIcon(center: CenterItem) {
    const source = `${center.id} ${center.titleEn} ${center.titleAr} ${center.descEn} ${center.descAr}`.toLowerCase();
    if (source.includes('innovation') || source.includes('entrepreneur') || source.includes('ابتكار') || source.includes('ريادة')) {
        return BriefcaseBusiness;
    }
    if (source.includes('community') || source.includes('education') || source.includes('training') || source.includes('تعليم') || source.includes('تدريب')) {
        return GraduationCap;
    }
    if (source.includes('clinical') || source.includes('skills') || source.includes('research') || source.includes('سريري') || source.includes('مهارات') || source.includes('بحث')) {
        return Microscope;
    }
    return iconMap[center.id] || Microscope;
}

interface CentersPageContentProps {
    initialCenters: CenterItem[];
}

export default function CentersPageContent({ initialCenters }: CentersPageContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
    const [centers, setCenters] = useState<CenterItem[]>(initialCenters);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // No fetch

    if (isLoading) {
        return <LoadingState messageAr="جاري التحميل..." messageEn="Loading..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <ErrorState onRetry={() => window.location.reload()} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 bg-background">
            <div className="container mx-auto px-4">
                <Breadcrumb items={[{ label: { ar: 'مراكز الجامعة', en: 'University Centers' } }]} />



                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 py-3 leading-relaxed">
                        {t('المراكز', 'Centers')}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centers.map((center, index) => {
                        const Icon = resolveCenterIcon(center);
                        return (
                            <Card
                                key={center.id}
                                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardHeader>
                                    <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="w-8 h-8 text-secondary" aria-hidden="true" />
                                    </div>
                                    <CardTitle>{t(center.titleAr, center.titleEn)}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {t(center.descAr, center.descEn)}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={() => router.push(`/centers/${center.id}`)}
                                        className="w-full bg-[#D4AF37] hover:bg-[#C9A961] text-white"
                                    >
                                        {t('التفاصيل', 'Details')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
