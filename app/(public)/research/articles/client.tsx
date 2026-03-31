'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResearchArticle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search, BookOpen, Clock, User,
    ArrowRight, ArrowLeft, Calendar, GraduationCap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import Link from 'next/link';

interface ArticlesClientProps {
    initialArticles: ResearchArticle[];
}

export default function ArticlesClient({ initialArticles }: ArticlesClientProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';
    const [articles] = useState<ResearchArticle[]>(initialArticles);
    const [filteredArticles, setFilteredArticles] = useState<ResearchArticle[]>(initialArticles);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', ar: 'الكل', en: 'All' },
        ...Array.from(new Map(
            articles
                .filter((article) => article.categoryEn || article.categoryAr)
                .map((article) => [
                    article.categoryEn || article.categoryAr,
                    {
                        id: article.categoryEn || article.categoryAr,
                        ar: article.categoryAr || article.categoryEn,
                        en: article.categoryEn || article.categoryAr,
                    },
                ])
        ).values()),
    ];

    const breadcrumbItems = [
        { label: { ar: 'البحث العلمي', en: 'Research' }, href: '/research' },
        { label: { ar: 'المقالات العلمية', en: 'Scientific Articles' } }
    ];

    useEffect(() => {
        let result = articles;
        if (activeCategory !== 'all') {
            result = result.filter(a => (a.categoryEn || a.categoryAr) === activeCategory);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.titleAr.toLowerCase().includes(query) ||
                a.titleEn.toLowerCase().includes(query) ||
                a.authorAr.toLowerCase().includes(query) ||
                a.authorEn.toLowerCase().includes(query) ||
                a.summaryAr.toLowerCase().includes(query) ||
                a.summaryEn.toLowerCase().includes(query)
            );
        }
        setFilteredArticles(result);
    }, [activeCategory, searchQuery, articles]);

    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    return (
        <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <div className="container mx-auto px-4">
                    <Breadcrumb items={breadcrumbItems} />

                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                    >
                        <ArrowIcon className="w-4 h-4 mx-2" />
                        {t('رجوع', 'Back')}
                    </Button>

                    <div className="text-center mt-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <GraduationCap className="w-10 h-10 text-primary" />
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                                {t('المقالات العلمية والبحثية', 'Scientific Articles')}
                            </h1>
                        </div>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            {t(
                                'مقالات بحثية محكمة ونتاجات علمية متميزة لكوادر جامعة الجيل الجديد',
                                'Peer-reviewed research and scientific output from NGU academic faculty'
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and Filter */}
            <section className="py-8 border-b bg-white/50 backdrop-blur-md sticky top-[72px] z-30">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                            <Input
                                placeholder={t('ابحث عن مقال أو مؤلف...', 'Search articles or authors...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl border-gray-200 focus:ring-secondary`}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={activeCategory === cat.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`rounded-xl px-6 font-bold transition-all ${activeCategory === cat.id ? 'bg-primary text-secondary shadow-lg' : ''
                                        }`}
                                >
                                    {t(cat.ar, cat.en)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <AnimatePresence mode="popLayout">
                        {filteredArticles.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-bold text-muted-foreground">
                                    {t('لا توجد مقالات تتطابق مع بحثك', 'No articles match your search')}
                                </h3>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredArticles.map((article, idx) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Link href={`/research/articles/${article.id}`}>
                                            <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-500 group border-gray-100 flex flex-col cursor-pointer">
                                                {/* Article Image */}
                                                <div className="relative h-56 overflow-hidden">
                                                    <img
                                                        src={`https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop`}
                                                        alt={article.titleEn}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-60" />
                                                    <Badge className="absolute top-4 left-4 bg-secondary text-primary font-bold">
                                                        {language === 'ar' ? article.categoryAr : article.categoryEn}
                                                    </Badge>
                                                </div>

                                                <CardContent className="p-6 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-secondary" />
                                                            {language === 'ar' ? article.publishDateAr : article.publishDateEn}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-secondary" />
                                                            {t('10 دقائق قراءة', '10 min read')}
                                                        </span>
                                                    </div>

                                                    <h2 className="text-xl font-bold text-primary mb-3 line-clamp-2 leading-tight group-hover:text-secondary transition-colors">
                                                        {language === 'ar' ? article.titleAr : article.titleEn}
                                                    </h2>

                                                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                                                        {language === 'ar' ? article.summaryAr : article.summaryEn}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                                                <User className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-foreground">
                                                                    {language === 'ar' ? article.authorAr : article.authorEn}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                                    {t('باحث أكاديمي', 'Academic Researcher')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* زر السهم - The Arrow Button */}
                                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
                                                            <ArrowIcon className="w-5 h-5 transform group-hover:scale-110" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
