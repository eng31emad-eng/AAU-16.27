'use client'
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Globe, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormValues } from '@/lib/schemas';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ContactPageFormData, ContactPageSiteProfile, ContactPageSocialData } from '@/services/server/contact';

const socialIconMap: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
}

export const ContactSection = ({
  formContent,
  socialContent,
  siteProfile,
}: {
  formContent?: ContactPageFormData
  socialContent?: ContactPageSocialData
  siteProfile?: ContactPageSiteProfile
}) => {
  const { t, language } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Helper to get error message based on language
  const getErrorMessage = (error: any) => {
    if (!error) return null;
    return language === 'ar' ? error.message?.ar : error.message?.en;
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Contact submit failed');
      }

      const payload = await response.json().catch(() => ({}));
      if (payload?.exc || payload?.error) {
        throw new Error('Contact submit failed');
      }

      toast.success(
        t(
          'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.',
          'Your message has been sent successfully! We will contact you soon.'
        )
      );
      form.reset();
    } catch {
      toast.error(
        t(
          'تعذر إرسال الرسالة حالياً، يرجى المحاولة لاحقاً.',
          'Unable to send your message right now. Please try again later.'
        )
      );
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: { ar: 'الهاتف', en: 'Phone' },
      content: siteProfile?.contactPhone || '+967 XXX XXX XXX',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Mail,
      title: { ar: 'البريد الإلكتروني', en: 'Email' },
      content: siteProfile?.contactEmail || 'info@edu.yemenfrappe.com',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MapPin,
      title: { ar: 'العنوان', en: 'Address' },
      content: { ar: siteProfile?.addressAr || 'صنعاء، اليمن', en: siteProfile?.addressEn || 'Sanaa, Yemen' },
      gradient: 'from-rose-500 to-pink-500'
    }
  ];

  const socialMedia = (siteProfile?.socialLinks?.length ? siteProfile.socialLinks : [
    { labelAr: 'Facebook', labelEn: 'Facebook', url: 'https://facebook.com' },
    { labelAr: 'Instagram', labelEn: 'Instagram', url: 'https://instagram.com' },
    { labelAr: 'LinkedIn', labelEn: 'LinkedIn', url: 'https://linkedin.com' },
  ]).map((social) => {
    const url = social.url || ''
    const label = `${social.labelEn || social.labelAr || ''}`.toLowerCase()
    const matchedKey = Object.keys(socialIconMap).find((key) => label.includes(key) || url.toLowerCase().includes(key))
    const icon = socialIconMap[matchedKey || ''] || Globe
    const color =
      matchedKey === 'facebook' ? 'hover:bg-blue-600 hover:border-blue-600' :
      matchedKey === 'twitter' || matchedKey === 'x' ? 'hover:bg-sky-500 hover:border-sky-500' :
      matchedKey === 'instagram' ? 'hover:bg-pink-600 hover:border-pink-600' :
      matchedKey === 'linkedin' ? 'hover:bg-blue-700 hover:border-blue-700' :
      matchedKey === 'youtube' ? 'hover:bg-red-600 hover:border-red-600' :
      'hover:bg-primary hover:border-primary'

    return { icon, link: url, color, openInNewTab: social.openInNewTab }
  }).filter((social) => social.link);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };



  return (
    <section id="contact" className="py-16 md:py-20 bg-card relative overflow-hidden" ref={sectionRef}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information */}
          <motion.div
            className="space-y-6 sm:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Contact Cards */}
            <div className="grid gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="group flex items-center gap-4 bg-background rounded-2xl p-4 sm:p-5 border border-border/50"
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t(info.title.ar, info.title.en)}
                    </h4>
                    <p className="text-muted-foreground">
                      {typeof info.content === 'string'
                        ? info.content
                        : t(info.content.ar, info.content.en)
                      }
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Media */}
            <motion.div
              className="bg-background rounded-2xl p-5 sm:p-6 border border-border/50"
              variants={itemVariants}
            >
              <h4 className="font-semibold mb-4 text-foreground">
                {t(socialContent?.titleAr || 'تابعنا على', socialContent?.titleEn || 'Follow Us')}
              </h4>
              <div className="flex gap-3">
                {socialMedia.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.link}
                    target={social.openInNewTab === false ? undefined : '_blank'}
                    rel={social.openInNewTab === false ? undefined : 'noopener noreferrer'}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 border-border bg-card flex items-center justify-center transition-all duration-300 hover:text-white ${social.color}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            <motion.a
              href={siteProfile?.mapLocation || 'https://www.google.com/maps/search/جامعة+الجيل+الجديد+صنعاء/@15.3694,44.191,15z'}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-56 sm:h-64 bg-background rounded-2xl overflow-hidden border border-border/50 shadow-lg cursor-pointer"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61543.29308332659!2d44.15828!3d15.3694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDIyJzA5LjgiTiA0NMKwMTEnMjcuNiJF!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: 'none' }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </motion.a>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-2xl border-border/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                  <Send className="w-6 h-6" />
                  {t(formContent?.titleAr || 'أرسل رسالة', formContent?.titleEn || 'Send a Message')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.4 }}
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">{t('الاسم', 'Name')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('أدخل اسمك', 'Enter your name')}
                                className="mt-1.5 sm:mt-2"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage>
                              {form.formState.errors.name && getErrorMessage(form.formState.errors.name)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">{t('البريد الإلكتروني', 'Email')}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                                className="mt-1.5 sm:mt-2"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage>
                              {form.formState.errors.email && getErrorMessage(form.formState.errors.email)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.6 }}
                    >
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">{t('الموضوع', 'Subject')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('أدخل موضوع الرسالة', 'Enter message subject')}
                                className="mt-1.5 sm:mt-2"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage>
                              {form.formState.errors.subject && getErrorMessage(form.formState.errors.subject)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.7 }}
                    >
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">{t('الرسالة', 'Message')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('اكتب رسالتك هنا', 'Write your message here')}
                                rows={5}
                                className="mt-1.5 sm:mt-2 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage>
                              {form.formState.errors.message && getErrorMessage(form.formState.errors.message)}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full group"
                        size="lg"
                        disabled={form.formState.isSubmitting}
                      >
                        <Send className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                        {t('إرسال الرسالة', 'Send Message')}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
