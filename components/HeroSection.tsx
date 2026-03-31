'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronDown, GraduationCap, Users, Award, BookOpen, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroCampus from '@/assets/hero-new.jpg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Download, ZoomIn } from 'lucide-react';

type HeroCmsContent = {
  badgeAr?: string
  badgeEn?: string
  titlePrimaryAr?: string
  titlePrimaryEn?: string
  titleSecondaryAr?: string
  titleSecondaryEn?: string
  descriptionAr?: string
  descriptionEn?: string
  image?: string
}

export const HeroSection = ({ hero }: { hero?: HeroCmsContent }) => {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const [isMounted, setIsMounted] = useState(false);
  const heroData: HeroCmsContent = {
    badgeAr: 'مرحباً بكم في جامعة الجيل الجديد',
    badgeEn: 'Welcome to AJ JEEL ALJADEED UNIVERSITY',
    titlePrimaryAr: 'جامعة الجيل الجديد',
    titlePrimaryEn: 'ALJEEL AL JADEED',
    titleSecondaryAr: 'الجامعة',
    titleSecondaryEn: 'UNIVERSITY',
    descriptionAr: 'مؤسسة تعليمية رائدة تهدف إلى إعداد خريجين متخصصين ومؤهلين علميًا وتقنيًا لخدمة المجتمع',
    descriptionEn: 'A leading educational institution aiming to prepare specialized and scientifically qualified graduates to serve the community',
    image: '',
    ...(hero || {}),
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };



  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aspect-Ratio Background Container */}
      <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
        <motion.div
          className="relative w-full aspect-video sm:aspect-[21/9] lg:aspect-[21/7] overflow-hidden"
          style={{ y }}
        >
          <Image
            src={heroData.image || heroCampus}
            alt={t('الحرم الجامعي', 'University Campus')}
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40"></div><div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
        </motion.div>
      </div>

      {/* Animated Background Elements & Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        {isMounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-secondary/40 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl text-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl text-secondary"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 pt-12 sm:pt-20 md:pt-32 text-center text-white"
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20"
            variants={itemVariants}
          >
            <GraduationCap className="w-4 h-4 text-secondary" />
            {t(heroData.badgeAr || '', heroData.badgeEn || '')}
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-relaxed py-4"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-white via-secondary to-white bg-clip-text text-transparent drop-shadow-2xl">
              {t(heroData.titlePrimaryAr || '', heroData.titlePrimaryEn || '')}
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl text-secondary drop-shadow-lg mt-2">{t(heroData.titleSecondaryAr || '', heroData.titleSecondaryEn || '')}</span>
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center pt-2"
          >
            <span className="text-secondary font-display text-xl sm:text-2xl font-bold tracking-[0.2em] opacity-90">
              {t('لأجيال واعدة', 'FOR PROMISING GENERATIONS')}
            </span>
          </motion.div>

          <motion.p
            className="text-base sm:text-lg md:text-2xl text-white/80 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            {t(heroData.descriptionAr || '', heroData.descriptionEn || '')}
          </motion.p>

          {/* Main Action & Shortcuts Grid */}
          <motion.div
            className="space-y-8"
            variants={itemVariants}
          >
            {/* Primary Action */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={() => router.push('/admission')}
                className="bg-secondary text-primary hover:bg-secondary/90 text-lg md:text-xl px-10 py-7 md:py-8 rounded-2xl shadow-2xl shadow-secondary/20 group w-full sm:w-auto font-bold"
              >
                {t('التقديم الآن', 'Apply Now')}
                {language === 'ar' ? (
                  <ArrowLeft className="w-6 h-6 mr-3 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </motion.div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Colleges Shortcut */}
              <motion.button
                onClick={() => router.push('/colleges')}
                className="group p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-secondary/20 hover:border-secondary/40 transition-all shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm sm:text-base group-hover:text-secondary transition-colors">{t('استكشف الكليات', 'Explore Colleges')}</span>
              </motion.button>

              {/* Student Results Shortcut */}
              <motion.button
                onClick={() => window.open('https://result.yemenexam.com/', '_blank', 'noopener,noreferrer')}
                className="group p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/20 hover:border-white/40 transition-all shadow-lg"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm sm:text-base">{t('نتائج الطلاب', 'Student Results')}</span>
              </motion.button>

              {/* Academic Calendar Shortcut */}
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    className="group p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/20 hover:border-white/40 transition-all shadow-lg"
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-colors">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm sm:text-base">{t('التقويم الجامعي', 'Academic Calendar')}</span>
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-[95vw] h-[80vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-lg border-secondary/20">
                  <DialogHeader className="p-6 border-b border-border/50 flex flex-row items-center justify-between">
                    <DialogTitle className="text-2xl font-display font-bold flex items-center gap-3">
                      <CalendarIcon className="w-6 h-6 text-secondary" />
                      {t('التقويم الجامعي للعام 2024-2025', 'Academic Calendar 2024-2025')}
                    </DialogTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-full hover:bg-secondary/10 border-border/50">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full hover:bg-secondary/10 border-border/50">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </DialogHeader>
                  <div className="flex-1 relative bg-muted/30 overflow-auto p-4 flex items-start justify-center">
                    <div className="relative w-full max-w-3xl aspect-[1/1.4] bg-white shadow-2xl rounded-lg overflow-hidden border border-border/50">
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <div className="text-center p-8">
                          <CalendarIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">
                            {t('سيتم رفع التقويم الرسمي فور صدوره من الوزارة', 'The official calendar will be uploaded as soon as it is issued by the Ministry')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>


        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToAbout}
        className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-secondary transition-colors group z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs sm:text-sm font-medium">{t('اكتشف المزيد', 'Discover More')}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        </div>
      </motion.button>
    </section>
  );
};
