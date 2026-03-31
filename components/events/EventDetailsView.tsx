'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { EventItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ExternalLink, ArrowRight, ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface EventDetailsViewProps {
    event: EventItem;
    relatedEvents: EventItem[];
}

export default function EventDetailsView({ event, relatedEvents }: EventDetailsViewProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isRTL = language === 'ar';
    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy', { locale: language === 'ar' ? ar : undefined });
    };

    const getStatusBadge = (status: string) => {
        const config = {
            upcoming: {
                variant: 'default' as const,
                label: { ar: 'قادم', en: 'Upcoming' },
                className: 'bg-secondary text-secondary-foreground'
            },
            ongoing: {
                variant: 'secondary' as const,
                label: { ar: 'جاري', en: 'Ongoing' },
                className: 'bg-green-500 text-white'
            },
            completed: {
                variant: 'outline' as const,
                label: { ar: 'منتهي', en: 'Completed' },
                className: 'bg-muted text-muted-foreground'
            },
        };

        const statusConfig = config[status as keyof typeof config] || config.upcoming;

        return (
            <Badge className={statusConfig.className}>
                {t(statusConfig.label.ar, statusConfig.label.en)}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-secondary/10 via-background to-primary/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container mx-auto px-4 py-8">
                    <Breadcrumb
                        items={[
                            { label: { ar: 'الفعاليات', en: 'Events' }, href: '/events' },
                            { label: { ar: event.titleAr, en: event.titleEn } }
                        ]}
                    />



                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl"
                    >
                        {/* Status Badge */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {getStatusBadge(event.status)}
                            {event.category && (
                                <Badge variant="outline" className="border-secondary/50">
                                    {event.category}
                                </Badge>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight">
                            {t(event.titleAr, event.titleEn)}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-secondary" />
                                <span>{formatDate(event.date)}</span>
                                {event.endDate && (
                                    <span className="text-muted-foreground/70">
                                        - {formatDate(event.endDate)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-secondary" />
                                <span>{t(event.locationAr, event.locationEn)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-secondary" />
                                <span>{t(event.organizerAr, event.organizerEn)}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Event Content */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        {/* Featured Image */}
                        {event.image ? (
                            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg h-[300px] md:h-[400px]">
                                <Image
                                    src={event.image}
                                    alt={t(event.titleAr, event.titleEn)}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-secondary/90 backdrop-blur-md text-secondary-foreground px-4 py-2 rounded-full font-medium">
                                    <CalendarDays className="w-5 h-5" />
                                    {formatDate(event.date)}
                                </div>
                            </div>
                        ) : null}

                        {/* Event Details Card */}
                        <Card className="mb-8 border-secondary/20">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-secondary rounded-full"></div>
                                    {t('تفاصيل الفعالية', 'Event Details')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('التاريخ', 'Date')}</p>
                                            <p className="font-semibold">{formatDate(event.date)}</p>
                                            {event.endDate && (
                                                <p className="text-sm text-muted-foreground">
                                                    {t('إلى', 'to')} {formatDate(event.endDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('المكان', 'Location')}</p>
                                            <p className="font-semibold">{t(event.locationAr, event.locationEn)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('المنظم', 'Organizer')}</p>
                                            <p className="font-semibold">{t(event.organizerAr, event.organizerEn)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-secondary rounded-full"></div>
                                {t('نبذة عن الفعالية', 'About the Event')}
                            </h2>
                            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
                                {t(
                                    event.contentAr || event.descriptionAr,
                                    event.contentEn || event.descriptionEn
                                )}
                            </p>
                        </div>

                        {/* Registration Section */}
                        {event.registrationRequired && event.registrationLink && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                                className="bg-gradient-to-r from-secondary/20 via-secondary/10 to-primary/20 p-8 rounded-2xl text-center mb-8"
                            >
                                <h3 className="text-2xl font-bold mb-3">
                                    {t('سجل الآن للمشاركة', 'Register Now to Participate')}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {t('لا تفوت فرصة المشاركة في هذه الفعالية المميزة', "Don't miss the chance to participate in this special event")}
                                </p>
                                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
                                    <Link href={event.registrationLink} className="gap-2">
                                        {t('سجل الآن', 'Register Now')}
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        )}

                        {!event.registrationRequired && event.status === 'upcoming' && (
                            <div className="bg-muted/50 p-6 rounded-2xl text-center mb-8 border border-border/50">
                                <Clock className="w-8 h-8 text-secondary mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    {t(
                                        'هذه الفعالية مفتوحة للجميع ولا تحتاج إلى تسجيل مسبق',
                                        'This event is open to everyone and does not require prior registration'
                                    )}
                                </p>
                            </div>
                        )}


                    </motion.article>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        {/* Related Events */}
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-secondary rounded-full"></div>
                                    {t('فعاليات ذات صلة', 'Related Events')}
                                </h3>
                                <div className="space-y-4">
                                    {relatedEvents.map((item, index) => (
                                        <Link
                                            key={item.id}
                                            href={`/events/${item.slug}`}
                                            className="group block"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300"
                                            >
                                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    <Image
                                                        src={item.image || '/placeholder.svg'}
                                                        alt={t(item.titleAr, item.titleEn)}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-secondary transition-colors">
                                                        {t(item.titleAr, item.titleEn)}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(item.date)}
                                                    </div>
                                                    <div className="mt-1">
                                                        {getStatusBadge(item.status)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>

                                {/* View All Button */}
                                <Button
                                    variant="outline"
                                    className="w-full mt-6 rounded-full border-secondary/50 hover:bg-secondary hover:text-secondary-foreground"
                                    onClick={() => router.push('/events')}
                                >
                                    {t('عرض جميع الفعاليات', 'View All Events')}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.aside>
                </div>
            </div>
        </div>
    );
}
