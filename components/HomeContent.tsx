'use client'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Direct imports for above-the-fold content
import { HeroSection } from '@/components/HeroSection'
import { StatsSection } from '@/components/StatsSection'

// Dynamic imports for below-the-fold content
const CollegesSection = dynamic(() => import('@/components/CollegesSection').then(m => ({ default: m.CollegesSection })))
const NewsSection = dynamic(() => import('@/components/NewsSection').then(m => ({ default: m.NewsSection })))
const EventsSection = dynamic(() => import('@/components/EventsSection').then(m => ({ default: m.EventsSection })))
const CampusLifeSection = dynamic(() => import('@/components/CampusLifeSection').then(m => ({ default: m.CampusLifeSection })))
const ProjectsSection = dynamic(() => import('@/components/ProjectsSection').then(m => ({ default: m.ProjectsSection })))

// ContactSection handles its own client-mounting now, but we import it dynamically to keep bundle size low
const ContactSection = dynamic(() => import('@/components/ContactSection').then(m => ({ default: m.ContactSection })), { ssr: false })
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop').then(m => ({ default: m.ScrollToTop })))
// SmartChat needs ssr: false because it likely uses window/document
const SmartChat = dynamic(() => import('@/components/SmartChat'), { ssr: false })
import { UniversityVideoSection } from '@/components/UniversityVideoSection'

export default function HomeContent({ home, events, news, colleges, campusLife, projects, faqs }: any) {
    const { t } = useLanguage()

    return (
        <div className="scroll-smooth overflow-x-hidden">
            <main>
                <HeroSection hero={home?.hero} />

                <StatsSection stats={home?.stats} />

                <CampusLifeSection initialData={campusLife} sectionContent={home?.sections?.campusLife} />

                <ProjectsSection initialData={projects} sectionContent={home?.sections?.projects} />

                <CollegesSection initialData={colleges} sectionContent={home?.sections?.colleges} />

                <NewsSection initialNews={news} sectionContent={home?.sections?.news} />

                <EventsSection initialEvents={events} sectionContent={home?.sections?.events} />


                <UniversityVideoSection content={home?.sections?.video} />

                {/* FAQ Section */}
                <section id="faq" className="py-16 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">
                                {t(home?.sections?.faq?.titleAr || 'الأسئلة المتكررة', home?.sections?.faq?.titleEn || 'Frequently Asked Questions')}
                            </h2>
                            <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                {t(home?.sections?.faq?.descriptionAr || 'إجابات للأسئلة الشائعة', home?.sections?.faq?.descriptionEn || 'Answers to common questions')}
                            </p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {faqs.map((faq: any) => (
                                    <AccordionItem
                                        key={faq.id}
                                        value={faq.id}
                                        className="border rounded-lg px-6 bg-card"
                                    >
                                        <AccordionTrigger className="text-lg font-semibold hover:no-underline" aria-label={t(faq.questionAr, faq.questionEn)}>
                                            {t(faq.questionAr, faq.questionEn)}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-base text-muted-foreground pt-4">
                                            {t(faq.answerAr, faq.answerEn)}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>

                <ContactSection sectionContent={home?.sections?.contact} siteProfile={home?.siteProfile} />
                <SmartChat />
            </main>
            <ScrollToTop />
        </div>
    )
}
