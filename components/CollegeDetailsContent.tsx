'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { College, FacultyMember } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight, ArrowLeft, Target, Eye, BookOpen, CheckCircle2,
    GraduationCap, Users, Award, Calendar, Flag, Newspaper,
    Library, CalendarDays, FileSpreadsheet,
    Facebook, Instagram, MessageCircle,
    Construction, Rocket, Cog
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { DisplayName } from '@/lib/transliterateArabicName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

interface CollegeDetailsContentProps {
    college: College;
    facultyMembers: FacultyMember[];
}

export default function CollegeDetailsContent({ college, facultyMembers }: CollegeDetailsContentProps) {
    const router = useRouter();
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
    const [showComingSoon, setShowComingSoon] = useState(false);
    const averageAdmissionRate = college.programs.length
        ? Math.round(college.programs.reduce((total, program) => total + (Number(program.admissionRate) || 0), 0) / college.programs.length)
        : 0;
    const deanDisplayName = t(college.deanNameAr || '', college.deanNameEn || college.deanNameAr || '');

    return (
        <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section with Image */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: college.image
                            ? `url(${college.image})`
                            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                    <div className="mb-6 space-y-4">

                        <Breadcrumb
                            items={[
                                { label: { ar: 'الكليات', en: 'Colleges' }, href: '/colleges' },
                                { label: { ar: college.nameAr, en: college.nameEn } }
                            ]}
                        />
                    </div>

                    <div className="animate-fade-in-up">
                        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
                            {t('كلية معتمدة', 'Accredited College')}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 text-foreground">
                            {t(college.nameAr, college.nameEn)}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
                            {t(college.descriptionAr, college.descriptionEn)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12 -mt-20 relative z-20">
                    {[
                        { icon: BookOpen, label: t('البرامج', 'Programs'), value: college.programs.length },
                        { icon: Award, label: t('الأقسام', 'Departments'), value: new Set(college.programs.map(p => p.departmentAr).filter(Boolean)).size || college.programs.length },
                        { icon: Users, label: t('أعضاء الهيئة', 'Faculty'), value: facultyMembers.length },
                        { icon: Calendar, label: t('متوسط القبول', 'Avg. Admission'), value: averageAdmissionRate ? `${averageAdmissionRate}%` : '-' },
                    ].map((stat, index) => (
                        <Card key={index} className="college-stat-card border-0 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <CardContent className="p-6 text-center">
                                <stat.icon className="college-stat-icon w-8 h-8 mx-auto mb-3" />
                                <div className="college-stat-value text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="college-stat-label text-sm">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Vision & Mission & Goals & Quality & Values & Strategy */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border-l-4 border-l-primary">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Eye className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">{t('الرؤية', 'Vision')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {t(college.visionAr, college.visionEn)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border-l-4 border-l-secondary" style={{ animationDelay: '0.1s' }}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                                    <Target className="w-6 h-6 text-secondary" />
                                </div>
                                <CardTitle className="text-2xl">{t('الرسالة', 'Mission')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {t(college.missionAr, college.missionEn)}
                            </p>
                        </CardContent>
                    </Card>

                    {college.goalsAr && (
                        <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border-l-4 border-l-amber-500" style={{ animationDelay: '0.2s' }}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                        <Flag className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-2xl">{t('الأهداف', 'Goals')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {t(college.goalsAr, college.goalsEn)}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {college.qualityAr && (
                        <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border-l-4 border-l-blue-500" style={{ animationDelay: '0.3s' }}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <Award className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-2xl">{t('الجودة', 'Quality')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {t(college.qualityAr, college.qualityEn)}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {college.valuesAr && (
                        <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border-l-4 border-l-purple-500" style={{ animationDelay: '0.4s' }}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <CardTitle className="text-2xl">{t('القيم', 'Values')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {t(college.valuesAr, college.valuesEn)}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {college.strategyAr && (
                        <Card className="group hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border-l-4 border-l-emerald-500" style={{ animationDelay: '0.5s' }}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                        <Target className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <CardTitle className="text-2xl">{t('الأهداف الاستراتيجية', 'Strategic Objectives')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {t(college.strategyAr, college.strategyEn)}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Programs */}
                <Card className="mb-12 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{t('البرامج الأكاديمية', 'Academic Programs')}</CardTitle>
                                <p className="text-muted-foreground mt-1">{t('برامج متنوعة تلبي احتياجات سوق العمل', 'Diverse programs meeting market needs')}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-start p-3 font-semibold">{t('م', '#')}</th>
                                        <th className="text-start p-3 font-semibold">{t('القسم العلمي', 'Department')}</th>
                                        <th className="text-start p-3 font-semibold">{t('البرنامج الأكاديمي', 'Program')}</th>
                                        <th className="text-start p-3 font-semibold">{t('نسبة القبول', 'Admission Rate')}</th>
                                        <th className="text-start p-3 font-semibold">{t('نوع الثانوية', 'High School Type')}</th>
                                        <th className="text-start p-3 font-semibold">{t('سنوات الدراسة', 'Study Years')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {college.programs.map((program, index) => (
                                        <tr
                                            key={program.id}
                                            className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-3 text-muted-foreground">{index + 1}</td>
                                            <td className="p-3">
                                                {t(program.departmentAr, program.departmentEn) || '-'}
                                            </td>
                                            <td className="p-3 font-medium">
                                                <Link
                                                    href={`/colleges/${college.id}/programs/${program.id}`}
                                                    className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                                >
                                                    {t(program.nameAr, program.nameEn)}
                                                    <ArrowIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="font-bold">
                                                    {program.admissionRate}%
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="secondary">
                                                    {t(program.highSchoolType, program.highSchoolTypeEn)}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center font-medium">
                                                {program.studyYears}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* College Management / Admission Requirements */}
                <Card className="mb-12 animate-fade-in-up border border-[rgba(245,200,60,0.18)] bg-gradient-to-br from-primary/5 to-secondary/5 shadow-[0_10px_22px_rgba(0,0,0,0.10)]" style={{ animationDelay: '0.4s' }}>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('إدارة الكلية وشروط القبول', 'College Management & Admission Requirements')}</CardTitle>
                    </CardHeader>
                    <CardContent className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {deanDisplayName ? (
                            <div className="flex items-center gap-4 rounded-2xl border bg-background/70 p-4">
                                <Avatar className="h-14 w-14 border-2 border-secondary shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {deanDisplayName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-secondary">{t('عميد الكلية', 'College Dean')}</p>
                                    <p className="text-base font-medium text-foreground">{deanDisplayName}</p>
                                </div>
                            </div>
                        ) : null}
                        <div className="rounded-2xl border bg-background/70 p-5">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                                    <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <p className="text-xl font-semibold">{t('شروط القبول', 'Admission Requirements')}</p>
                            </div>
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {t(college.admissionRequirementsAr, college.admissionRequirementsEn)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* College News Section */}
                {college.news && college.news.length > 0 && (
                    <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Newspaper className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">{t('أخبار الكلية', 'College News')}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {college.news.map((news) => (
                                <Link
                                    key={news.id}
                                    href={`/news/${news.slug}`}
                                    className="block h-full cursor-pointer"
                                >
                                    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm shadow-md h-full flex flex-col">
                                        <div className="relative h-48 overflow-hidden">
                                            <img src={news.image} alt={t(news.titleAr, news.titleEn)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-4 right-4 bg-secondary text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                {news.date}
                                            </div>
                                        </div>
                                        <CardContent className="p-5 flex-grow flex flex-col gap-2 text-right">
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-secondary transition-colors text-foreground">
                                                {t(news.titleAr, news.titleEn)}
                                            </h3>
                                            <p className="font-normal text-sm md:text-base text-muted-foreground leading-relaxed">
                                                {t(news.descAr, news.descEn)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* College Services Links */}
                <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-24 bg-card/50 backdrop-blur-md border border-primary/10 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/40 transition-all duration-300 text-lg font-bold gap-3 shadow-sm group rounded-2xl"
                            onClick={() => setShowComingSoon(true)}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                                <Library className="w-6 h-6 text-secondary" />
                            </div>
                            {t('مكتبة الكلية', 'College Library')}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-24 bg-card/50 backdrop-blur-md border border-primary/10 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/40 transition-all duration-300 text-lg font-bold gap-3 shadow-sm group rounded-2xl"
                            onClick={() => setShowComingSoon(true)}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                                <CalendarDays className="w-6 h-6 text-secondary" />
                            </div>
                            {t('الجدول الدراسي', 'Study Schedule')}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-24 bg-card/50 backdrop-blur-md border border-primary/10 hover:bg-secondary/10 hover:text-secondary hover:border-secondary/40 transition-all duration-300 text-lg font-bold gap-3 shadow-sm group rounded-2xl"
                            onClick={() => setShowComingSoon(true)}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                                <FileSpreadsheet className="w-6 h-6 text-secondary" />
                            </div>
                            {t('الجدول الامتحاني', 'Exam Schedule')}
                        </Button>
                    </div>
                </div>

                {/* Faculty Members */}
                {facultyMembers.length > 0 && (
                    <Card className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{t('الكادر التدريسي', 'Faculty Members')}</CardTitle>
                                    <p className="text-muted-foreground mt-1">{t('نخبة من الأساتذة المتميزين', 'A distinguished group of professors')}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {facultyMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                                                {member.image ? (
                                                    <img src={(member.image as any).src || member.image} alt={t(member.nameAr, member.nameEn)} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    t(member.nameAr, member.nameEn).charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">
                                                    <DisplayName nameAr={member.nameAr} nameEn={member.nameEn} />
                                                </h4>
                                                <p className="text-primary text-sm">{t(member.degreeAr, member.degreeEn)}</p>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            {t(member.specializationAr, member.specializationEn)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}



                {/* CTA Section */}
                <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-center animate-fade-in-up mt-20" style={{ animationDelay: '0.6s' }}>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-primary-foreground">
                        {t('انضم إلينا اليوم', 'Join Us Today')}
                    </h2>
                    <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        {t(
                            'ابدأ رحلتك الأكاديمية معنا واحصل على تعليم متميز يؤهلك للمستقبل',
                            'Start your academic journey with us and receive outstanding education that prepares you for the future'
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                            <Link href="/admission">
                                {t('التقديم الآن', 'Apply Now')}
                                <ArrowIcon className="w-5 h-5" />
                            </Link>
                        </Button>
                    </div>
                </div>

            </div>
            {/* Coming Soon Dialog */}
            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
                <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
                    <div className="p-8 text-center space-y-6">
                        {/* Animated Icon */}
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
                            <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
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

                        {/* Progress Bar */}
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
