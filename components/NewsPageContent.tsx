'use client'
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { NewsItem } from '@/types';
import { useRouter } from 'next/navigation'

interface NewsPageContentProps {
    initialNews: NewsItem[];
}

export default function NewsPageContent({ initialNews }: NewsPageContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();

    const [news] = useState<NewsItem[]>(initialNews);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>(initialNews);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle client-side search
    useEffect(() => {
        if (searchQuery) {
            const filtered = news.filter((item) =>
                (language === 'ar' ? item.titleAr : item.titleEn)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (language === 'ar' ? item.descriptionAr : item.descriptionEn)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredNews(filtered);
        } else {
            setFilteredNews(news);
        }
    }, [searchQuery, news, language]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb items={[{ label: { ar: 'الأخبار', en: 'News' } }]} />



                <div className="mb-12 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        {t('الأخبار', 'News')}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                        {t(
                            'تابع آخر أخبار الجامعة ومستجداتها',
                            'Follow the latest university news and updates'
                        )}
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={t('ابحث في الأخبار...', 'Search news...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {filteredNews.length === 0 ? (
                    <EmptyState
                        messageAr="لا توجد أخبار متاحة. جرب البحث بكلمات مختلفة"
                        messageEn="No news available. Try searching with different keywords"
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredNews.map((item, index) => (
                            <Card
                                key={item.id}
                                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-fade-in-up overflow-hidden"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => router.push(`/news/${item.slug}`)}
                            >
                                {/* Image with Enhanced Gradient Overlay */}
                                <div className="relative aspect-video w-full overflow-hidden">
                                    <img
                                        src={typeof item.image === 'string' ? item.image : (item.image as any)?.src || item.image}
                                        alt={language === 'ar' ? item.titleAr : item.titleEn}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Beautiful gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-transparent to-primary/30 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                    {/* Decorative corner accent */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/40 to-transparent rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                                        {language === 'ar' ? item.titleAr : item.titleEn}
                                    </CardTitle>

                                    <CardDescription className="line-clamp-3">
                                        {language === 'ar' ? item.descriptionAr : item.descriptionEn}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <Button variant="outline" className="w-full group-hover:bg-secondary group-hover:text-white group-hover:border-secondary transition-all" size="sm">
                                        <span className="flex items-center gap-2">
                                            {t('قراءة المزيد', 'Read More')}
                                            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                                        </span>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
