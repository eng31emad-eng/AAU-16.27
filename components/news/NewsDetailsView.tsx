'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { ArrowRight, ArrowLeft, Calendar, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { NewsItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface NewsDetailsViewProps {
    news: NewsItem;
    relatedNews: NewsItem[]; // We can pass related news from server too so it's fully SSR compatible
}

export default function NewsDetailsView({ news, relatedNews }: NewsDetailsViewProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';
    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.split(' ').length;
        return Math.ceil(words / wordsPerMinute);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container mx-auto px-4 py-8">
                    <Breadcrumb
                        items={[
                            { label: { ar: 'الأخبار', en: 'News' }, href: '/news' },
                            { label: { ar: news.titleAr, en: news.titleEn } }
                        ]}
                    />



                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl"
                    >
                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
                            {t(news.titleAr, news.titleEn)}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>{formatDate(news.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-primary" />
                                <span>{news.views} {t('مشاهدة', 'views')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <span>{estimateReadTime(language === 'ar' ? news.contentAr : news.contentEn)} {t('دقائق قراءة', 'min read')}</span>
                            </div>
                        </div>


                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Article Content */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        {/* Featured Image */}
                        {news.image ? (
                            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg h-[300px] md:h-[420px]">
                                <Image
                                    src={news.image}
                                    alt={t(news.titleAr, news.titleEn)}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                        ) : null}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            <p className="text-lg leading-relaxed text-foreground/90">
                                {t(news.contentAr, news.contentEn)}
                            </p>
                        </div>

                    </motion.article>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        {/* Related News */}
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                                    {t('أخبار ذات صلة', 'Related News')}
                                </h3>
                                <div className="space-y-4">
                                    {relatedNews.map((item, index) => (
                                        <Link
                                            key={item.id}
                                            href={`/news/${item.slug || item.id}`}
                                            className="group block"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300"
                                            >
                                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    <Image
                                                        src={item.image}
                                                        alt={t(item.titleAr, item.titleEn)}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {t(item.titleAr, item.titleEn)}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(item.date)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>

                                {/* View All Button */}
                                <Button
                                    variant="outline"
                                    className="w-full mt-6 rounded-full"
                                    onClick={() => router.push('/news')}
                                >
                                    {t('عرض جميع الأخبار', 'View All News')}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}
