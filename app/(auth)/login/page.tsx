'use client'
import Link from 'next/link';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner';

type UserType = 'student' | 'teacher' | null;

export default function Login() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    academicNumber: '',
    password: '',
    phone: '',
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let error = '';

    if (name === 'academicNumber') {
      if (!value) error = language === 'ar' ? 'معرف الدخول مطلوب' : 'Login identifier is required';
    }

    if (name === 'phone') {
      if (value && !/^7\d{8}$/.test(value)) error = language === 'ar' ? 'يجب أن يبدأ بـ 7 ويتكون من 9 أرقام' : 'Must start with 7 and be 9 digits';
    }

    if (name === 'password') {
      if (!value) error = language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const lowerId = id.toLowerCase();
    const name = lowerId.includes('academicnumber') ? 'academicNumber' : (lowerId.includes('phone') ? 'phone' : (lowerId.includes('password') ? 'password' : ''));

    let cleanedValue = value;
    if (name === 'phone') {
      cleanedValue = value.replace(/\D/g, ''); // Remove non-digits
    }

    setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    if (name) validateField(name, cleanedValue);
  };

  const { login, isLoading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isAcademicValid = validateField('academicNumber', formData.academicNumber);
    const isPasswordValid = validateField('password', formData.password);
    if (!isAcademicValid || !isPasswordValid) {
      toast.error(language === 'ar' ? 'يرجى تصحيح الأخطاء قبل المتابعة' : 'Please correct the errors before proceeding');
      return;
    }

    const roleToLogin = userType === 'teacher' ? 'doctor' : userType;

    try {
      await login({
        username: formData.academicNumber.trim(),
        password: formData.password,
        expectedRole: roleToLogin === 'student' || roleToLogin === 'doctor' ? roleToLogin : null,
      });

      const callbackUrl =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('callbackUrl')
          : null;
      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.push(callbackUrl);
        return;
      }

      if (userType === 'student') {
        router.push('/student-dashboard');
      } else if (userType === 'teacher') {
        router.push('/doctor-dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-4xl">
          {/* User Type Selection */}
          {!userType && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                  {t('تسجيل الدخول', 'Login')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('اختر نوع الحساب للمتابعة', 'Select account type to continue')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
                <Card
                  className="p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-secondary group"
                  onClick={() => setUserType('student')}
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <GraduationCap className="w-10 h-10 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {t('طالب', 'Student')}
                    </h3>
                    <p className="text-foreground font-medium">
                      {t('للطلاب المسجلين في الجامعة', 'For registered students')}
                    </p>
                  </div>
                </Card>

                <Card
                  className="p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-secondary group"
                  onClick={() => setUserType('teacher')}
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <User className="w-10 h-10 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {t('عضو هيئة تدريس', 'Faculty Member')}
                    </h3>
                    <p className="text-foreground font-medium">
                      {t('لأعضاء هيئة التدريس والبحث العلمي', 'For faculty and researchers')}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Student Login Form */}
          {userType === 'student' && (
            <Card className="p-8 md:p-12 max-w-md mx-auto animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {t('تسجيل دخول الطالب', 'Student Login')}
                </h2>
                <p className="text-muted-foreground">
                  {t('أدخل بياناتك للدخول إلى حسابك', 'Enter your credentials to login')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="academicNumber" className="text-right block text-foreground font-semibold">
                    {t('الرقم الأكاديمي', 'Academic Number')}
                  </Label>
                  <Input
                    id="academicNumber"
                    type="text"
                    value={formData.academicNumber}
                    onChange={handleInputChange}
                    placeholder={t('أدخل الرقم الأكاديمي', 'Enter academic number')}
                    required
                    className={`text-right ${errors.academicNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.academicNumber && (
                    <p className="text-xs text-red-500 text-right mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.academicNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right block text-foreground font-semibold">
                    {t('كلمة المرور', 'Password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('أدخل كلمة المرور', 'Enter password')}
                    required
                    className={`text-right ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 text-right mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.password}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberStudent"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="rememberStudent" className="text-sm text-muted-foreground cursor-pointer">
                        {t('تذكرني', 'Remember me')}
                      </Label>
                    </div>
                    <Link href="/forgot-password"
                      className="text-sm text-secondary hover:text-secondary/80 hover:underline transition-colors"
                    >
                      {t('هل نسيت كلمة السر؟', 'Forgot password?')}
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block text-foreground font-semibold">
                    {t('رقم الهاتف', 'Phone Number')}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('أدخل رقم الهاتف', 'Enter phone number')}
                    className={`text-right ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 text-right mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-primary font-bold py-6"
                  >
                    {authLoading ? t('جاري الدخول...', 'Signing in...') : t('دخول', 'Login')}
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUserType(null)}
                    className="px-8 py-6"
                  >
                    {t('رجوع', 'Back')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Teacher Login Form */}
          {userType === 'teacher' && (
            <Card className="p-8 md:p-12 max-w-md mx-auto animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {t('تسجيل دخول الدكتور', 'Teacher Login')}
                </h2>
                <p className="text-muted-foreground">
                  {t('أدخل بياناتك للدخول إلى حسابك', 'Enter your credentials to login')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teacherAcademicNumber" className="text-right block text-foreground font-semibold">
                    {t('الرقم الأكاديمي', 'Academic Number')}
                  </Label>
                  <Input
                    id="teacherAcademicNumber"
                    type="text"
                    value={formData.academicNumber}
                    onChange={handleInputChange}
                    placeholder={t('أدخل الرقم الأكاديمي', 'Enter academic number')}
                    required
                    className={`text-right ${errors.academicNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.academicNumber && (
                    <p className="text-xs text-red-500 text-right mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.academicNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherPassword" className="text-right block text-foreground font-semibold">
                    {t('كلمة المرور', 'Password')}
                  </Label>
                  <Input
                    id="teacherPassword"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('أدخل كلمة المرور', 'Enter password')}
                    required
                    className={`text-right ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 text-right mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.password}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rememberTeacher"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="rememberTeacher" className="text-sm text-muted-foreground cursor-pointer">
                        {t('تذكرني', 'Remember me')}
                      </Label>
                    </div>
                    <Link href="/forgot-password"
                      className="text-sm text-secondary hover:text-secondary/80 hover:underline transition-colors"
                    >
                      {t('هل نسيت كلمة السر؟', 'Forgot password?')}
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherPhone" className="text-right block text-foreground font-semibold">
                    {t('رقم الهاتف', 'Phone Number')}
                  </Label>
                  <Input
                    id="teacherPhone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('أدخل رقم الهاتف', 'Enter phone number')}
                    className={`text-right ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 text-right mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-primary font-bold py-6"
                  >
                    {authLoading ? t('جاري الدخول...', 'Signing in...') : t('دخول', 'Login')}
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUserType(null)}
                    className="px-8 py-6"
                  >
                    {t('رجوع', 'Back')}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>\n
      <Footer />
    </div>
  );
}

