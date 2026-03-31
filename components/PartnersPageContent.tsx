'use client'
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartnerItem } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useRouter } from 'next/navigation'

interface PartnersPageContentProps {
    initialPartners: PartnerItem[];
}

export default function PartnersPageContent({ initialPartners }: PartnersPageContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
    const [partners, setPartners] = useState<PartnerItem[]>(initialPartners);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // No fetch needed

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
                <Breadcrumb items={[{ label: { ar: 'شركاؤنا', en: 'Our Partners' } }]} />



                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 py-3 leading-relaxed">
                        {t('شركاؤنا', 'Our Partners')}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t(
                            'نفخر بشراكاتنا مع المؤسسات المحلية والدولية الرائدة',
                            'We are proud of our partnerships with leading local and international institutions'
                        )}
                    </p>
                </div>

                {partners.length === 0 ? (
                    <EmptyState
                        messageAr="لا يوجد شركاء منشورون حالياً"
                        messageEn="No published partners available right now"
                    />
                ) : (
                <Tabs defaultValue="all" className="max-w-6xl mx-auto">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="all">{t('الكل', 'All')}</TabsTrigger>
                        <TabsTrigger value="international">{t('دولي', 'International')}</TabsTrigger>
                        <TabsTrigger value="local">{t('محلي', 'Local')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {partners.map((partner) => (
                                <Card
                                    key={partner.id}
                                    className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                                    role="article"
                                    tabIndex={0}
                                    onClick={() => partner.website && window.open(partner.website, '_blank', 'noopener,noreferrer')}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && partner.website) {
                                            e.preventDefault();
                                            window.open(partner.website, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    <CardContent className="p-6 flex items-center justify-center">
                                        <img
                                            src={partner.logo}
                                            alt={t(partner.nameAr, partner.nameEn)}
                                            className="w-full h-24 object-contain grayscale hover:grayscale-0 transition-all"
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="international" className="mt-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {partners.filter((p) => p.type === 'international').map((partner) => (
                                <Card
                                    key={partner.id}
                                    className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                                    role="article"
                                    tabIndex={0}
                                    onClick={() => partner.website && window.open(partner.website, '_blank', 'noopener,noreferrer')}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && partner.website) {
                                            e.preventDefault();
                                            window.open(partner.website, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    <CardContent className="p-6 flex items-center justify-center">
                                        <img
                                            src={partner.logo}
                                            alt={t(partner.nameAr, partner.nameEn)}
                                            className="w-full h-24 object-contain grayscale hover:grayscale-0 transition-all"
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="local" className="mt-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {partners.filter((p) => p.type === 'local').map((partner) => (
                                <Card
                                    key={partner.id}
                                    className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                                    role="article"
                                    tabIndex={0}
                                    onClick={() => partner.website && window.open(partner.website, '_blank', 'noopener,noreferrer')}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && partner.website) {
                                            e.preventDefault();
                                            window.open(partner.website, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    <CardContent className="p-6 flex items-center justify-center">
                                        <img
                                            src={partner.logo}
                                            alt={t(partner.nameAr, partner.nameEn)}
                                            className="w-full h-24 object-contain grayscale hover:grayscale-0 transition-all"
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
                )}
            </div>
        </div>
    );
}
