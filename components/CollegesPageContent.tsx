'use client'
import { useLanguage } from '@/contexts/LanguageContext';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Users, BookOpen, Award, GraduationCap } from 'lucide-react';
;
import { useState } from 'react';
import { College } from '@/types';
import { useRouter } from 'next/navigation'

interface CollegesPageContentProps {
    initialColleges: College[];
    academicProgramsCount: number;
}

export default function CollegesPageContent({ initialColleges, academicProgramsCount }: CollegesPageContentProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [colleges] = useState<College[]>(initialColleges);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div data-breadcrumb="local">
                        <Breadcrumb items={[{ label: { ar: 'كلياتنا', en: 'Our Colleges' } }]} />
                    </div>



                    <div className="text-center max-w-4xl mx-auto animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <GraduationCap className="w-4 h-4" />
                            {t('التميز الأكاديمي', 'Academic Excellence')}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent py-2 leading-relaxed">
                            {t('كلياتنا', 'Our Colleges')}
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            {t(
                                'نقدم مجموعة متنوعة من البرامج الأكاديمية المتميزة في مختلف التخصصات، مع التركيز على الجودة والتميز في التعليم والبحث العلمي',
                                'We offer a diverse range of distinguished academic programs in various specializations, with a focus on quality and excellence in education and scientific research'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: BookOpen, value: colleges.length, label: { ar: 'كلية', en: 'Colleges' } },
                        { icon: GraduationCap, value: academicProgramsCount, label: { ar: 'برنامج أكاديمي', en: 'Programs' } },
                        { icon: Users, value: '200+', label: { ar: 'عضو هيئة تدريس', en: 'Faculty' } },
                        { icon: Award, value: '10K+', label: { ar: 'طالب', en: 'Students' } },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="college-stat-card rounded-xl p-4 md:p-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <stat.icon className="college-stat-icon w-6 h-6" />
                            </div>
                            <div className="college-stat-value text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="college-stat-label text-sm">{t(stat.label.ar, stat.label.en)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colleges Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-8">
                    {colleges.map((college, index) => (
                        <div
                            key={college.id}
                            className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-scale-in border border-border/50"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Image Section */}
                            <div className="relative h-56 md:h-64 overflow-hidden">
                                <img
                                    src={college.image || '/placeholder.svg'}
                                    alt={t(college.nameAr, college.nameEn)}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                                {/* College Icon */}
                                <div className="absolute top-4 right-4 w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                    <GraduationCap className="w-7 h-7 text-white" />
                                </div>

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
                            <div className="p-6">
                                <p className="text-muted-foreground mb-6 line-clamp-3">
                                    {t(college.descriptionAr, college.descriptionEn)}
                                </p>


                                <Button
                                    variant="secondary"
                                    className="w-full group/btn"
                                    onClick={() => router.push(`/colleges/${college.id}`)}
                                >
                                    {t('استكشف الكلية', 'Explore College')}
                                    {language === 'ar' ? (
                                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover/btn:-translate-x-1" />
                                    ) : (
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                            {t('هل أنت مستعد للانضمام إلينا؟', 'Ready to Join Us?')}
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 mb-8">
                            {t(
                                'ابدأ رحلتك الأكاديمية معنا وكن جزءاً من مجتمع تعليمي متميز يفتح لك آفاقاً جديدة',
                                'Start your academic journey with us and be part of a distinguished educational community that opens new horizons for you'
                            )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="text-lg px-8"
                                onClick={() => router.push('/admission')}
                            >
                                {t('التقدم للقبول', 'Apply for Admission')}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10"
                                onClick={() => router.push('/contact')}
                            >
                                {t('تواصل معنا', 'Contact Us')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
