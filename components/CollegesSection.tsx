'use client'
import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Users, BookOpen, Award, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { College } from '@/types';
import { motion, useInView } from 'framer-motion';

interface CollegesSectionProps {
  initialData?: College[];
  sectionContent?: {
    titleAr?: string
    titleEn?: string
    descriptionAr?: string
    descriptionEn?: string
  }
}

export const CollegesSection = ({ initialData, sectionContent }: CollegesSectionProps) => {
  const { t, language } = useLanguage();
  const router = useRouter();
  const colleges = initialData || [];
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section id="colleges" className="py-16 md:py-20 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap className="w-4 h-4" />
            {t('التميز الأكاديمي', 'Academic Excellence')}
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent py-2 leading-relaxed">
            {t(sectionContent?.titleAr || 'كلياتنا', sectionContent?.titleEn || 'Our Colleges')}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              sectionContent?.descriptionAr || 'نقدم مجموعة متنوعة من البرامج الأكاديمية المتميزة في مختلف التخصصات',
              sectionContent?.descriptionEn || 'We offer a diverse range of distinguished academic programs in various specializations'
            )}
          </p>
        </motion.div>

        {/* Colleges Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {colleges.map((college, index) => (
            <motion.div
              key={college.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50"
              variants={cardVariants}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)"
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Image Section */}
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <motion.img
                  src={college.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'}
                  alt={t(college.nameAr, college.nameEn)}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* College Icon */}
                <motion.div
                  className="absolute top-4 right-4 w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <GraduationCap className="w-7 h-7 text-white" />
                </motion.div>

                {/* College Name on Image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {t(college.nameAr, college.nameEn)}
                  </h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {college.programs?.length || 4} {t('برامج', 'Programs')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      50+ {t('أستاذ', 'Faculty')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 sm:p-6">
                <p className="text-muted-foreground mb-4 sm:mb-6 line-clamp-2">
                  {t(college.descriptionAr, college.descriptionEn)}
                </p>



                {/* Action Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full group/btn font-bold"
                    variant="secondary"
                    onClick={() => router.push(`/colleges/${college.id}`)}
                  >
                    {t('استكشف الكلية', 'Explore College')}
                    {language === 'ar' ? (
                      <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover/btn:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-10 md:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/colleges')}
              className="group"
            >
              {t('عرض جميع الكليات', 'View All Colleges')}
              {language === 'ar' ? (
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

