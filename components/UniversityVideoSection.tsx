'use client'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

type VideoSectionContent = {
    titleAr?: string
    titleEn?: string
    descriptionAr?: string
    descriptionEn?: string
    overlayTitleAr?: string
    overlayTitleEn?: string
    overlayDescriptionAr?: string
    overlayDescriptionEn?: string
}

export function UniversityVideoSection({ content }: { content?: VideoSectionContent }) {
    const { t } = useLanguage()

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-4"
                    >
                        {t(content?.titleAr || 'لقطات من جامعتنا', content?.titleEn || 'Glimpses of Our University')}
                    </motion.h2>
                    <div className="w-24 h-1.5 bg-secondary mx-auto mb-6 rounded-full" />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 20 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-2xl mx-auto text-lg"
                    >
                        {t(
                            content?.descriptionAr || 'شاهد بيئة التعليم الحديثة والمرافق المتطورة التي نقدمها لطلابنا',
                            content?.descriptionEn || 'Experience our modern learning environment and advanced facilities.'
                        )}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto relative group cursor-pointer"
                >
                    {/* Video Placeholder Container */}
                    <div className="aspect-video rounded-3xl overflow-hidden border-4 border-secondary/20 shadow-2xl relative">
                        <img
                            src="/video-placeholder.png"
                            alt="University Video Placeholder"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-20 h-20 md:w-28 md:h-28 bg-secondary rounded-full flex items-center justify-center shadow-glow-lg text-primary relative z-20"
                            >
                                <Play className="w-8 h-8 md:w-12 md:h-12 fill-current" />

                                {/* Ripple Effect Animation */}
                                <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-30" />
                            </motion.div>
                        </div>

                        {/* Glassmorphism Title Tag */}
                        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 p-4 md:p-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl md:max-w-md hidden sm:block">
                            <h3 className="text-white font-bold text-xl mb-2">
                                {t(content?.overlayTitleAr || 'جولة في الحرم الجامعي', content?.overlayTitleEn || 'Campus Virtual Tour')}
                            </h3>
                            <p className="text-white/80 text-sm">
                                {t(
                                    content?.overlayDescriptionAr || 'استكشف القاعات الدراسية والمعامل المجهزة بأحدث التقنيات.',
                                    content?.overlayDescriptionEn || 'Explore classrooms and laboratories equipped with the latest technologies.'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Decorative Corner Elements */}
                    <div className="absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-secondary rounded-tl-3xl z-[-1]" />
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-4 border-r-4 border-secondary rounded-br-3xl z-[-1]" />
                </motion.div>
            </div>
        </section>
    )
}
