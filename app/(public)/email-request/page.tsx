'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail, User, BookOpen, Hash, Phone, CheckCircle,
    ArrowRight, Sparkles, GraduationCap, Laptop,
    Palette, Globe, ShieldCheck, QrCode, Download,
    AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function EmailRequestPage() {
    const { t, language } = useLanguage();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        nameAr: '',
        nameEn: '',
        academicId: '',
        college: '',
        level: '',
        phone: '',
    });

    const benefits = [
        {
            icon: Laptop,
            titleAr: 'حزمة Office 365',
            titleEn: 'Office 365 Suite',
            descAr: 'دخول مجاني لبرامج Word, Excel و PowerPoint.',
            descEn: 'Free access to Word, Excel, and PowerPoint.'
        },
        {
            icon: Palette,
            titleAr: 'Canva Pro التعليمي',
            titleEn: 'Canva Pro Education',
            descAr: 'تصميم جرافيك احترافي بكافة المميزات مجاناً.',
            descEn: 'Full pro graphic design features for free.'
        },
        {
            icon: Globe,
            titleAr: 'خصومات عالمية',
            titleEn: 'Global Discounts',
            descAr: 'خصومات على تذاكر الطيران والبرمجيات كطالب.',
            descEn: 'Discounts on flights and software as a student.'
        },
        {
            icon: ShieldCheck,
            titleAr: 'أمان وخصوصية',
            titleEn: 'Security & Privacy',
            descAr: 'هوية رقمية آمنة لكافة منصات الجامعة.',
            descEn: 'Secure digital identity for all university platforms.'
        },
    ];

    // --- Strict Validation Logic ---

    const validateField = (name: string, value: string) => {
        let error = '';

        switch (name) {
            case 'nameAr':
                if (value && !/^[\u0600-\u06FF\s]+$/.test(value)) {
                    error = t('يرجى استخدام الحروف العربية فقط', 'Please use Arabic characters only');
                } else if (value && value.split(/\s+/).filter(Boolean).length < 3) {
                    error = t('يرجى كتابة الاسم الثلاثي على الأقل', 'Please enter at least three names');
                }
                break;
            case 'nameEn':
                if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                    error = t('يرجى استخدام الحروف الإنجليزية فقط', 'Please use English characters only');
                } else if (value && value.split(/\s+/).filter(Boolean).length < 3) {
                    error = t('يرجى كتابة الاسم الثلاثي بالإنجليزي', 'Please enter at least three names in English');
                }
                break;
            case 'academicId':
                if (value && !/^\d+$/.test(value)) {
                    error = t('الرقم الأكاديمي يجب أن يحتوي على أرقام فقط', 'Academic ID must contain numbers only');
                } else if (value && (value.length < 8 || value.length > 12)) {
                    error = t('الرقم الأكاديمي يجب أن يكون بين 8-12 رقماً', 'Academic ID must be between 8-12 digits');
                }
                break;
            case 'phone':
                if (value && !/^\d+$/.test(value)) {
                    error = t('رقم الهاتف يجب أن يحتوي على أرقام فقط', 'Phone number must contain numbers only');
                } else if (value && !/^7\d{8}$/.test(value)) {
                    error = t('رقم الهاتف اليمني يجب أن يبدأ بـ 7 ويتكون من 9 أرقام', 'Yemeni phone number must start with 7 and be 9 digits long');
                }
                break;
            case 'college':
            case 'level':
                if (value && /[<>{}[\]\\/]/.test(value)) {
                    error = t('يرجى عدم استخدام رموز خاصة', 'Please do not use special characters');
                }
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (name: string, value: string) => {
        // Basic filtering during typing
        let cleanValue = value;

        if (name === 'nameAr') cleanValue = value.replace(/[^\u0600-\u06FF\s]/g, '').replace(/\s\s+/g, ' ');
        if (name === 'nameEn') cleanValue = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s\s+/g, ' ');
        if (name === 'academicId' || name === 'phone') cleanValue = value.replace(/\D/g, '');
        if (name === 'college' || name === 'level') cleanValue = value.replace(/[^\u0600-\u06FFa-zA-Z0-9\s\-\u0660-\u0669]/g, '').replace(/\s\s+/g, ' ');

        setFormData(prev => ({ ...prev, [name]: cleanValue }));
        validateField(name, cleanValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Final Validation Check
        const isNameArValid = validateField('nameAr', formData.nameAr);
        const isNameEnValid = validateField('nameEn', formData.nameEn);
        const isIdValid = validateField('academicId', formData.academicId);
        const isPhoneValid = validateField('phone', formData.phone);
        const isCollegeValid = validateField('college', formData.college);
        const isLevelValid = validateField('level', formData.level);

        if (isNameArValid && isNameEnValid && isIdValid && isPhoneValid && isCollegeValid && isLevelValid) {
            setIsSubmitted(true);
            toast.success(t('تم إرسال طلبك بنجاح!', 'Your request has been submitted successfully!'));
        } else {
            toast.error(t('يرجى تصحيح الأخطاء في النموذج قبل الإرسال', 'Please correct the errors in the form before submitting'));
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 overflow-hidden relative selection:bg-secondary selection:text-primary">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-xl w-full relative z-10"
                >
                    <Card className="border-none shadow-2xl bg-white text-center p-8 border border-gray-100 ring-1 ring-black/5 rounded-[3rem]">
                        <div className="w-24 h-24 bg-gradient-to-tr from-secondary/80 to-secondary rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-secondary/20 mb-6 rotate-3 border-4 border-white">
                            <CheckCircle className="w-12 h-12 text-primary" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-display font-black text-gray-900 tracking-tight uppercase">
                                {t('تم الإرسال بنجاح!', 'SUBMITTED SUCCESSFULLY!')}
                            </h2>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">
                                {t(
                                    'يا {name}، لقد خطوت خطوتك الأولى نحو هويتك الرقمية. طلبك الآن قيد المعالجة.',
                                    `{name}, you've taken your first step towards your digital identity. Your request is now being processed.`
                                ).replace('{name}', formData.nameAr)}
                            </p>
                        </div>

                        {/* Digital ID Card Preview (Light Theme) */}
                        <motion.div
                            initial={{ rotateX: 45, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="mt-10 mb-10 perspective-1000"
                        >
                            <div className="bg-white p-7 rounded-[2.5rem] text-left relative overflow-hidden shadow-[0_20px_50px_rgba(245,200,60,0.15)] border border-secondary/20 h-64 flex flex-col justify-between group transition-all duration-500 hover:shadow-[0_25px_60px_rgba(245,200,60,0.25)] ring-1 ring-secondary/5">
                                {/* Background Deco */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-[50px] rounded-full -mr-20 -mt-20" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -ml-16 -mb-16" />

                                <div className="flex justify-between items-start relative z-10">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Digital University ID</div>
                                        <div className="text-xl font-display font-black text-primary italic">AL-JEEL <span className="text-secondary-dark">ALJADEED</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 group-hover:bg-secondary/10 transition-colors">
                                        <QrCode className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('الاسم الكامل', 'FULL NAME')}</div>
                                        <div className="text-xl font-black text-gray-900 truncate tracking-tight">{formData.nameEn || formData.nameAr}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('الرقم الأكاديمي', 'ACADEMIC ID')}</div>
                                            <div className="text-lg font-mono text-primary font-black tracking-tighter">{formData.academicId}</div>
                                        </div>
                                        <div className="space-y-1 text-right flex flex-col items-end">
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t('الحالة', 'STATUS')}</div>
                                            <div className="mt-1 inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black border border-amber-100">
                                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                                {t('قيد المراجعة', 'REVIEWING')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="flex-1 bg-secondary text-primary hover:bg-primary hover:text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-secondary/20 transition-all duration-300"
                                onClick={() => window.print()}
                            >
                                <Download className="w-4 h-4 mx-2" />
                                {t('حفظ المستند', 'Save Document')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1 text-gray-500 hover:bg-gray-50 h-14 rounded-2xl font-bold"
                                onClick={() => window.location.href = '/'}
                            >
                                {t('العودة للرئيسية', 'Back to Home')}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-white text-gray-900 selection:bg-secondary selection:text-primary relative overflow-hidden">
            {/* Visual background layers */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    {/* Left Side: Info & Benefits */}
                    <div className="lg:w-1/2 space-y-12 py-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <h1 className="text-5xl xl:text-7xl font-display font-black leading-[1.1] text-gray-900 italic uppercase">
                                {t('هويتك الرقمية تبدأ من هنا', 'YOUR DIGITAL IDENTITY STARTS HERE')}
                            </h1>
                            <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
                                {t(
                                    'البريد الجامعي ليس مجرد وسيلة تواصل، بل هو جواز سفرك الرسمي للوصول إلى أرقى الخدمات التعليمية والبرمجية في العالم بخصومات حصرية للطلاب نمنحها لك مجاناً.',
                                    'A university email is not just a communication tool; it is your official passport to access top-tier educational and software services globally with exclusive student discounts provided for free.'
                                )}
                            </p>
                        </motion.div>

                        {/* Benefits Grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            {benefits.map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="bg-gray-50 border border-gray-100 p-8 rounded-[2rem] hover:bg-secondary/20 transition-all duration-300 group"
                                >
                                    <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-secondary transition-all mb-6">
                                        <benefit.icon className="w-7 h-7 group-hover:text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-900">{t(benefit.titleAr, benefit.titleEn)}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{t(benefit.descAr, benefit.descEn)}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-8 flex items-center gap-4 border-t border-gray-100">
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                {t('رؤية الجيل الجديد • التميز الرقمي', 'New Generation Vision • Digital Excellence')}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Professional Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:w-1/2 w-full sticky top-28"
                    >
                        <Card className="bg-white border-gray-100 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden ring-1 ring-black/5">
                            <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-light p-10 pb-16 flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
                                <div className="space-y-2 relative z-10">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t('نموذج الطلب', 'REQUEST FORM')}</h2>
                                    <p className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">{t('بيانات دقيقة لخدمة أسرع', 'ACCURATE DATA FOR FASTER SERVICE')}</p>
                                </div>
                                <GraduationCap className="w-14 h-14 text-white/20 relative z-10" />
                            </div>

                            <CardContent className="p-10 -mt-10 bg-transparent relative">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className={`text-xs font-black uppercase tracking-widest pl-1 transition-colors ${errors.nameAr ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {t('الاسم الثلاثي بالعربية', 'FULL NAME (AR)')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        className={`h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-secondary focus:border-secondary transition-all placeholder:text-gray-400 px-6 font-bold text-gray-900 ${errors.nameAr ? 'border-red-500 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                                                        placeholder="مثال: أحمد محمد علي"
                                                        value={formData.nameAr}
                                                        onChange={e => handleInputChange('nameAr', e.target.value)}
                                                    />
                                                    {errors.nameAr && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />}
                                                </div>
                                                {errors.nameAr && <p className="text-[10px] text-red-500 font-bold px-2">{errors.nameAr}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={`text-xs font-black uppercase tracking-widest pl-1 transition-colors ${errors.nameEn ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {t('الاسم الثلاثي بالإنجليزي', 'FULL NAME (EN)')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        className={`h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-secondary focus:border-secondary transition-all placeholder:text-gray-400 px-6 font-bold text-gray-900 ${errors.nameEn ? 'border-red-500 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                                                        placeholder="Ahmed Mohamed Ali"
                                                        value={formData.nameEn}
                                                        onChange={e => handleInputChange('nameEn', e.target.value)}
                                                    />
                                                    {errors.nameEn && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />}
                                                </div>
                                                {errors.nameEn && <p className="text-[10px] text-red-500 font-bold px-2">{errors.nameEn}</p>}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className={`text-xs font-black uppercase tracking-widest pl-1 transition-colors ${errors.academicId ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {t('الرقم الأكاديمي', 'ACADEMIC ID')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        className={`h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-secondary focus:border-secondary transition-all placeholder:text-gray-400 px-6 font-mono font-bold text-gray-900 ${errors.academicId ? 'border-red-500 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                                                        placeholder="2024XXXX"
                                                        value={formData.academicId}
                                                        onChange={e => handleInputChange('academicId', e.target.value)}
                                                    />
                                                    {errors.academicId && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />}
                                                </div>
                                                {errors.academicId && <p className="text-[10px] text-red-500 font-bold px-2">{errors.academicId}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={`text-xs font-black uppercase tracking-widest pl-1 transition-colors ${errors.phone ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {t('رقم الموبايل (واتساب)', 'MOBILE NUMBER')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        type="tel"
                                                        className={`h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-secondary focus:border-secondary transition-all placeholder:text-gray-400 px-6 font-bold text-gray-900 ${errors.phone ? 'border-red-500 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                                                        placeholder="77XXXXXXX"
                                                        value={formData.phone}
                                                        onChange={e => handleInputChange('phone', e.target.value)}
                                                    />
                                                    {errors.phone && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />}
                                                </div>
                                                {errors.phone && <p className="text-[10px] text-red-500 font-bold px-2">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className={`text-xs font-black uppercase tracking-widest pl-1 transition-colors ${errors.college ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {t('الكلية', 'COLLEGE')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        className={`h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-secondary focus:border-secondary transition-all placeholder:text-gray-400 px-6 font-bold text-gray-900 ${errors.college ? 'border-red-500 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                                                        placeholder={t('اسم الكلية', 'College Name')}
                                                        value={formData.college}
                                                        onChange={e => handleInputChange('college', e.target.value)}
                                                    />
                                                    {errors.college && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />}
                                                </div>
                                                {errors.college && <p className="text-[10px] text-red-500 font-bold px-2">{errors.college}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={`text-xs font-black uppercase tracking-widest pl-1 transition-colors ${errors.level ? 'text-red-500' : 'text-gray-900'}`}>
                                                    {t('المستوى الدراسي', 'ACADEMIC LEVEL')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        required
                                                        className={`h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-secondary focus:border-secondary transition-all placeholder:text-gray-400 px-6 font-bold text-gray-900 ${errors.level ? 'border-red-500 ring-red-500/20 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]' : ''}`}
                                                        placeholder={t('مثال: المستوى الثالث', 'Example: Level 3')}
                                                        value={formData.level}
                                                        onChange={e => handleInputChange('level', e.target.value)}
                                                    />
                                                    {errors.level && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500" />}
                                                </div>
                                                {errors.level && <p className="text-[10px] text-red-500 font-bold px-2">{errors.level}</p>}
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-secondary text-primary hover:bg-primary hover:text-white transition-all duration-500 text-lg font-bold uppercase tracking-wider group shadow-xl shadow-secondary/10 active:scale-95">
                                            {t('ارسال الطلب الآن', 'SUBMIT REQUEST NOW')}
                                            <ArrowRight className="w-5 h-5 mx-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                                        </Button>
                                    </form>
                                </div>

                                <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">
                                    {t('أمانك أولويتنا • بيانات مشفرة', 'SECURITY FIRST • ENCRYPTED DATA')}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
