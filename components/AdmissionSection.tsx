'use client'
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, Upload, FileText, GraduationCap, User, FolderOpen, Construction, Rocket, Cog } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { College } from '@/types';
import { createAdmissionRequest } from '@/services/data/admission-api';

interface AdmissionSectionProps {
  colleges?: College[];
}

export const AdmissionSection = ({ colleges = [] }: AdmissionSectionProps) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    program: '',
    educationStatus: 'graduate' as 'graduate' | 'student',
    documents: {
      highSchool: null as File | null,
      id: null as File | null,
      photo: null as File | null,
    }
  });

  const [serialNumber, setSerialNumber] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (value && !/^[\u0600-\u06FFa-zA-Z\s]+$/.test(value)) {
          error = t('يرجى استخدام الحروف فقط', 'Please use letters only');
        } else if (value && value.trim().split(/\s+/).length < 3) {
          error = t('يرجى كتابة الاسم الثلاثي على الأقل', 'Please enter at least three names');
        }
        break;
      case 'phone':
        if (value && !/^\+?\d{7,15}$/.test(value)) {
          error = t('يرجى إدخال رقم هاتف صحيح', 'Please enter a valid phone number');
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = t('يرجى إدخال بريد إلكتروني صحيح', 'Please enter a valid email address');
        }
        break;
      case 'college':
        if (!value) error = t('يرجى اختيار الكلية', 'Please select a college');
        break;
      case 'program':
        if (!value) error = t('يرجى إدخال اسم البرنامج', 'Please enter program name');
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (field: string, value: string) => {
    let clean = value;
    if (field === 'fullName') {
      clean = value.replace(/[^\u0600-\u06FFa-zA-Z\s]/g, '').replace(/\s\s+/g, ' ');
    } else if (field === 'phone') {
      clean = value.replace(/[^\d+]/g, '');
      if (clean.includes('+')) {
        clean = `+${clean.replace(/\+/g, '')}`;
      }
      clean = clean.slice(0, 16);
    } else if (field === 'college' || field === 'program') {
      clean = value.replace(/[^\u0600-\u06FFa-zA-Z0-9\s\-\u0660-\u0669]/g, '').replace(/\s\s+/g, ' ');
    }

    setFormData(prev => ({
      ...prev,
      [field]: clean,
      ...(field === 'college' ? { program: '' } : {}),
    }));
    validateField(field, clean);
  };

  const generateSerialNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `AJU-24-${random}`;
  };

  const selectedCollege = colleges.find((college) => college.id === formData.college);
  const currentPrograms = selectedCollege?.programs || [];
  const selectedCollegeLabel = selectedCollege ? t(selectedCollege.nameAr, selectedCollege.nameEn) : '';
  const selectedProgram = currentPrograms.find((program) => program.id === formData.program);
  const selectedProgramLabel = selectedProgram ? t(selectedProgram.nameAr, selectedProgram.nameEn) : formData.program;

  const steps = [
    { number: 1, title: { ar: 'المعلومات الشخصية', en: 'Personal Info' }, icon: User },
    { number: 2, title: { ar: 'الكلية والبرنامج', en: 'College & Program' }, icon: GraduationCap },
    { number: 3, title: { ar: 'الوثائق', en: 'Documents' }, icon: FolderOpen },
    { number: 4, title: { ar: 'المراجعة', en: 'Review' }, icon: CheckCircle },
  ];

  const handleNext = () => {
    let isValid = true;
    if (currentStep === 1) {
      const v1 = validateField('fullName', formData.fullName);
      const v2 = validateField('phone', formData.phone);
      const v3 = validateField('email', formData.email);
      isValid = v1 && v2 && v3 && !!formData.fullName && !!formData.phone && !!formData.email;
    } else if (currentStep === 2) {
      const v1 = validateField('college', formData.college);
      const v2 = validateField('program', formData.program);
      isValid = v1 && v2 && !!formData.college && !!formData.program;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      toast.error(t('يرجى التأكد من صحة جميع البيانات المطلوبة', 'Please ensure all required data is correct'));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (field: keyof typeof formData.documents, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: file }
    }));
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('FILE_READ_FAILED'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    const isNameValid = validateField('fullName', formData.fullName);
    const isPhoneValid = validateField('phone', formData.phone);
    const isEmailValid = validateField('email', formData.email);
    const isCollegeValid = validateField('college', formData.college);
    const isProgramValid = validateField('program', formData.program);

    if (!isNameValid || !isPhoneValid || !isEmailValid || !isCollegeValid || !isProgramValid || !formData.fullName || !formData.phone || !formData.email || !formData.college || !formData.program) {
      toast.error(t('يرجى تصحيح الأخطاء في النموذج قبل الإرسال', 'Please correct form errors before submitting'));
      return;
    }

    const isGraduate = formData.educationStatus === 'graduate';
    const hasFiles = formData.documents.highSchool && formData.documents.id && formData.documents.photo;

    if (isGraduate && !hasFiles) {
      toast.error(t('يرجى رفع جميع الوثائق المطلوبة للحصول على الرقم التسلسلي والخصم', 'Please upload all required documents to get the serial number and discount'));
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const serialCandidate = isGraduate && hasFiles ? generateSerialNumber() : '';
      const highSchoolDoc = formData.documents.highSchool ? await fileToDataUrl(formData.documents.highSchool) : '';
      const idDoc = formData.documents.id ? await fileToDataUrl(formData.documents.id) : '';
      const photoDoc = formData.documents.photo ? await fileToDataUrl(formData.documents.photo) : '';

      await createAdmissionRequest({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialty: selectedProgramLabel || formData.program.trim(),
        collegeId: formData.college,
        collegeName: selectedCollegeLabel || '',
        programId: formData.program,
        programName: selectedProgramLabel || formData.program.trim(),
        educationStatus: formData.educationStatus,
        hasRequiredDocuments: Boolean(hasFiles),
        highSchoolDocumentName: formData.documents.highSchool?.name || '',
        idDocumentName: formData.documents.id?.name || '',
        personalPhotoName: formData.documents.photo?.name || '',
        serialNumber: serialCandidate || '',
        title: formData.fullName.trim(),
        message: `${t('الكلية', 'College')}: ${selectedCollegeLabel || '-'}\n${t('البرنامج', 'Program')}: ${selectedProgramLabel || formData.program || '-'}\n${t('الحالة الدراسية', 'Education Status')}: ${formData.educationStatus}`,
        type: 'student',
        status: 'pending',
        documents: {
          ...(formData.documents.highSchool
            ? {
                highSchool: {
                  name: formData.documents.highSchool.name,
                  content: highSchoolDoc,
                  mimeType: formData.documents.highSchool.type || 'application/pdf',
                },
              }
            : {}),
          ...(formData.documents.id
            ? {
                id: {
                  name: formData.documents.id.name,
                  content: idDoc,
                  mimeType: formData.documents.id.type || 'application/pdf',
                },
              }
            : {}),
          ...(formData.documents.photo
            ? {
                photo: {
                  name: formData.documents.photo.name,
                  content: photoDoc,
                  mimeType: formData.documents.photo.type || 'application/pdf',
                },
              }
            : {}),
        },
      });

      if (isGraduate && hasFiles) {
        setSerialNumber(serialCandidate);
      } else {
        setSerialNumber(null);
      }

      setShowSuccess(true);
      toast.success(
        t(
          'تم إرسال طلب القبول وحفظه بنجاح',
          'Admission application submitted and saved successfully'
        )
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('تعذر حفظ الطلب', 'Failed to save application')
      toast.error(msg)
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      college: '',
      program: '',
      educationStatus: 'graduate',
      documents: { highSchool: null, id: null, photo: null }
    });
    setSerialNumber(null);
    setShowSuccess(false);
    setErrors({});
    setCurrentStep(1);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3 }
    }
  };

  return (
    <section id="admission" className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden" ref={sectionRef}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <FileText className="w-4 h-4" />
            {t('ابدأ مستقبلك الآن', 'Start Your Future Now')}
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent py-2 leading-relaxed">
            {t('القبول والتسجيل', 'Admission & Registration')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(
              'أهلاً بكم في جامعة الجيل الجديد. ابدأ رحلتك الأكاديمية معنا من خلال التقديم عبر النموذج التالي',
              'Welcome to Al-Jeel Al-Jadeed University. Start your academic journey with us by applying through the following form'
            )}
          </p>
        </motion.div>

        {/* Student Affairs Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1.5 bg-secondary rounded-full" />
              <h3 className="text-3xl font-display font-bold text-foreground">
                {t('شؤون الطلاب', 'Student Affairs')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                // ⚠️ لما ترفع الملف: غيّر fileComingSoon إلى false لهذا الملف بس
                { title: { ar: 'لائحة شؤون الطلاب', en: 'Student Affairs Regulations' }, icon: FileText, href: '/docs/regulations.pdf', fileComingSoon: true },
                { title: { ar: 'الدوري التكميلي', en: 'Supplementary Semester' }, icon: FileText, href: '/docs/supplementary.pdf', fileComingSoon: true },
                { title: { ar: 'استمارة تظلمات', en: 'Grievance Form' }, icon: FileText, href: '/docs/grievance.pdf', fileComingSoon: true },
                { title: { ar: 'ضوابط وسلوكيات عامة', en: 'General Behavior Controls' }, icon: FileText, href: '/docs/general_conduct.pdf', fileComingSoon: true },
                { title: { ar: 'ضوابط وسلوكيات الامتحانات', en: 'Exam Behavior Controls' }, icon: FileText, href: '/docs/exam_conduct.pdf', fileComingSoon: true },
              ].map((doc, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto py-5 px-6 flex items-center justify-between text-right bg-white/5 hover:bg-white/10 border-border group transition-all duration-300 shadow-sm hover:shadow-md hover:border-secondary"
                    onClick={() => {
                      if (doc.fileComingSoon) {
                        setShowFileModal(true);
                      } else {
                        window.open(doc.href, '_blank');
                        toast.info(t('يتم الآن فتح الملف...', 'Opening file...'));
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20">
                        <doc.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="font-bold text-base whitespace-normal text-start">
                        {t(doc.title.ar, doc.title.en)}
                      </span>
                    </div>
                    {doc.fileComingSoon ? (
                      <span className="text-[10px] font-bold text-secondary/60 bg-secondary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {t('قريباً', 'Soon')}
                      </span>
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-secondary opacity-50 group-hover:opacity-100 transition-all rotate-180" />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="max-w-4xl mx-auto shadow-2xl border-border/50 overflow-hidden">
            {/* Progress Steps */}
            <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground pb-8">
              <CardTitle className="text-2xl text-center mb-8">
                {t('نموذج التقديم', 'Application Form')}
              </CardTitle>

              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-white/20 rounded-full">
                  <motion.div
                    className="h-full bg-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                {steps.map((step) => (
                  <motion.div
                    key={step.number}
                    className="relative z-10 flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.number
                        ? 'bg-secondary text-primary shadow-lg'
                        : 'bg-white/20 text-white/60'
                        }`}
                      animate={currentStep >= step.number ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <step.icon className="w-5 h-5" />
                    </motion.div>
                    <span className={`text-xs mt-2 font-medium ${currentStep >= step.number ? 'text-secondary' : 'text-white/60'}`}>
                      {t(step.title.ar, step.title.en)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {t('المعلومات الشخصية', 'Personal Information')}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="fullName" className={errors.fullName ? 'text-red-500' : ''}>{t('الاسم الكامل', 'Full Name')}</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder={t('أدخل الاسم الكامل', 'Enter full name')}
                          className={`mt-2 ${errors.fullName ? 'border-red-500 ring-red-500/20' : ''}`}
                        />
                        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="phone" className={errors.phone ? 'text-red-500' : ''}>{t('رقم الهاتف', 'Phone Number')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder={t('أدخل رقم الهاتف', '77XXXXXXX')}
                          className={`mt-2 ${errors.phone ? 'border-red-500 ring-red-500/20' : ''}`}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="email" className={errors.email ? 'text-red-500' : ''}>{t('البريد الإلكتروني', 'Email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={t('example@mail.com', 'example@mail.com')}
                        className={`mt-2 ${errors.email ? 'border-red-500 ring-red-500/20' : ''}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 bg-primary/5 rounded-xl border border-primary/10"
                    >
                      <Label className="mb-4 block text-primary font-bold">{t('الحالة الدراسية', 'Education Status')}</Label>
                      <RadioGroup
                        value={formData.educationStatus}
                        onValueChange={(val: 'graduate' | 'student') => setFormData({ ...formData, educationStatus: val })}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer group">
                          <RadioGroupItem value="graduate" id="graduate" className="border-primary text-primary" />
                          <Label htmlFor="graduate" className="cursor-pointer font-medium group-hover:text-primary transition-colors">
                            {t('خريج ثانوية عامة (مستعد لرفع الوثائق)', 'High School Graduate (Ready to upload documents)')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer group">
                          <RadioGroupItem value="student" id="student" className="border-primary text-primary" />
                          <Label htmlFor="student" className="cursor-pointer font-medium group-hover:text-primary transition-colors">
                            {t('طالب ثالث ثانوي (حجز مقعد فقط)', '3rd Year Secondary Student (Seat reservation only)')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: College Selection */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      {t('اختيار الكلية والبرنامج', 'College and Program Selection')}
                    </h3>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label htmlFor="college" className={errors.college ? 'text-red-500' : ''}>{t('الكلية', 'College')}</Label>
                      <Select
                        value={formData.college}
                        onValueChange={(value) => handleInputChange('college', value)}
                      >
                        <SelectTrigger className={`mt-2 ${errors.college ? 'border-red-500 ring-red-500/20' : ''}`}>
                          <SelectValue placeholder={t('اختر الكلية', 'Select College')} />
                        </SelectTrigger>
                        <SelectContent>
                          {colleges.map((college) => (
                            <SelectItem key={college.id} value={college.id}>
                              {t(college.nameAr, college.nameEn)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.college && <p className="text-xs text-red-500 mt-1">{errors.college}</p>}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label htmlFor="program" className={errors.program ? 'text-red-500' : ''}>{t('البرنامج', 'Program')}</Label>
                      {currentPrograms.length > 0 ? (
                        <Select
                          value={formData.program}
                          onValueChange={(value) => handleInputChange('program', value)}
                        >
                          <SelectTrigger className={`mt-2 ${errors.program ? 'border-red-500 ring-red-500/20' : ''}`}>
                            <SelectValue placeholder={t('اختر البرنامج', 'Select Program')} />
                          </SelectTrigger>
                          <SelectContent>
                            {currentPrograms.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {t(program.nameAr, program.nameEn)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="program"
                          value={formData.program}
                          onChange={(e) => handleInputChange('program', e.target.value)}
                          placeholder={t('أدخل اسم البرنامج', 'Enter program name')}
                          className={`mt-2 ${errors.program ? 'border-red-500 ring-red-500/20' : ''}`}
                        />
                      )}
                      {errors.program && <p className="text-xs text-red-500 mt-1">{errors.program}</p>}
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Documents Upload */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      {t('رفع الوثائق', 'Upload Documents')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { key: 'highSchool', label: { ar: 'شهادة الثانوية', en: 'High School Certificate' } },
                        { key: 'id', label: { ar: 'صورة الهوية', en: 'ID Photo' } },
                        { key: 'photo', label: { ar: 'صورة شخصية', en: 'Personal Photo' } }
                      ].map((doc, index) => (
                        <motion.label
                          key={doc.key}
                          className={`group border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${formData.educationStatus === 'student' ? 'border-muted bg-muted/20 opacity-80' : 'border-border hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          whileHover={formData.educationStatus === 'graduate' ? { scale: 1.02 } : {}}
                          whileTap={formData.educationStatus === 'graduate' ? { scale: 0.98 } : {}}
                        >
                          <motion.div
                            className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                            whileHover={formData.educationStatus === 'graduate' ? { rotate: 10 } : {}}
                          >
                            <Upload className="w-6 h-6 text-primary" />
                          </motion.div>
                          <span className="text-foreground font-medium">
                            {t(doc.label.ar, doc.label.en)}
                            {formData.educationStatus === 'student' && <span className="text-xs text-muted-foreground block font-normal">({t('اختياري لطلاب ثالث ثانوي', 'Optional for 3rd year students')})</span>}
                          </span>
                          <Input
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            disabled={formData.educationStatus === 'student'}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file && file.type !== 'application/pdf') {
                                toast.error(t('يرجى رفع ملفات بصيغة PDF فقط', 'Please upload PDF files only'));
                                return;
                              }
                              if (file && file.size > 5 * 1024 * 1024) {
                                toast.error(t('حجم الملف كبير جداً (الأقصى 5 ميجابايت)', 'File size is too large (Max 5MB)'));
                                return;
                              }
                              handleFileUpload(doc.key as keyof typeof formData.documents, file);
                            }}
                          />
                          {formData.documents[doc.key as keyof typeof formData.documents] && (
                            <motion.p
                              className="mt-2 text-sm text-green-600 flex items-center justify-center gap-2"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <CheckCircle className="w-4 h-4" />
                              {formData.documents[doc.key as keyof typeof formData.documents]?.name}
                            </motion.p>
                          )}
                        </motion.label>
                      ))}
                    </div>

                    {formData.educationStatus === 'student' && (
                      <div className="bg-blue-500/10 text-blue-700 p-4 rounded-xl text-center text-sm">
                        {t(
                          'يمكنك إرسال الطلب الآن لحجز مقعدك، وسيتم إصدار الرقم التسلسلي والخصم فور رفع وثائقك لاحقاً.',
                          'You can submit the application now to reserve your seat. The serial number and discount will be issued once you upload your documents later.'
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      {t('مراجعة البيانات', 'Review Information')}
                    </h3>

                    <motion.div
                      className="bg-muted/50 rounded-xl p-6 space-y-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {[
                        { label: { ar: 'الاسم:', en: 'Name:' }, value: formData.fullName },
                        { label: { ar: 'البريد الإلكتروني:', en: 'Email:' }, value: formData.email },
                        { label: { ar: 'الهاتف:', en: 'Phone:' }, value: formData.phone },
                        { label: { ar: 'الكلية:', en: 'College:' }, value: selectedCollegeLabel },
                        { label: { ar: 'البرنامج:', en: 'Program:' }, value: selectedProgramLabel },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.05 }}
                        >
                          <span className="font-semibold text-muted-foreground">{t(item.label.ar, item.label.en)}</span>
                          <span className="text-foreground">{item.value || '-'}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.p
                      className="text-sm text-muted-foreground text-center bg-amber-500/10 text-amber-700 p-3 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {t(
                        'تأكد من صحة جميع البيانات قبل الإرسال',
                        'Make sure all information is correct before submitting'
                      )}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="gap-2"
                  >
                    {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {t('السابق', 'Previous')}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStep < totalSteps ? (
                    <Button onClick={handleNext} className="gap-2">
                      {t('التالي', 'Next')}
                      {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
                      <CheckCircle className="w-4 h-4" />
                      {isSubmitting ? t('جارٍ الإرسال...', 'Submitting...') : t('إرسال الطلب', 'Submit Application')}
                    </Button>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Coming Soon Dialog */}
        <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
          <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
            <div className="p-8 text-center space-y-6">
              {/* Animated Icon */}
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-2 border-dashed border-secondary/30 rounded-full scale-150"
                />
                <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto border border-secondary/20 relative z-10 overflow-hidden shadow-xl">
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Construction className="w-10 h-10 text-secondary" />
                  </motion.div>
                  <motion.div
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <DialogTitle className="text-2xl font-display font-bold text-gray-900">
                  {t('الملف قيد الإعداد', 'File Being Prepared')}
                </DialogTitle>
                <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
                  <Rocket className="w-4 h-4 text-secondary animate-bounce" />
                  <span>{t('سيتوفر الملف قريباً', 'File will be available soon')}</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {t(
                    'نعمل على إعداد هذا الملف وسيتم رفعه قريباً. شكراً لصبركم.',
                    'We are preparing this file and it will be uploaded soon. Thank you for your patience.'
                  )}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs mx-auto space-y-1">
                <div className="flex justify-between text-xs font-bold text-secondary uppercase tracking-wider">
                  <span>{t('التقدم', 'Progress')}</span>
                  <span>75%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-4 opacity-20">
                <Cog className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
                <Cog className="w-10 h-10 animate-[spin_12s_linear_infinite_reverse]" />
                <Cog className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
              </div>

              <Button
                onClick={() => setShowFileModal(false)}
                className="w-full rounded-xl h-12 font-bold"
              >
                {t('حسناً', 'Got it')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
            <div className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <div className="space-y-2">
                <DialogTitle className="text-2xl font-display font-bold text-gray-900">
                  {t('تم استلام طلبك بنجاح!', 'Application Received!')}
                </DialogTitle>
                <p className="text-gray-600">
                  {formData.educationStatus === 'graduate'
                    ? t('شكراً لك على التقديم عبر موقعنا. لقد حصلت على خصم 3% للطلاب المجددين!', 'Thank you for applying through our website. You received a 3% discount for new students!')
                    : t('تم حفظ بيانات حجز المقعد بنجاح. سنقوم بمراجعة طلبك والتواصل معك.', 'Seat reservation data saved successfully. We will review and contact you.')}
                </p>
              </div>

              {serialNumber && formData.educationStatus === 'graduate' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-amber-500/5 rounded-2xl p-6 border-2 border-dashed border-amber-500/20 relative group"
                >
                  <div className="flex items-center justify-center gap-2 text-amber-600 font-bold mb-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    {t('قيد المراجعة والتدقيق', 'Under Review & Verification')}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {t(
                      'يتم الآن مراجعة وثائقك من قبل قسم القبول. بعد التأكد من صحتها، سيتم تفعيل الخصم لك.',
                      'Your documents are being reviewed by the admissions department. After verification, the discount will be activated for you.'
                    )}
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <div className="text-xs text-muted-foreground mb-1">{t('رقم الطلب المؤقت', 'Temporary Request ID')}</div>
                    <div className="text-2xl font-display font-black text-amber-700 tracking-wider">
                      {serialNumber}
                    </div>
                  </div>
                </motion.div>
              )}

              {serialNumber && formData.educationStatus === 'student' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-primary/5 rounded-2xl p-6 border-2 border-dashed border-primary/20 relative group"
                >
                  <div className="text-xs uppercase tracking-widest text-primary font-bold mb-2">
                    {t('رقم حجز المقعد', 'SEAT RESERVATION NUMBER')}
                  </div>
                  <div className="text-4xl font-display font-black text-primary tracking-wider">
                    {serialNumber}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t('يرجى التوجه للجامعة لاستكمال إجراءات التسجيل بعد النجاح في الثانوية.', 'Please visit the university to complete registration after passing high school.')}
                  </p>
                </motion.div>
              )}

              {!serialNumber && formData.educationStatus === 'student' && (
                <div className="bg-amber-500/10 p-4 rounded-xl text-amber-700 text-sm font-medium">
                  {t('سيصلك الرقم التسلسلي والخصم فور استكمال رفع الوثائق.', 'You will receive the serial number and discount once document upload is completed.')}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                {serialNumber && (
                  <Button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
                  >
                    <FileText className="w-4 h-4 mx-2" />
                    {t('طباعة أو حفظ الرقم', 'Print or Save Number')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="text-muted-foreground hover:bg-gray-100 rounded-xl"
                >
                  {t('إغلاق', 'Close')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
