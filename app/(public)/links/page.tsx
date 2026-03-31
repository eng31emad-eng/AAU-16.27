'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    GraduationCap, Globe, Calendar, BookOpen,
    ExternalLink, ArrowRight, ArrowLeft, MousePointerClick,
    Construction, Rocket, Cog
} from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export default function LinksPage() {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
    const [showComingSoon, setShowComingSoon] = useState(false);

    const importantLinks = [
        {
            id: 'results',
            titleAr: 'بوابة نتائج الطلاب',
            titleEn: 'Student Results Portal',
            descAr: 'الوصول المباشر إلى نتائج الامتحانات الفصلية والسنوية عبر البوابة الإلكترونية.',
            descEn: 'Direct access to semester and annual exam results through the online portal.',
            icon: GraduationCap,
            href: 'https://results.ngu.edu.ye',
            color: 'bg-emerald-500/10 text-emerald-600',
            btnTextAr: 'دخول البوابة',
            btnTextEn: 'Enter Portal',
            comingSoon: true, // ⚠️ غيّر إلى false لما الرابط يكون جاهز
        },
        {
            id: 'website',
            titleAr: 'موقع الجامعة (النسخة القديمة)',
            titleEn: 'NGU Website (Legacy)',
            descAr: 'زيارة الموقع الإلكتروني السابق للجامعة للوصول إلى الأرشيف والمعلومات القديمة.',
            descEn: 'Visit the previous university website for archives and legacy information.',
            icon: Globe,
            href: 'https://ngu.edu.ye',
            color: 'bg-blue-500/10 text-blue-600',
            btnTextAr: 'زيارة الموقع',
            btnTextEn: 'Visit Website',
            comingSoon: true, // ⚠️ غيّر إلى false لما الرابط يكون جاهز
        },
        {
            id: 'schedule',
            titleAr: 'الجداول الدراسية',
            titleEn: 'Academic Schedules',
            descAr: 'الاطلاع على الجداول الدراسية الأسبوعية والمواعيد الأكاديمية لكل فصل.',
            descEn: 'View weekly academic schedules and academic dates for each semester.',
            icon: Calendar,
            href: '#',
            color: 'bg-amber-500/10 text-amber-600',
            btnTextAr: 'عرض الجداول',
            btnTextEn: 'View Schedules',
            comingSoon: true, // ⚠️ غيّر إلى false وضع الرابط الحقيقي لما يكون جاهز
        },
        {
            id: 'library',
            titleAr: 'المكتبة الرقمية',
            titleEn: 'Digital Library',
            descAr: 'الوصول إلى المصادر العلمية والكتب الإلكترونية والأبحاث العالمية.',
            descEn: 'Access scientific resources, e-books, and global research databases.',
            icon: BookOpen,
            href: '#',
            color: 'bg-purple-500/10 text-purple-600',
            btnTextAr: 'دخول المكتبة',
            btnTextEn: 'Enter Library',
            comingSoon: true, // ⚠️ غيّر إلى false وضع الرابط الحقيقي لما يكون جاهز
        }
    ];

    const breadcrumbItems = [
        { label: { ar: 'الرئيسية', en: 'Home' }, href: '/' },
        { label: { ar: 'روابط هامة', en: 'Important Links' } }
    ];

    return (
        <div className={`min-h-screen bg-background flex flex-col ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-16 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <Breadcrumb items={breadcrumbItems} />

                        <div className="max-w-3xl mx-auto text-center mt-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold text-sm mb-6 border border-secondary/20"
                            >
                                <MousePointerClick className="w-4 h-4" />
                                {t('خدمات الطلاب الرقمية', 'Digital Student Services')}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl md:text-6xl font-bold text-primary mb-6"
                            >
                                {t('روابط تهم الطالب', 'Important Links for Students')}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xl text-muted-foreground leading-relaxed"
                            >
                                {t(
                                    'نسهل عليك الوصول إلى كافة المنصات والخدمات الجامعية في مكان واحد وبطريقة سريعة ومنظمة.',
                                    'We make it easy for you to access all university platforms and services in one place, quickly and organized.'
                                )}
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20 -mt-10">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {importantLinks.map((link, idx) => (
                                <motion.div
                                    key={link.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                    <Card className="h-full group hover:shadow-2xl transition-all duration-500 border-none bg-white/40 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
                                        <CardContent className="p-8 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`p-4 rounded-2xl ${link.color} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                                                    <link.icon className="w-8 h-8" />
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {link.comingSoon ? (
                                                        <span className="text-[10px] font-bold text-secondary/60 bg-secondary/10 px-2 py-1 rounded-full">
                                                            {t('قريباً', 'Soon')}
                                                        </span>
                                                    ) : (
                                                        <ExternalLink className="w-5 h-5 text-muted-foreground/30" />
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                                                {language === 'ar' ? link.titleAr : link.titleEn}
                                            </h3>

                                            <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                                                {language === 'ar' ? link.descAr : link.descEn}
                                            </p>

                                            <div className="mt-auto">
                                                <Button
                                                    onClick={() => {
                                                        if (link.comingSoon) {
                                                            setShowComingSoon(true);
                                                        } else {
                                                            window.open(link.href, '_blank');
                                                        }
                                                    }}
                                                    className="w-full bg-primary hover:bg-secondary text-white hover:text-primary font-bold py-6 rounded-xl gap-2 transition-all duration-300 shadow-lg hover:shadow-secondary/20"
                                                >
                                                    {t(link.btnTextAr, link.btnTextEn)}
                                                    <ArrowIcon className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Note Card */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="max-w-5xl mx-auto mt-16 p-8 rounded-3xl bg-secondary/5 border border-secondary/10 text-center"
                        >
                            <p className="text-sm text-secondary font-medium">
                                {t(
                                    '* جميع الروابط أعلاه توجهك إلى منصات رسمية تابعة لجامعة الجيل الجديد.',
                                    '* All the links above direct you to official platforms belonging to Al-Jeel Al-Jadeed University.'
                                )}
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Coming Soon Dialog */}
            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
                <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                    <div className="p-8 text-center space-y-6">
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 border-2 border-dashed border-secondary/30 rounded-full scale-150"
                            />
                            <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto border border-secondary/20 relative z-10 overflow-hidden shadow-xl">
                                <motion.div
                                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Construction className="w-10 h-10 text-secondary" />
                                </motion.div>
                                <motion.div
                                    animate={{ x: ['100%', '-100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-display font-bold text-gray-900">
                                {t('الخدمة قيد الإعداد', 'Service Being Prepared')}
                            </DialogTitle>
                            <div className="flex items-center justify-center gap-2 text-base font-medium">
                                <Rocket className="w-4 h-4 text-secondary animate-bounce" />
                                <span>{t('سيتوفر الرابط قريباً', 'Link will be available soon')}</span>
                            </div>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                {t(
                                    'نعمل على توفير هذه الخدمة وسيتم إطلاقها في أقرب وقت ممكن. شكراً لصبركم.',
                                    'We are working to provide this service and it will be launched as soon as possible. Thank you for your patience.'
                                )}
                            </p>
                        </div>

                        <div className="w-full max-w-xs mx-auto space-y-1">
                            <div className="flex justify-between text-xs font-bold text-secondary uppercase tracking-wider">
                                <span>{t('التقدم', 'Progress')}</span>
                                <span>75%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '75%' }}
                                    transition={{ duration: 1.2, delay: 0.3 }}
                                    className="h-full bg-gradient-to-r from-primary to-secondary"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-center gap-4 opacity-20">
                            <Cog className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
                            <Cog className="w-10 h-10 animate-[spin_12s_linear_infinite_reverse]" />
                            <Cog className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
                        </div>

                        <Button
                            onClick={() => setShowComingSoon(false)}
                            className="w-full rounded-xl h-12 font-bold"
                        >
                            {t('حسناً', 'Got it')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}