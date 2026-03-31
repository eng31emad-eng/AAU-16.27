'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CenterItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Building2,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    GraduationCap,
    Clock
} from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface CenterDetailsContentProps {
    center: CenterItem;
    relatedCenters: CenterItem[];
}

export default function CenterDetailsContent({ center, relatedCenters }: CenterDetailsContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';

    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container mx-auto px-4 py-8 relative z-10">
                    <Breadcrumb
                        items={[
                            { label: { ar: 'المراكز', en: 'Centers' }, href: '/centers' },
                            { label: { ar: center.titleAr, en: center.titleEn } }
                        ]}
                    />



                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl"
                    >
                        {/* Icon Badge */}
                        <motion.div
                            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Building2 className="w-4 h-4" />
                            {t('مركز متخصص', 'Specialized Center')}
                        </motion.div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
                            {t(center.titleAr, center.titleEn)}
                        </h1>

                        {/* Description */}
                        <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                            {t(center.descAr, center.descEn)}
                        </p>

                        {/* Quick Info */}
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                            {center.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{center.location}</span>
                                </div>
                            )}
                            {center.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-primary" />
                                    <span dir="ltr">{center.phone}</span>
                                </div>
                            )}
                            {center.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <span>{center.email}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Center Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Featured Image */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px]">
                            <Image
                                src={center.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'}
                                alt={t(center.titleAr, center.titleEn)}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                            {/* Icon Overlay */}
                            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-primary-foreground" />
                            </div>
                        </div>

                        {/* Services Card */}
                        <Card className="border-primary/20">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                                    <Briefcase className="w-6 h-6 text-primary" />
                                    {t('الخدمات', 'Services')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {center.services.map((service, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/80 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-foreground/90 font-medium">
                                                {t(service.ar, service.en)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Programs Card */}
                        <Card className="border-secondary/20">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-secondary rounded-full"></div>
                                    <GraduationCap className="w-6 h-6 text-secondary" />
                                    {t('البرامج', 'Programs')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {center.programs.map((program, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/80 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-secondary" />
                                            </div>
                                            <span className="text-foreground/90 font-medium">
                                                {t(program.ar, program.en)}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        {/* Related Centers - Premium Card */}
                        <div className="sticky top-24 border-[2px] border-[#C9A961]/30 rounded-[2rem] overflow-hidden shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                            {/* Card Header */}
                            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 text-center overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                                <Building2 className="w-8 h-8 text-white/80 mx-auto mb-2" />
                                <h3 className="text-lg font-bold text-white">
                                    {t('مراكز أخرى', 'Other Centers')}
                                </h3>
                                <div className="w-10 h-0.5 bg-[#C9A961] mx-auto mt-3 rounded-full"></div>
                            </div>

                            {/* Centers List */}
                            <div className="p-5 space-y-3 max-h-[500px] overflow-y-auto">
                                {relatedCenters.map((item, index) => (
                                    <Link
                                        key={item.id}
                                        href={`/centers/${item.id}`}
                                        className="group block"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className="flex gap-3 p-3 rounded-xl border border-transparent hover:border-[#C9A961]/20 hover:bg-[#C9A961]/5 transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0 group-hover:from-primary/25 group-hover:to-secondary/25 transition-colors">
                                                <Building2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                    {t(item.titleAr, item.titleEn)}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                    {t(item.descAr, item.descEn)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>

                            {/* View All Button */}
                            <div className="p-5 pt-0">
                                <Button
                                    variant="outline"
                                    className="w-full rounded-full border-[#C9A961]/40 hover:border-[#C9A961] hover:bg-[#C9A961]/5 transition-all"
                                    onClick={() => router.push('/centers')}
                                >
                                    {t('عرض جميع المراكز', 'View All Centers')}
                                </Button>
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}
