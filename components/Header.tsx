'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, X, LogIn, ChevronDown, Globe, Stethoscope, Heart, Settings, Briefcase, Search, Rocket, Users, MessageSquare, BookOpen, Microscope, Trophy, Smile, HeartPulse, Utensils, FileText, Book, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import nguLogo from '@/assets/hero-new.jpg';
import { mainNavRoutes, additionalRoutes } from '@/config/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

export const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollegesHovered, setIsCollegesHovered] = useState(false);
  const [isCentersHovered, setIsCentersHovered] = useState(false);
  const [isCampusLifeHovered, setIsCampusLifeHovered] = useState(false);
  const [isResearchHovered, setIsResearchHovered] = useState(false);
  const [isMoreHovered, setIsMoreHovered] = useState(false);
  const [openMobileSubMenu, setOpenMobileSubMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      router.push(href);
      setIsMobileMenuOpen(false);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const isActiveRoute = (href: string, isRoute?: boolean) => {
    if (!mounted) return false;

    if (!isRoute) {
      return typeof window !== 'undefined' && window.location.hash === href;
    }
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const colleges = [
    { id: 'medicine', ar: 'كلية الطب البشري', en: 'College of Human Medicine', icon: Stethoscope, href: '/colleges/medicine' },
    { id: 'health-sciences', ar: 'كلية العلوم الطبية والصحية', en: 'College of Medical & Health Sciences', icon: Heart, href: '/colleges/health-sciences' },
    { id: 'engineering-it', ar: 'كلية الهندسة وتكنولوجيا المعلومات', en: 'College of Engineering & IT', icon: Settings, href: '/colleges/engineering-it' },
    { id: 'business-humanities', ar: 'كلية العلوم الإدارية والانسأنيه', en: 'College of Administrative & Humanitarian Sciences', icon: Briefcase, href: '/colleges/business-humanities' },
  ];

  const centers = [
    { id: 'clinical-skills-center', ar: 'مركز المهارات السريرية', en: 'Clinical Skills Center', icon: Search, href: '/centers/clinical-skills-center' },
    { id: 'innovation-entrepreneurship-center', ar: 'مركز الابتكار وريادة الأعمال', en: 'Innovation & Entrepreneurship Center', icon: Rocket, href: '/centers/innovation-entrepreneurship-center' },
    { id: 'community-service-center', ar: 'مركز خدمة المجتمع', en: 'Community Service Center', icon: Users, href: '/centers/community-service-center' },
    { id: 'quality-accreditation-center', ar: 'مركز الجودة والاعتماد الأكاديمي', en: 'Quality & Academic Accreditation Center', icon: Microscope, href: '/centers/quality-accreditation-center' },
  ];

  const campusLife = [
    { id: 'library', ar: 'المكتبة المركزية', en: 'Central Library', icon: BookOpen, href: '/campus-life/central-library' },
    { id: 'labs', ar: 'المختبرات العلمية', en: 'Scientific Laboratories', icon: Microscope, href: '/campus-life/scientific-laboratories' },
    { id: 'sports', ar: 'الملاعب الرياضية', en: 'Sports Fields', icon: Trophy, href: '/campus-life/sports-fields' },
    { id: 'club', ar: 'النادي الطلابي', en: 'Student Club', icon: Smile, href: '/campus-life/student-club' },
    { id: 'health', ar: 'المركز الصحي', en: 'Health Center', icon: HeartPulse, href: '/campus-life/health-center' },
    { id: 'dining', ar: 'المطاعم والكافتيريات', en: 'Restaurants & Cafeterias', icon: Utensils, href: '/campus-life/restaurants-cafeterias' },
  ];

  const researchItems = [
    { id: 'journal', ar: 'المجلة العلمية', en: 'Scientific Journal', icon: Book, href: '/research/journal' },
    { id: 'articles', ar: 'المقالات العلمية', en: 'Scientific Articles', icon: FileText, href: '/research/articles' },
  ];

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.05,
        duration: 0.3,
        ease: "easeOut" as const
      }
    })
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-black/40 backdrop-blur-xl saturate-[1.8] border-b border-white/5 shadow-2xl'
        : 'bg-black/60 backdrop-blur-sm border-b border-white/10'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-x-4">
          {/* Logo */}
          <motion.button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 cursor-pointer group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className={`rounded-full overflow-hidden border-2 border-secondary transition-all duration-500 ${isScrolled ? 'w-10 h-10' : 'w-12 h-12'}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <img src={(nguLogo as any).src || nguLogo} alt={t('شعار NGU', 'NGU Logo')} className="w-full h-full object-cover" />
            </motion.div>
            <div className={`transition-all duration-500 text-white text-shadow flex flex-col justify-center`}>
              <h1 className={`font-display font-bold leading-tight group-hover:text-secondary transition-all duration-500 ${isScrolled ? 'text-xs sm:text-base md:text-lg' : 'text-[13px] xs:text-sm sm:text-lg md:text-xl'}`}>
                {t('جامعة الجيل الجديد', 'AJ JEEL ALJADEED UNIVERSITY')}
              </h1>
              <p className={`text-secondary/90 font-medium tracking-wider uppercase transition-all duration-500 ${isScrolled ? 'text-[6px] sm:text-[8px]' : 'text-[7px] xs:text-[8px] sm:text-[9px]'} mt-0.5`}>
                {t('لأجيال واعدة', 'FOR PROMISING GENERATIONS')}
              </p>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center xl:gap-8 lg:gap-5">
            {mainNavRoutes.map((item, index) => {
              const isColleges = item.href === '/colleges';
              const isCenters = item.href === '/centers';
              const isCampusLife = item.href === '/campus-life';
              const isResearch = item.href === '/research';

              if (isColleges || isCenters || isCampusLife || isResearch) {
                const hoveredState = isColleges ? isCollegesHovered : isCenters ? isCentersHovered : isCampusLife ? isCampusLifeHovered : isResearchHovered;
                const setHoveredState = isColleges ? setIsCollegesHovered : isCenters ? setIsCentersHovered : isCampusLife ? setIsCampusLifeHovered : setIsResearchHovered;
                const items = isColleges ? colleges : isCenters ? centers : isCampusLife ? campusLife : researchItems;
                const menuWidth = isColleges ? 'w-[520px]' : isCenters ? 'w-[500px]' : isCampusLife ? 'w-[480px]' : 'w-[450px]';

                return (
                  <div
                    key={index}
                    className="relative"
                    onMouseEnter={() => setHoveredState(true)}
                    onMouseLeave={() => setHoveredState(false)}
                  >
                    <motion.button
                      onClick={() => handleNavigation(item.href, item.isRoute)}
                      className={`transition-all duration-300 transition-colors duration-150 font-medium text-sm relative group text-white text-shadow-sm hover:text-secondary flex items-center gap-1 ${isActiveRoute(item.href, item.isRoute) ? 'text-secondary' : ''}`}
                      custom={index}
                      variants={navItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -2 }}
                    >
                      {t(item.ar, item.en)}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${hoveredState ? 'rotate-180' : ''}`} />
                      <motion.span
                        className={`absolute bottom-0 left-0 h-0.5 bg-secondary shadow-[0_0_10px_rgba(245,200,60,0.8)] ${isActiveRoute(item.href, item.isRoute) ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {hoveredState && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute top-full ${language === 'ar' ? 'right-0' : 'left-0'} mt-2 ${menuWidth} bg-background/95 backdrop-blur-xl border border-secondary/20 rounded-2xl shadow-2xl overflow-hidden z-50 p-5`}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            {items.map((subItem) => (
                              <motion.button
                                key={subItem.id}
                                onClick={() => handleNavigation(subItem.href, true)}
                                className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/10 group/item transition-all duration-300 text-right"
                                whileHover={{ x: language === 'ar' ? -5 : 5 }}
                              >
                                <div className="p-2.5 rounded-lg bg-secondary/10 text-secondary group-hover/item:bg-secondary group-hover/item:text-primary transition-colors duration-300">
                                  <subItem.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-foreground font-bold text-sm mb-0.5 group-hover/item:text-secondary transition-colors">
                                    {t(subItem.ar, subItem.en)}
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                                    {language === 'ar' ? 'اكتشف المزيد من التفاصيل والمعلومات' : 'Explore more details and information'}
                                  </p>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-secondary/10 flex justify-center items-center">
                            <span className="text-[10px] text-muted-foreground/60 italic font-medium">
                              {t('بوابة التميز والجيل الجديد', 'Portal of Excellence and Next Generation')}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleNavigation(item.href, item.isRoute)}
                  className={`transition-all duration-300 transition-colors duration-150 font-medium text-sm relative group text-white text-shadow-sm hover:text-secondary ${isActiveRoute(item.href, item.isRoute) ? 'text-secondary' : ''}`}
                  custom={index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2 }}
                >
                  {t(item.ar, item.en)}
                  <motion.span
                    className={`absolute bottom-0 left-0 h-0.5 bg-secondary shadow-[0_0_10px_rgba(245,200,60,0.8)] ${isActiveRoute(item.href, item.isRoute) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              );
            })}

            {mounted && additionalRoutes.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setIsMoreHovered(true)}
                onMouseLeave={() => setIsMoreHovered(false)}
              >
                <motion.button
                  className={`transition-all duration-300 transition-colors duration-150 font-medium text-sm relative group flex items-center gap-1 text-white text-shadow-sm hover:text-secondary ${isMoreHovered ? 'text-secondary' : ''}`}
                  custom={mainNavRoutes.length}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2 }}
                >
                  {t('المزيد', 'More')}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMoreHovered ? 'rotate-180' : ''}`} />
                  <motion.span
                    className={`absolute bottom-0 left-0 h-0.5 bg-secondary shadow-[0_0_10px_rgba(245,200,60,0.8)] ${isMoreHovered ? 'w-full' : 'w-0 group-hover:w-full'}`}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <AnimatePresence>
                  {isMoreHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full ${language === 'ar' ? 'right-0' : 'left-0'} mt-2 w-[220px] bg-background/95 backdrop-blur-xl border border-secondary/20 rounded-xl shadow-2xl overflow-hidden z-50 p-2`}
                    >
                      <div className="flex flex-col gap-1">
                        {additionalRoutes.map((item, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleNavigation(item.href, item.isRoute)}
                            className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-right transition-all duration-200 group/item ${isActiveRoute(item.href, item.isRoute) ? 'bg-secondary/20 text-secondary' : 'hover:bg-secondary/10 text-foreground'}`}
                            whileHover={{ x: language === 'ar' ? -5 : 5 }}
                          >
                            <span className="text-sm font-bold flex-1">
                              {t(item.ar, item.en)}
                            </span>
                            <ChevronLeft className={`w-4 h-4 text-secondary/40 group-hover/item:text-secondary transition-transform ${language === 'ar' ? '' : 'rotate-180'}`} />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Login, Language Toggle & Mobile Menu */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                onClick={() => router.push('/login')}
                className="bg-secondary hover:bg-secondary/90 text-primary hover:text-primary font-bold transition-all duration-300 glow-gold hidden sm:flex gap-2 rounded-full px-5 py-5 border-2 border-secondary/20 h-9"
              >
                <LogIn className="w-4 h-4" />
                {t('تسجيل الدخول', 'Login')}
              </Button>
            </motion.div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleLanguage}
                      className="transition-all duration-300 group bg-white/5 text-white border-white/20 hover:bg-white hover:text-primary rounded-full px-4 h-9 backdrop-blur-sm"
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                      </motion.div>
                      {language === 'ar' ? 'EN' : 'عربي'}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('تبديل اللغة', 'Switch Language')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>



            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="transition-all duration-300 group bg-white/5 text-white border-white/20 hover:bg-white hover:text-primary rounded-full px-3 h-9 backdrop-blur-sm"
                    >
                      <AnimatePresence mode="wait">
                        {!mounted ? (
                          <motion.div
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Sun className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key={theme}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {theme === 'dark' ? (
                              <Moon className="w-4 h-4" />
                            ) : (
                              <Sun className="w-4 h-4" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('تبديل الوضع', 'Toggle Theme')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden transition-all duration-300 text-white text-shadow-sm z-[100] bg-white/10 p-2 rounded-xl hover:bg-white/20 border border-white/20 ml-1 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-80 flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <SheetTitle className="text-start font-display text-xl">
              {t('القائمة', 'Menu')}
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            <div className="space-y-6">
              {/* Login Button in Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  size="sm"
                  onClick={() => {
                    router.push('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-secondary hover:bg-secondary/90 text-primary font-semibold transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 ml-2" />
                  {t('تسجيل الدخول', 'Login')}
                </Button>
              </motion.div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  {t('الصفحات الرئيسية', 'Main Pages')}
                </h3>
                <nav className="flex flex-col gap-2">
                  {mainNavRoutes.map((item, index) => {
                    const isColleges = item.href === '/colleges';
                    const isCenters = item.href === '/centers';
                    const isCampusLife = item.href === '/campus-life';
                    const isResearch = item.href === '/research';
                    const hasSubMenu = isColleges || isCenters || isCampusLife || isResearch;
                    const subItems = isColleges ? colleges : isCenters ? centers : isCampusLife ? campusLife : researchItems;
                    const isSubMenuOpen = openMobileSubMenu === item.href;

                    return (
                      <div key={index}>
                        <motion.button
                          onClick={() => {
                            if (hasSubMenu) {
                              setOpenMobileSubMenu(isSubMenuOpen ? null : item.href);
                            } else {
                              handleNavigation(item.href, item.isRoute);
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={`mobile-nav-item text-lg font-medium text-foreground hover:text-secondary transition-all duration-200 text-start py-2.5 px-3 rounded-lg flex items-center justify-between group ${isActiveRoute(item.href, item.isRoute)
                            ? 'bg-[rgba(245,200,60,0.22)] text-secondary is-active'
                            : 'hover:bg-[rgba(245,200,60,0.22)]'
                            }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.05 }}
                          whileHover={{ x: language === 'ar' ? -5 : 5 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.span
                              className={`w-1 h-6 bg-secondary rounded-full ${isActiveRoute(item.href, item.isRoute) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            />
                            {t(item.ar, item.en)}
                          </div>
                          {hasSubMenu && (
                            <motion.div
                              animate={{ rotate: isSubMenuOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="w-5 h-5 text-muted-foreground line-clamp-1" />
                            </motion.div>
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {hasSubMenu && isSubMenuOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="ms-8 mt-1 space-y-1 mb-4 border-s-2 border-secondary/10">
                                {subItems.map((subItem) => (
                                  <button
                                    key={subItem.id}
                                    onClick={() => {
                                      handleNavigation(subItem.href, true);
                                      setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-start py-3 px-4 text-sm text-muted-foreground hover:text-secondary hover:bg-secondary/5 transition-all flex items-center gap-3 rounded-e-lg group/subitem`}
                                  >
                                    <div className="p-1.5 rounded-md bg-secondary/5 group-hover/subitem:bg-secondary/10 transition-colors">
                                      <subItem.icon className="w-4 h-4 text-secondary/70 group-hover/subitem:text-secondary" />
                                    </div>
                                    <span className="font-medium">
                                      {t(subItem.ar, subItem.en)}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {additionalRoutes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <span className="w-1 h-4 bg-secondary rounded-full"></span>
                      {t('المزيد', 'More')}
                    </h3>
                    <nav className="flex flex-col gap-2">
                      {additionalRoutes.map((item, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            handleNavigation(item.href, item.isRoute);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`mobile-nav-item text-base font-medium text-foreground hover:text-secondary transition-all duration-200 text-start py-2.5 px-3 rounded-lg flex items-center justify-between group ${isActiveRoute(item.href, item.isRoute)
                            ? 'bg-[rgba(245,200,60,0.22)] text-secondary is-active'
                            : 'hover:bg-[rgba(245,200,60,0.22)]'
                            }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          whileHover={{ x: language === 'ar' ? -5 : 5 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.span
                              className={`w-1 h-5 bg-secondary/50 rounded-full ${isActiveRoute(item.href, item.isRoute) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            />
                            {t(item.ar, item.en)}
                          </div>
                          <ChevronLeft className={`w-4 h-4 text-muted-foreground/50 transition-transform group-hover:text-secondary ${language === 'ar' ? '' : 'rotate-180'}`} />
                        </motion.button>
                      ))}
                    </nav>
                  </div>
                </>
              )}

              {/* Bottom Padding for scrolling */}
              <div className="h-4" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-primary to-secondary origin-left z-[60]"
        style={{ scaleX }}
      />
    </motion.header >
  );
};



