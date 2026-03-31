'use client'
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

export const Footer = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-50px" });

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/ngu.edu.iq', label: t('فيسبوك', 'Facebook') },
    { icon: Twitter, href: 'https://twitter.com/ngu_edu_iq', label: t('تويتر', 'Twitter') },
    { icon: Instagram, href: 'https://instagram.com/ngu.edu.iq', label: t('إنستغرام', 'Instagram') },
    { icon: Linkedin, href: 'https://linkedin.com/school/ngu-edu-iq', label: t('لينكدإن', 'LinkedIn') },
  ];

  const quickLinks = [
    { ar: 'الكليات', en: 'Colleges', href: '/colleges' },
    { ar: 'القبول', en: 'Admission', href: '/admission' },
    { ar: 'الأخبار', en: 'News', href: '/news' },
    { ar: 'تواصل معنا', en: 'Contact', href: '/contact' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden" ref={footerRef}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          className="grid md:grid-cols-4 gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Logo & Description */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <GraduationCap className="w-8 h-8 text-primary" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-display font-bold text-secondary">
                  {t('جامعة الجيل الجديد', 'AJ JEEL ALJADEED UNIVERSITY')}
                </h3>
                <p className="text-sm text-primary-foreground/70">AAU</p>
              </div>
            </motion.div>
            <p className="text-primary-foreground/80 leading-relaxed max-w-md">
              {t(
                'مؤسسة تعليمية رائدة تهدف إلى إعداد خريجين متخصصين ومؤهلين علميًا وتقنيًا للمساهمة في تنمية المجتمع.',
                'A leading educational institution aiming to prepare specialized and scientifically qualified graduates to contribute to community development.'
              )}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold text-secondary mb-4">
              {t('روابط سريعة', 'Quick Links')}
            </h4>
            <nav className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  className="block text-primary-foreground/80 hover:text-secondary transition-colors"
                  whileHover={{ x: language === 'ar' ? -5 : 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {t(link.ar, link.en)}
                </motion.a>
              ))}
            </nav>
          </motion.div>

          {/* Location & Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold text-secondary mb-6">
              {t('تواصل معنا', 'Contact Us')}
            </h4>
            <div className="space-y-4">
              {/* Mini Map Card */}
              <motion.div 
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden group/map cursor-pointer h-24 relative"
                whileHover={{ scale: 1.02 }}
                onClick={() => window.open('https://maps.google.com/?q=Sanaa,Yemen', '_blank')}
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&q=80')] bg-cover bg-center opacity-40 group-hover/map:opacity-60 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
                <div className="relative p-3 h-full flex items-end">
                  <div className="flex items-center gap-2 text-white">
                    <div className="p-1.5 bg-secondary rounded-lg shadow-lg">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold">{t('الموقع', 'Location')}</p>
                      <p className="text-xs font-bold leading-tight">{t('صنعاء، اليمن', 'Sanaa, Yemen')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3 pt-2">
                <motion.a
                  href="tel:+964XXXXXXXX"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-secondary transition-colors group"
                  whileHover={{ x: language === 'ar' ? -5 : 5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">+964 XXX XXX XXXX</span>
                </motion.a>
                <motion.a
                  href="mailto:info@ngu.edu.iq"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-secondary transition-colors group"
                  whileHover={{ x: language === 'ar' ? -5 : 5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">info@ngu.edu.iq</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent mb-8"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Social Links Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-secondary hover:text-primary transition-all duration-300 group"
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                aria-label={social.label}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <social.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase group-hover:text-primary transition-colors">{social.label}</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <motion.p
            className="text-sm text-primary-foreground/70 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            © {currentYear} {t('جامعة الجيل الجديد. جميع الحقوق محفوظة.', 'AJ JEEL ALJADEED UNIVERSITY. All rights reserved.')}
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
};



