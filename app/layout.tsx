import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const tajawal = Tajawal({
    weight: ['200', '300', '400', '500', '700', '800', '900'],
    subsets: ['arabic'],
    variable: '--font-tajawal',
    display: 'swap',
})

export async function generateMetadata({ params }): Promise<Metadata> {
    return {
        metadataBase: new URL('https://ngu.edu.iq'),
        title: {
            template: '%s | جامعة الجيل الجديد',
            default: 'جامعة الجيل الجديد - الصفحة الرئيسية',
        },
        description: 'مؤسسة تعليمية رائدة تهدف إلى إعداد خريجين متخصصين ومؤهلين علميًا وتقنيًا لخدمة المجتمع',
        keywords: ['جامعة', 'التعليم العالي', 'اليمن', 'صنعاء', 'جامعة الجيل الجديد', 'AJ JEEL ALJADEED UNIVERSITY', 'Yemen', 'Sanaa'],
        authors: [{ name: 'AJ JEEL ALJADEED UNIVERSITY' }],
        creator: 'AJ JEEL ALJADEED UNIVERSITY',
        publisher: 'AJ JEEL ALJADEED UNIVERSITY',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        openGraph: {
            title: 'جامعة الجيل الجديد',
            description: 'مؤسسة تعليمية رائدة تهدف إلى إعداد خريجين متخصصين ومؤهلين علميًا وتقنيًا',
            url: 'https://ngu.edu.iq',
            siteName: 'جامعة الجيل الجديد',
            images: [
                {
                    url: '/og-image.png', // You should ensure this image exists in public folder
                    width: 1200,
                    height: 630,
                    alt: 'جامعة الجيل الجديد',
                },
            ],
            locale: 'ar_IQ',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'جامعة الجيل الجديد',
            description: 'مؤسسة تعليمية رائدة في اليمن',
            images: ['/og-image.png'],
        },
        alternates: {
            canonical: 'https://ngu.edu.iq',
            languages: {
                'ar': 'https://ngu.edu.iq',
                'en': 'https://ngu.edu.iq/en',
            },
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ar" dir="rtl" className={`${tajawal.variable}`} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="antialiased">
                <Script
                    id="organization-jsonld"
                    type="application/ld+json"
                    strategy="afterInteractive"
                >
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        "name": "Al-Jeel Al-Jadeed University",
                        "alternateName": "جامعة الجيل الجديد",
                        "url": "https://ngu.edu.iq",
                        "logo": "https://ngu.edu.iq/og-image.png",
                        "sameAs": [
                            "https://facebook.com/ngu.edu.iq",
                            "https://twitter.com/ngu_edu_iq",
                            "https://instagram.com/ngu.edu.iq",
                            "https://linkedin.com/school/ngu-edu-iq"
                        ],
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Sanaa",
                            "addressCountry": "YE"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "email": "info@ngu.edu.iq",
                            "contactType": "customer service"
                        }
                    })}
                </Script>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
