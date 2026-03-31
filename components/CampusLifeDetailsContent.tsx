'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CampusLifeItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Home, Sparkles, Heart } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface CampusLifeDetailsContentProps {
    item: CampusLifeItem;
    relatedItems: CampusLifeItem[];
}

export default function CampusLifeDetailsContent({ item, relatedItems }: CampusLifeDetailsContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';

    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    // Get category translation
    const getCategoryLabel = (category: string) => {
        const labels: Record<string, { ar: string; en: string }> = {
            facilities: { ar: 'مرافق', en: 'Facilities' },
            activities: { ar: 'أنشطة', en: 'Activities' },
            campus: { ar: 'الحرم الجامعي', en: 'Campus' },
        };
        return labels[category] || { ar: category, en: category };
    };

    const categoryLabel = getCategoryLabel(item.category);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
                <div className="container mx-auto px-4 py-6">
                    {/* Breadcrumbs */}
                    <Breadcrumb
                        items={[
                            { label: { ar: 'الحياة الجامعية', en: 'Campus Life' }, href: '/campus-life' },
                            { label: { ar: item.titleAr, en: item.titleEn } }
                        ]}
                    />



                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-3">
                        {t(item.titleAr, item.titleEn)}
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        {t(item.descriptionAr, item.descriptionEn)}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar - معلومات جمالية - بدون روابط */}
                    <motion.aside
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-3 order-2 lg:order-1"
                    >
                        {/* Card with Premium Golden Border and Glassmorphism feel */}
                        <div className="sticky top-24 border-[2px] border-[#C9A961]/30 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                            {/* Premium Header */}
                            <div className="relative bg-black p-8 text-center overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A961]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C9A961]/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
                                <h3 className="text-xl font-display font-bold text-white relative z-10">
                                    {t('تجربة جامعية فريدة', 'Unique Campus Experience')}
                                </h3>
                                <div className="w-12 h-1 bg-[#C9A961] mx-auto mt-4 rounded-full"></div>
                            </div>

                            {/* Content Area */}
                            <div className="p-8 space-y-10">
                                {/* Values/Features List - Static Informative */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">
                                        {t('ما يميز هذا المرفق', 'Facility Highlights')}
                                    </h4>

                                    <div className="space-y-5">
                                        {[
                                            { ar: 'بيئة دراسية محفزة', en: 'Stimulating Study Environment', icon: <Sparkles className="w-5 h-5" /> },
                                            { ar: 'أحدث التجهيزات التقنية', en: 'Modern Technical Equipment', icon: <Home className="w-5 h-5" /> }, // Refers to the Home icon used in detail view
                                            { ar: 'دعم وخدمة مستمرة', en: 'Continuous Support & Service', icon: <Heart className="w-5 h-5" /> }
                                        ].map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-[#C9A961]/5 flex items-center justify-center text-[#C9A961] border border-[#C9A961]/20 group-hover:bg-[#C9A961]/10 transition-colors">
                                                    {feat.icon}
                                                </div>
                                                <span className="text-sm font-medium leading-tight">
                                                    {t(feat.ar, feat.en)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

                                {/* Stats Cards - Enhanced Aesthetics */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-muted/20 dark:to-muted/10 rounded-2xl p-6 text-center border border-[#C9A961]/10 relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-[#C9A961]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="text-4xl font-display font-bold mb-1 text-primary">+15</div>
                                        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                                            {t('مرفقاً حديثاً', 'Modern Facilities')}
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-muted/20 dark:to-muted/10 rounded-2xl p-6 text-center border border-[#C9A961]/10 relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-[#C9A961]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="text-4xl font-display font-bold mb-1 text-secondary">+10</div>
                                        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                                            {t('أنشطة طلابية', 'Student Activities')}
                                        </div>
                                    </div>
                                </div>

                                {/* Quality Seal or Similar Static Note */}
                                <div className="pt-4 text-center">
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        {t(
                                            'نلتزم بتقديم أفضل المعايير التعليمية والترفيهية لطلابنا في جميع مرافق الجامعة.',
                                            'We are committed to providing the best educational and recreational standards for our students.'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Bottom Bar */}
                            <div className="h-2 bg-[#C9A961]"></div>
                        </div>
                    </motion.aside>

                    {/* Main Content Area */}
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-9 order-1 lg:order-2"
                    >
                        {/* Featured Image */}
                        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[550px] rounded-2xl mb-8 overflow-hidden shadow-xl border border-border/50 bg-muted">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={t(item.titleAr, item.titleEn)}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <Home className="w-10 h-10 text-primary/40" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">
                                            {t('لا توجد صورة متوفرة', 'No image available')}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* Gradient Overlay for better title contrast if needed later */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        </div>

                        {/* About Section */}
                        <div className="bg-card border rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                                <h2 className="text-2xl font-bold">
                                    {t('عن هذه التجربة', 'About This Experience')}
                                </h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {t(item.contentAr, item.contentEn)}
                            </p>
                        </div>

                    </motion.main>
                </div>
            </div>
        </div>
    );
}
