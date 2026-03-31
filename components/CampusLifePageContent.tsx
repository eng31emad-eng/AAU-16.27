'use client'
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { CampusLifeItem } from '@/types';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useRouter } from 'next/navigation'

interface CampusLifePageContentProps {
    initialItems: CampusLifeItem[];
}

export default function CampusLifePageContent({ initialItems }: CampusLifePageContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
    const [items] = useState<CampusLifeItem[]>(initialItems);

    return (
        <div className="min-h-screen py-16 bg-background">
            <div className="container mx-auto px-4">
                <Breadcrumb items={[{ label: { ar: 'الحياة الجامعية', en: 'Campus Life' } }]} />



                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 py-3 leading-relaxed">
                        {t('الحياة الجامعية', 'Campus Life')}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t(
                            'استكشف الحياة الجامعية النابضة بالحيوية والمرافق الحديثة',
                            'Explore vibrant campus life and modern facilities'
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <Card
                            key={item.id}
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => router.push(`/campus-life/${item.slug}`)}
                        >
                            <div className="relative aspect-video bg-secondary/10 overflow-hidden">
                                {item.image ? (
                                    <>
                                        <img
                                            src={item.image}
                                            alt={t(item.titleAr, item.titleEn)}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-primary/50"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center">
                                            <span className="text-3xl font-bold text-secondary">{item.id}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <p className="text-primary-foreground font-semibold text-lg px-4 text-center">
                                        {t(item.titleAr, item.titleEn)}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="font-medium text-center">
                                    {t(item.titleAr, item.titleEn)}
                                </p>
                                <p className="text-sm text-muted-foreground text-center mt-1 capitalize">
                                    {item.category}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
