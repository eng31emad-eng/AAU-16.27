'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Flag, Heart, Quote, Sparkles, Target } from 'lucide-react'
import aboutImage from '@/assets/about-university.jpg'
import studentsStudying from '@/assets/students-studying.jpg'
import type { AboutPageData } from '@/services/server/about'

const identityIcons = {
  vision: Eye,
  mission: Target,
  goals: Flag,
  values: Heart,
} as const

export default function About({ about }: { about: AboutPageData }) {
  const { t } = useLanguage()

  const identity = about.identity || []
  const teamGroups = about.team?.groups || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div data-breadcrumb="local">
          <Breadcrumb items={[{ label: { ar: 'عن الجامعة', en: 'About' } }]} />
        </div>

        <div className="mb-16 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t(about.pageHeader?.badgeAr || 'تعرف علينا', about.pageHeader?.badgeEn || 'About Us')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            {t(about.pageHeader?.titleAr || 'عن جامعة الجيل الجديد', about.pageHeader?.titleEn || 'About AJ JEEL ALJADEED UNIVERSITY')}
          </h1>
          <div className="w-32 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t(about.pageHeader?.descriptionAr || '', about.pageHeader?.descriptionEn || '')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16 animate-fade-in-up">
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {t(about.intro?.bodyAr || '', about.intro?.bodyEn || '')}
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            <img
              src={about.intro?.image || (aboutImage as any).src || aboutImage}
              alt={t(about.pageHeader?.titleAr || 'عن الجامعة', about.pageHeader?.titleEn || 'About')}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {identity.map((item, index) => {
            const Icon = identityIcons[(item.key as keyof typeof identityIcons) || 'vision'] || Eye
            const gradients = ['from-blue-500 to-cyan-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-green-500', 'from-rose-500 to-pink-500']
            return (
              <Card
                key={item.key || index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[index % gradients.length]}`} />
                <CardContent className="pt-8 pb-8 px-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center mb-6 shadow-lg mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-center mb-4">
                    {t(item.titleAr || '', item.titleEn || '')}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed text-sm md:text-base whitespace-pre-line">
                    {t(item.descriptionAr || '', item.descriptionEn || '')}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mb-24 animate-fade-in-up">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-2xl rounded-3xl">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-5 gap-0 items-stretch">
                <div className="lg:col-span-2 relative overflow-hidden group bg-primary/20">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
                  <div className="relative h-auto lg:h-full lg:min-h-[600px]">
                    <img
                      src={about.presidentMessage?.image || (studentsStudying as any).src || studentsStudying}
                      alt={t(about.presidentMessage?.nameAr || '', about.presidentMessage?.nameEn || '')}
                      className="w-full h-auto object-contain transition-transform duration-700 lg:group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-20">
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white mb-1 md:mb-2">
                        {t(about.presidentMessage?.nameAr || '', about.presidentMessage?.nameEn || '')}
                      </h3>
                      <p className="text-secondary font-bold text-base md:text-lg">
                        {t(about.presidentMessage?.roleAr || '', about.presidentMessage?.roleEn || '')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 p-6 md:p-10 lg:p-16 flex flex-col justify-center relative bg-background/40 backdrop-blur-md">
                  <Quote className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 md:w-20 md:h-20 text-primary/5 rotate-180" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                      <div className="w-8 md:w-12 h-1 md:h-1.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                        {t(about.presidentMessage?.sectionTitleAr || 'كلمة رئيس الجامعة', about.presidentMessage?.sectionTitleEn || "President's Message")}
                      </h2>
                    </div>

                    <div className="space-y-4 md:space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg text-justify font-medium">
                      <p className="italic text-foreground/80 text-lg md:text-xl border-r-4 border-primary/30 pr-4">
                        "{t(about.presidentMessage?.introAr || '', about.presidentMessage?.introEn || '')}"
                      </p>
                      <p>{t(about.presidentMessage?.bodyAr || '', about.presidentMessage?.bodyEn || '')}</p>
                      <p>{t(about.presidentMessage?.closingAr || '', about.presidentMessage?.closingEn || '')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-20 mb-16 animate-fade-in-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {t(about.team?.titleAr || 'الفريق الإداري', about.team?.titleEn || 'Administrative Team')}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(about.team?.descriptionAr || '', about.team?.descriptionEn || '')}
            </p>
          </div>

          <div className="space-y-16 max-w-6xl mx-auto">
            {teamGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="text-center mb-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {t(group.titleAr || '', group.titleEn || '')}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                  {(group.members || []).map((member, memberIndex) => (
                    <div key={`${groupIndex}-${memberIndex}`} className="flex flex-col items-center group">
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-primary/10 group-hover:border-secondary/50 transition-all duration-300 mb-3 bg-muted/20">
                        <img
                          src={member.image || (studentsStudying as any).src || studentsStudying}
                          alt={t(member.nameAr || '', member.nameEn || '')}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-center leading-tight">{t(member.nameAr || '', member.nameEn || '')}</h4>
                      <p className="text-[10px] text-muted-foreground text-center mt-1">{t(member.roleAr || '', member.roleEn || '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
