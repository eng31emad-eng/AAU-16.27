'use client'
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, ArrowLeft, Palette, Layout, Box, Award } from 'lucide-react';
import { ProjectItem } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { DisplayName } from '@/lib/transliterateArabicName';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion';

interface ProjectsStudioPageContentProps {
    initialCurrentProjects: ProjectItem[];
    initialCompletedProjects: ProjectItem[];
    initialStudioProjects: ProjectItem[];
}

export default function ProjectsStudioPageContent({ initialCurrentProjects, initialCompletedProjects, initialStudioProjects }: ProjectsStudioPageContentProps) {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const router = useRouter();
    const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;
    const [currentProjects, setCurrentProjects] = useState<ProjectItem[]>(initialCurrentProjects);
    const [completedProjects, setCompletedProjects] = useState<ProjectItem[]>(initialCompletedProjects);
    const [studioProjects, setStudioProjects] = useState<ProjectItem[]>(initialStudioProjects);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const filterProjects = (projects: ProjectItem[]) =>
        projects.filter((p) =>
            t(p.titleAr, p.titleEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
            t(p.descAr, p.descEn).toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (isLoading) {
        return <LoadingState messageAr="جاري التحميل..." messageEn="Loading..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen py-16 bg-background">
                <div className="container mx-auto px-4">
                    <ErrorState onRetry={() => window.location.reload()} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16 bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4">
                <Breadcrumb items={[{ label: { ar: 'مشاريع التخرج', en: 'Graduation Projects' } }]} />



                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 py-3 leading-relaxed">
                        {t('مشاريع التخرج', 'Graduation Projects')}
                    </h1>
                    <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t(
                            'مشاريع الطلاب المبتكرة في مختلف المجالات',
                            'Innovative student projects in various fields'
                        )}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder={t('ابحث عن مشروع...', 'Search for a project...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Tabs defaultValue="current" className="max-w-6xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="current">
                            {t('المشاريع الحالية', 'Current Projects')}
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            {t('المشاريع المنتهية', 'Completed Projects')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-6">
                        {filterProjects(currentProjects).length === 0 ? (
                            <EmptyState messageAr="لم يتم العثور على مشاريع" messageEn="No projects found" />
                        ) : (
                            filterProjects(currentProjects).map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-2">
                                                    {t(project.titleAr, project.titleEn)}
                                                </CardTitle>
                                                <CardDescription className="text-base">
                                                    {t(project.descAr, project.descEn)}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary" className="ml-4">
                                                {project.progress}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-secondary h-2 rounded-full transition-all"
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="opacity-0">
                                                    {/* Work team removed as requested */}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/projects-studio/${project.slug}`)}
                                                >
                                                    {t('التفاصيل', 'Details')}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-6">
                        {filterProjects(completedProjects).length === 0 ? (
                            <EmptyState messageAr="لم يتم العثور على مشاريع" messageEn="No projects found" />
                        ) : (
                            filterProjects(completedProjects).map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-2">
                                                    {t(project.titleAr, project.titleEn)}
                                                </CardTitle>
                                                <CardDescription className="text-base">
                                                    {t(project.descAr, project.descEn)}
                                                </CardDescription>
                                            </div>
                                            <Badge className="ml-4">{project.year}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="opacity-0">
                                                {/* Work team removed as requested */}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/projects-studio/${project.slug}`)}
                                            >
                                                {t('عرض المشروع', 'View Project')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>

                {/* Studio Projects Gallery Section */}
                {studioProjects.length > 0 && (
                    <div className="mt-24 pb-20">
                        <div className="text-center mb-16 px-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-6 py-2 rounded-full text-sm font-bold mb-6 border border-secondary/20"
                            >
                                <Palette className="w-5 h-5" />
                                {t('ستوديو الإبداع', 'Creativity Studio')}
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent py-2 leading-relaxed">
                                {t('ستوديو المشاريع', 'Projects Studio')}
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                                {t(
                                    'مساحة لاستعراض الأعمال الإبداعية، التصاميم، والابتكارات الطلابية الملهمة',
                                    'A space to showcase creative works, designs, and inspiring student innovations'
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {studioProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative flex flex-col min-h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-xl border border-white/10 bg-card"
                                    onClick={() => router.push(`/projects-studio/${project.slug}`)}
                                >
                                    {/* Project Image Container */}
                                    <div className="h-[280px] overflow-hidden">
                                        <img
                                            src={project.images?.[0]}
                                            alt={t(project.titleAr, project.titleEn)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Project Info - Moved Below Image */}
                                    <div className="p-6 bg-card flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge className="bg-secondary text-primary hover:bg-secondary font-bold text-[10px] px-2 py-0">
                                                {t(project.categoryAr || '', project.categoryEn || '')}
                                            </Badge>
                                        </div>
                                        <h3 className="text-foreground font-bold text-lg mb-2 leading-tight group-hover:text-secondary transition-colors">
                                            {t(project.titleAr, project.titleEn)}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                                            <div className="text-xs text-muted-foreground">
                                                {/* Names removed as requested */}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-all duration-300">
                                                <ArrowLeft className="w-4 h-4 rtl:block hidden" />
                                                <ArrowRight className="w-4 h-4 ltr:block hidden" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Highlight Border */}
                                    <div className="absolute inset-0 border-2 border-secondary/0 group-hover:border-secondary/30 rounded-3xl transition-colors pointer-events-none" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
