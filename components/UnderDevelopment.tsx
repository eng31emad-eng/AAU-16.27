'use client'

import { motion } from 'framer-motion';
import { Construction, ArrowLeft, Home, Rocket, Cog, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface UnderDevelopmentProps {
    titleAr: string;
    titleEn: string;
}

export const UnderDevelopment = ({ titleAr, titleEn }: UnderDevelopmentProps) => {
    const router = useRouter();
    const { t, language } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 flex items-center justify-center py-24 px-4 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="container max-w-2xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8"
                    >
                        {/* Icon Group */}
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-secondary/30 rounded-full scale-150"
                            />
                            <div className="w-24 h-24 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto border border-secondary/20 relative z-10 overflow-hidden shadow-xl">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Construction className="w-12 h-12 text-secondary" />
                                </motion.div>

                                {/* Shiny Effect */}
                                <motion.div
                                    animate={{ x: ['100%', '-100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent py-2 leading-relaxed">
                                {t(titleAr, titleEn)}
                            </h1>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-xl font-medium text-foreground">
                                    <Rocket className="w-5 h-5 text-secondary animate-bounce" />
                                    <span>{t('الصفحة قيد التطوير والعمل', 'Page Under Construction')}</span>
                                </div>
                                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                                    {t(
                                        'نحن نعمل بجد لإطلاق هذه الخدمة قريباً لتوفير أفضل تجربة تعليمية لأبنائنا الطلاب.',
                                        'We are working hard to launch this service soon to provide the best educational experience for our students.'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="w-full max-w-xs mx-auto space-y-2">
                            <div className="flex justify-between text-xs font-bold text-secondary uppercase tracking-wider">
                                <span>{t('التقدم', 'Progress')}</span>
                                <span>75%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden border border-secondary/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '75%' }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-primary to-secondary"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="rounded-xl px-8 py-6 h-auto text-lg font-bold border-secondary/30 hover:bg-secondary/10 transition-all group"
                            >
                                {language === 'ar' ? <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />}
                                {t('العودة للسابق', 'Go Back')}
                            </Button>

                            <Button
                                onClick={() => router.push('/')}
                                className="rounded-xl px-8 py-6 h-auto text-lg font-bold bg-secondary hover:bg-secondary/90 text-primary transition-all shadow-lg shadow-secondary/20 group"
                            >
                                <Home className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                                {t('الرئيسية', 'Home')}
                            </Button>
                        </div>

                        <div className="pt-8 flex items-center justify-center gap-6 opacity-30">
                            <Cog className="w-8 h-8 animate-[spin_8s_linear_infinite]" />
                            <Cog className="w-12 h-12 animate-[spin_12s_linear_infinite_reverse]" />
                            <Cog className="w-6 h-6 animate-[spin_6s_linear_infinite]" />
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
