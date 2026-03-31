'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Calendar, FileText, Search, X } from 'lucide-react'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { ResearchArticle } from '@/types'

interface JournalClientProps {
  initialArticles: ResearchArticle[]
}

export default function JournalClient({ initialArticles }: JournalClientProps) {
  const { language, t } = useLanguage()
  const [query, setQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<ResearchArticle | null>(null)

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return initialArticles

    return initialArticles.filter((article) =>
      article.titleAr.includes(query) ||
      article.titleEn.toLowerCase().includes(search) ||
      article.summaryAr.includes(query) ||
      article.summaryEn.toLowerCase().includes(search) ||
      article.authorAr.includes(query) ||
      article.authorEn.toLowerCase().includes(search)
    )
  }, [initialArticles, query])

  return (
    <div className="min-h-screen bg-gray-50/40 py-16">
      <div className="container mx-auto px-4">
        <Breadcrumb items={[{ label: { ar: 'المجلة العلمية', en: 'Scientific Journal' } }]} />

        <section className="mb-10 rounded-[2rem] bg-primary px-8 py-14 text-white shadow-xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
              {t('أرشيف الأبحاث العلمية', 'Research Journal Archive')}
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {t('المجلة العلمية لجامعة الجيل الجديد', 'AAU Scientific Journal')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              {t(
                'عرض حي للأبحاث والمنشورات التي تمت إضافتها من الباكند، مع إمكانية التصفح والبحث داخل المحتوى العلمي المنشور.',
                'A live view of research publications added from the backend, with browsing and search across published academic content.',
              )}
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="relative mx-auto max-w-3xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-14 rounded-2xl bg-white pl-12 text-lg shadow-sm"
              placeholder={t('ابحث في الأبحاث العلمية...', 'Search research publications...')}
            />
          </div>
        </section>

        {filteredArticles.length === 0 ? (
          <div className="rounded-3xl border bg-white py-16 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">{t('لا توجد نتائج', 'No Results')}</h2>
            <p className="text-muted-foreground">
              {initialArticles.length === 0
                ? t('لا توجد أبحاث منشورة بعد في الباكند.', 'No research publications have been published yet.')
                : t('جرّب تغيير كلمات البحث للوصول إلى نتائج أخرى.', 'Try adjusting your search terms to find more results.')}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredArticles.map((article) => (
              <motion.div key={article.id} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Card className="h-full overflow-hidden rounded-3xl border-0 bg-white shadow-lg shadow-slate-200/60 transition-transform hover:-translate-y-1">
                  {article.image ? (
                    <div className="h-56 overflow-hidden">
                      <img src={article.image as string} alt={language === 'ar' ? article.titleAr : article.titleEn} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 font-bold text-secondary">
                        {language === 'ar' ? article.categoryAr : article.categoryEn}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {language === 'ar' ? article.publishDateAr : article.publishDateEn}
                      </span>
                    </div>
                    <div>
                      <h2 className="mb-3 text-2xl font-bold leading-tight text-primary">
                        {language === 'ar' ? article.titleAr : article.titleEn}
                      </h2>
                      <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
                        {language === 'ar' ? article.summaryAr : article.summaryEn}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="font-semibold">{language === 'ar' ? article.authorAr : article.authorEn}</p>
                        {article.tags.length > 0 ? (
                          <p className="text-xs text-muted-foreground">{article.tags.join(' • ')}</p>
                        ) : null}
                      </div>
                      <Button onClick={() => setSelectedArticle(article)}>
                        <FileText className="mr-2 h-4 w-4" />
                        {t('عرض البحث', 'View Research')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl">
            {selectedArticle ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-right text-2xl font-bold text-primary">
                    {language === 'ar' ? selectedArticle.titleAr : selectedArticle.titleEn}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-slate-50 p-4 text-sm">
                    <div>
                      <p className="font-semibold">{language === 'ar' ? selectedArticle.authorAr : selectedArticle.authorEn}</p>
                      <p className="text-muted-foreground">{language === 'ar' ? selectedArticle.categoryAr : selectedArticle.categoryEn}</p>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {language === 'ar' ? selectedArticle.publishDateAr : selectedArticle.publishDateEn}
                      </span>
                    </div>
                  </div>
                  {selectedArticle.image ? (
                    <img
                      src={selectedArticle.image as string}
                      alt={language === 'ar' ? selectedArticle.titleAr : selectedArticle.titleEn}
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <div>
                    <h3 className="mb-3 text-lg font-bold">{t('الملخص', 'Summary')}</h3>
                    <p className="leading-8 text-muted-foreground">
                      {language === 'ar' ? selectedArticle.summaryAr : selectedArticle.summaryEn}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-bold">{t('النص الكامل', 'Full Text')}</h3>
                    <div className="space-y-4 leading-8 text-muted-foreground">
                      {(language === 'ar' ? selectedArticle.contentAr : selectedArticle.contentEn)
                        .split('\n')
                        .filter(Boolean)
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                      <X className="mr-2 h-4 w-4" />
                      {t('إغلاق', 'Close')}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  )
}
