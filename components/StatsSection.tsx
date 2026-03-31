'use client'
import { GraduationCap, Users, Award, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

type StatItem = {
    key?: string
    number?: string
    labelAr?: string
    labelEn?: string
    icon?: string
}

const iconMap: Record<string, any> = {
    GraduationCap,
    Users,
    BookOpen,
    Award,
}

export const StatsSection = ({ stats }: { stats?: StatItem[] }) => {
    const { t } = useLanguage();

    const defaultStats = [
        { icon: GraduationCap, number: '10,000+', label: { ar: 'طالب وطالبة', en: 'Students' } },
        { icon: Users, number: '500+', label: { ar: 'عضو هيئة تدريس', en: 'Faculty Members' } },
        { icon: BookOpen, number: '50+', label: { ar: 'برنامج أكاديمي', en: 'Academic Programs' } },
        { icon: Award, number: '4', label: { ar: 'كليات متخصصة', en: 'Specialized Colleges' } },
    ];

    const mappedStats = Array.isArray(stats) && stats.length > 0
        ? stats.map((item) => ({
            icon: iconMap[item.icon || ''] || GraduationCap,
            number: item.number || '0',
            label: { ar: item.labelAr || '', en: item.labelEn || '' },
        }))
        : defaultStats;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const statsVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: i * 0.1,
                ease: "easeOut" as const
            }
        })
    };

    return (
        <section className="relative z-20 mt-6 md:mt-8 px-4 mb-12 md:mb-16">
            <div className="container mx-auto">
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {mappedStats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-[rgba(210,170,50,0.35)] rounded-2xl p-4 sm:p-6 transition-all duration-300 border border-white/10 shadow-lg group"
                            custom={index}
                            variants={statsVariants}
                        >
                            <motion.div
                                className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-xl bg-[rgba(210,170,50,0.45)] flex items-center justify-center transition-colors"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                <stat.icon className="w-7 h-7 text-black" />
                            </motion.div>
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2 text-center font-display">
                                {stat.number}
                            </div>
                            <div className="text-black text-xs sm:text-sm font-medium text-center">
                                {t(stat.label.ar, stat.label.en)}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};


