'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Calendar, User } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProjectDetailsContentProps {
    project: ProjectItem;
    relatedProjects: ProjectItem[];
}

export default function ProjectDetailsContent({ project, relatedProjects }: ProjectDetailsContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';

    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get status label and color
    const getStatusInfo = (status: string) => {
        if (status === 'current') {
            return {
                label: { ar: 'مشروع حالي', en: 'Current Project' },
                color: 'bg-primary text-primary-foreground'
            };
        }
        return {
            label: { ar: 'مشروع مكتمل', en: 'Completed Project' },
            color: 'bg-green-600 text-white'
        };
    };

    const statusInfo = getStatusInfo(project.status);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
                <div className="container mx-auto px-4 py-6">
                    {/* Breadcrumbs */}
                    <Breadcrumb
                        items={[
                            { label: { ar: 'مشاريع التخرج', en: 'Graduation Projects' }, href: '/projects-studio' },
                            { label: { ar: project.titleAr, en: project.titleEn } }
                        ]}
                    />

                    {/* Back Button */}




                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-3 py-2 leading-relaxed">
                        {t(project.titleAr, project.titleEn)}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                        {/* Students names removed as requested for collective projects appearance */}
                        {project.startDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(project.startDate)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Featured Image */}
                    <div className="relative w-full h-[300px] md:h-[500px] bg-muted rounded-2xl overflow-hidden shadow-xl border">
                        {project.images?.[0] ? (
                            <motion.img
                                initial={{ scale: 1.1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                src={project.images[0]}
                                alt={t(project.titleAr, project.titleEn)}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                                <div className="text-muted-foreground flex flex-col items-center">
                                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{t('لا توجد صورة متوفرة', 'No image available')}</span>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Overview Section with Golden Gradient */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative bg-gradient-to-br from-[#D4AF37] via-[#F4E4B0] to-[#C9A961] border-2 border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 overflow-hidden shadow-lg"
                    >
                        {/* Decorative overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-1 w-12 bg-white/50 rounded-full shadow-sm"></div>
                                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                                    {t('نظرة عامة', 'Overview')}
                                </h2>
                            </div>
                            <p className="text-white/95 leading-relaxed text-lg drop-shadow">
                                {t(project.descAr, project.descEn)}
                            </p>
                        </div>
                    </motion.div>

                    {/* Details Section with Golden Accent */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative bg-gradient-to-br from-[#D4AF37]/10 via-[#F4E4B0]/5 to-background border-2 border-[#D4AF37]/20 rounded-2xl p-6 md:p-8 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#D4AF37] to-[#C9A961] bg-clip-text text-transparent">
                                {t('التفاصيل', 'Details')}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                                {t(project.detailsAr || '', project.detailsEn || '')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Progress Section - Only for current projects */}
                    {project.status === 'current' && project.progress !== undefined && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-card border rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">
                                {t('حالة التقدم', 'Progress Status')}
                            </h2>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">
                                    {t('نسبة الإنجاز', 'Completion Rate')}
                                </span>
                                <span className="text-2xl font-bold">{project.progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}


                </div>
            </div>
        </div>
    );
}
