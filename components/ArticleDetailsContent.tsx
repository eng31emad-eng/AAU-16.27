'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ResearchArticle } from '@/types';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import {
    Calendar, User, Tag, ArrowRight, ArrowLeft,
    Clock, BookOpen, Share2, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ArticleDetailsContentProps {
    article: ResearchArticle;
    relatedArticles: ResearchArticle[];
}

export default function ArticleDetailsContent({ article, relatedArticles }: ArticleDetailsContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    const breadcrumbItems = [
        { label: { ar: 'البحث العلمي', en: 'Research' }, href: '/research' },
        { label: { ar: 'المقالات العلمية', en: 'Articles' }, href: '/research/articles' },
        { label: { ar: article.titleAr, en: article.titleEn } }
    ];

    return (
        <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
                <div className="container mx-auto px-4">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="max-w-4xl mx-auto mt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Badge className="bg-secondary text-primary font-bold mb-4">
                                {language === 'ar' ? article.categoryAr : article.categoryEn}
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary leading-tight mb-6">
                                {language === 'ar' ? article.titleAr : article.titleEn}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-t border-b py-6 border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-foreground">
                                            {language === 'ar' ? article.authorAr : article.authorEn}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wider">{t('باحث أكاديمي', 'Academic Researcher')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-secondary" />
                                    {language === 'ar' ? article.publishDateAr : article.publishDateEn}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-secondary" />
                                    {t('10 دقائق قراءة', '10 min read')}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                        {/* Main Content */}
                        <div className="lg:w-2/3">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="prose prose-lg max-w-none prose-primary"
                            >
                                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 leading-relaxed text-foreground/80">
                                    <div className="flex items-center gap-3 mb-8 text-secondary font-bold text-xl border-r-4 border-secondary pr-4">
                                        <BookOpen className="w-6 h-6" />
                                        {t('ملخص الدراسة', 'Study Abstract')}
                                    </div>
                                    <p className="text-xl font-medium mb-10 text-primary/90 italic">
                                        {language === 'ar' ? article.summaryAr : article.summaryEn}
                                    </p>

                                    <div className="space-y-6">
                                        {/* Mocking long content */}
                                        <p>{language === 'ar' ? article.contentAr : article.contentEn}</p>
                                        <p>
                                            {t(
                                                'هذا النص هو مثال لمحتوى البحث العلمي الذي سيتم إدراجه هنا لاحقاً. يتضمن البحث منهجية الدراسة، العينات المستخدمة، التحليل الإحصائي، والنتائج التي تم التوصل إليها في هذا المجال التخصصي.',
                                                'This text is an example of the scientific research content that will be inserted here later. The research includes the study methodology, samples used, statistical analysis, and the findings achieved in this specialized field.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3 space-y-8">
                            {/* Actions Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-secondary" />
                                    {t('أدوات البحث', 'Research Tools')}
                                </h3>
                                <div className="grid gap-3">
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: article.titleAr,
                                                    text: article.summaryAr,
                                                    url: window.location.href,
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success(t('تم نسخ رابط البحث إلى الحافظة', 'Research link copied to clipboard'));
                                            }
                                        }}
                                        className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-6 rounded-xl gap-2 shadow-lg hover:shadow-primary/20 transition-all"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        {t('مشاركة البحث', 'Share Research')}
                                    </Button>
                                </div>

                                {/* Academic Info */}
                                <div className="mt-8 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-primary font-bold mb-4">
                                        <Tag className="w-5 h-5 text-secondary" />
                                        {t('تخصص المقال', 'Category')}
                                    </div>
                                    <p className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-xl">
                                        {t(
                                            'هذا المقال مصنف ضمن الأبحاث المحكمة التي تخضع لمراجعة الأقران في جامعة الجيل الجديد.',
                                            'This article is classified among peer-reviewed research at Al-Jeel Al-Jadeed University.'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
    };
    return (
        <div className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
