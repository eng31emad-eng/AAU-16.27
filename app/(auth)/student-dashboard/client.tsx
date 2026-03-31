'use client'

import { useState, useEffect, useRef, Suspense } from 'react';
;
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User, BookOpen, Calendar, FileText, Wallet,
  Mail, Phone, GraduationCap, Building, Award,
  Download, Clock, MapPin, Video, FileSpreadsheet, File,
  Bell, CheckCircle, AlertCircle, Timer, CreditCard,
  TrendingUp, BookMarked, Edit, Save, X, MessageSquare, Send
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { StudentSurvey } from '@/components/dashboard/StudentSurvey';
import {
  getStudentProfile,
  getStudentCourses,
  getCourseFiles,
  getStudentSchedule,
  getStudentGrades,
  getStudentFinance,
  getStudentAdmissionRequests,
  getStudentNotifications,
  updateStudentProfile,
  uploadStudentProfileImage,
  markStudentNotificationAsRead,
  type StudentProfile,
  type StudentCourse,
  type CourseFile,
  type StudentScheduleItem,
  type StudentGrade,
  type StudentFinance,
  type StudentAdmissionRequest,
  type StudentNotification
} from '@/services/data/student.service';
import { messagesService, Conversation, Message } from '@/services/data/messages.service';
import { useRouter, useSearchParams } from 'next/navigation';

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [schedule, setSchedule] = useState<StudentScheduleItem[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [finance, setFinance] = useState<StudentFinance | null>(null);
  const [admissionRequests, setAdmissionRequests] = useState<StudentAdmissionRequest[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<StudentProfile>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contactFaculty, setContactFaculty] = useState<{ id: string; name: string; email: string } | null>(null);

  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, coursesData, filesData, scheduleData, gradesData, financeData, admissionData, notificationsData, conversationsData] = await Promise.all([
          getStudentProfile(),
          getStudentCourses(),
          getCourseFiles(),
          getStudentSchedule(),
          getStudentGrades(),
          getStudentFinance(),
          getStudentAdmissionRequests(),
          getStudentNotifications(),
          messagesService.getStudentConversations()
        ]);
        setProfile(profileData);
        setCourses(coursesData);
        setFiles(filesData);
        setSchedule(scheduleData);
        setGrades(gradesData);
        setFinance(financeData);
        setAdmissionRequests(admissionData);
        setNotifications(notificationsData);
        setConversations(conversationsData);
        setEditedProfile({ emailPersonal: profileData.emailPersonal, phone: profileData.phone });
        setProfileImage(profileData.image || null);

        // Check for faculty contact from localStorage
        const storedFaculty = localStorage.getItem('contactFaculty');
        if (storedFaculty) {
          try {
            const faculty = JSON.parse(storedFaculty);
            setContactFaculty(faculty);
            localStorage.removeItem('contactFaculty');

            // Get or create conversation with this faculty
            const conv = await messagesService.getOrCreateConversation(faculty.id, faculty.name, faculty.email);
            setCurrentConversation(conv);
            const msgs = await messagesService.getConversationMessages(conv.id);
            setConversationMessages(msgs);
          } catch {
            localStorage.removeItem('contactFaculty');
          }
        }

        // Check for survey completion (Daily Frequency)
        const lastCompletedDate = localStorage.getItem('survey_last_completed_date');
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

        if (lastCompletedDate !== today) {
          setShowSurvey(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectConversation = async (conv: Conversation) => {
    setCurrentConversation(conv);
    setContactFaculty({ id: conv.doctorId, name: conv.doctorName, email: conv.doctorEmail });
    const msgs = await messagesService.getConversationMessages(conv.id);
    setConversationMessages(msgs);
    await messagesService.markConversationAsRead(conv.id, 'student');
    setConversations(prev => prev.map(item => item.id === conv.id ? { ...item, unreadCount: 0 } : item));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    const msg = await messagesService.sendMessage(
      currentConversation.id,
      newMessage.trim(),
      'student',
      profile?.nameAr || 'الطالب'
    );
    setConversationMessages(prev => [...prev, msg]);
    setNewMessage('');

    // Update or insert conversation in list
    setCurrentConversation(prev => prev ? { ...prev, lastMessage: msg.text, lastMessageDate: msg.createdAt } : prev);
    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === currentConversation.id
          ? { ...c, lastMessage: msg.text, lastMessageDate: msg.createdAt, unreadCount: 0 }
          : c
      );

      if (updated.some(c => c.id === currentConversation.id)) {
        return updated;
      }

      return [
        {
          ...currentConversation,
          lastMessage: msg.text,
          lastMessageDate: msg.createdAt,
          unreadCount: 0,
        },
        ...updated,
      ];
    });

    toast.success(t('تم إرسال الرسالة بنجاح', 'Message sent successfully'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-YE' : 'en-US').format(amount) + (language === 'ar' ? ' ر.ي' : ' YER');
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">{t('مدفوع', 'Paid')}</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">{t('قيد الانتظار', 'Pending')}</Badge>;
      case 'overdue': return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">{t('متأخر', 'Overdue')}</Badge>;
      case 'partial': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">{t('جزئي', 'Partial')}</Badge>;
      default: return null;
    }
  };

  const getAdmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">{t('مقبول', 'Accepted')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">{t('مرفوض', 'Rejected')}</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">{t('قيد المراجعة', 'Reviewed')}</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">{t('قيد الانتظار', 'Pending')}</Badge>;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-purple-500" />;
      case 'assignment': return <FileSpreadsheet className="h-5 w-5 text-orange-500" />;
      case 'exam': return <FileText className="h-5 w-5 text-red-500" />;
      default: return <File className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateStudentProfile(editedProfile);
      setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
      setIsEditingProfile(false);
      toast.success(t('تم تحديث البيانات بنجاح', 'Profile updated successfully'));
    } catch {
      toast.error(t('حدث خطأ أثناء التحديث', 'Error updating profile'));
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'Image size must be less than 5MB'));
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
      try {
        const uploadedUrl = await uploadStudentProfileImage(file);
        setProfile(prev => prev ? { ...prev, image: uploadedUrl } : prev);
        setProfileImage(uploadedUrl || previewUrl);
        toast.success(t('تم تغيير الصورة بنجاح', 'Profile image updated successfully'));
      } catch {
        setProfileImage(profile?.image || null);
        toast.error(t('تعذر رفع الصورة', 'Unable to upload profile image'));
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markStudentNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filteredFiles = files.filter(f => selectedCourse === 'all' || f.courseId === selectedCourse);

  const semesters = [...new Set(grades.map(g => g.semester))];
  const filteredGrades = grades.filter(g => selectedSemester === 'all' || g.semester === selectedSemester);

  const days = [
    { ar: 'السبت', en: 'Saturday' },
    { ar: 'الأحد', en: 'Sunday' },
    { ar: 'الإثنين', en: 'Monday' },
    { ar: 'الثلاثاء', en: 'Tuesday' },
    { ar: 'الأربعاء', en: 'Wednesday' },
    { ar: 'الخميس', en: 'Thursday' }
  ];

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" data-breadcrumb="local">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" data-breadcrumb="local">
      <Header />

      {showSurvey && (
        <StudentSurvey
          studentName={profile?.nameAr || profile?.nameEn || ''}
          onComplete={() => setShowSurvey(false)}
        />
      )}

      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {/* Page Title with Notifications */}
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              {t('بوابة الطالب', 'Student Portal')}
            </h1>
            <p className="text-muted-foreground">
              {t(`مرحباً، ${profile?.nameAr}`, `Welcome, ${profile?.nameEn}`)}
            </p>
          </div>

        </div>

        {/* Tabs */}
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('الملف الشخصي', 'Profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2 py-3">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t('المقررات', 'Courses')}</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t('الجدول', 'Schedule')}</span>
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('الدرجات', 'Grades')}</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2 py-3">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">{t('المالية', 'Finance')}</span>
            </TabsTrigger>
            <TabsTrigger value="admission" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('طلباتي', 'My Requests')}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 py-3">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t('الرسائل', 'Messages')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="md:col-span-1 overflow-hidden border-secondary/20 h-fit sticky top-24">
                <div className="h-32 bg-gradient-to-r from-primary to-secondary/80 relative" />
                <CardContent className="pt-0 -mt-16 text-center relative z-10">
                  <div className="relative w-32 h-32 mx-auto mb-4 group ring-4 ring-background rounded-full overflow-hidden bg-background">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={t('الملف الشخصي', 'Profile')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-gold flex items-center justify-center">
                        <User className="h-16 w-16 text-secondary-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => profileImageRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer text-white"
                    >
                      <Edit className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{t('تغيير', 'Change')}</span>
                    </button>
                    <input
                      type="file"
                      ref={profileImageRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1 leading-tight">
                    {language === 'ar' ? profile?.nameAr : profile?.nameEn}
                  </h2>
                  <p className="text-secondary font-display font-medium mb-3 tracking-wide">{profile?.academicNumber}</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
                      {language === 'ar' ? profile?.levelAr : profile?.levelEn}
                    </Badge>
                    <Badge variant="outline" className="border-secondary/30 text-secondary">
                      {profile?.status || (language === 'ar' ? 'منتظم' : 'Regular')}
                    </Badge>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-secondary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{t('إنجاز الخطة الدراسية', 'Curriculum Progress')}</span>
                      <span className="text-xs font-bold text-secondary">
                        {Math.round(((profile?.completedCredits || 0) / (profile?.totalCredits || 1)) * 100)}%
                      </span>
                    </div>
                    <Progress value={(profile?.completedCredits || 0) / (profile?.totalCredits || 1) * 100} className="h-2 bg-secondary/10" />
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {profile?.completedCredits} {t('من أصل', 'out of')} {profile?.totalCredits} {t('ساعة معتمدة', 'credit hours')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-secondary" />
                      {t('المعلومات الأكاديمية', 'Academic Information')}
                    </CardTitle>
                    <Badge className={profile?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                      {profile?.status === 'active' ? t('نشط', 'Active') : t('موقف', 'Suspended')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('الكلية', 'College')}</p>
                      <p className="font-medium">{language === 'ar' ? profile?.collegeAr : profile?.collegeEn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('القسم', 'Department')}</p>
                      <p className="font-medium">{language === 'ar' ? profile?.departmentAr : profile?.departmentEn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('التخصص', 'Specialization')}</p>
                      <p className="font-medium">{language === 'ar' ? profile?.specializationAr : profile?.specializationEn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('المرشد الأكاديمي', 'Academic Advisor')}</p>
                      <p className="font-medium">{language === 'ar' ? profile?.advisorAr : profile?.advisorEn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('التخرج المتوقع', 'Expected Graduation')}</p>
                      <p className="font-medium">{new Date(profile?.expectedGraduation || '').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-secondary/10 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-secondary/5 bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Mail className="h-5 w-5 text-secondary" />
                      </div>
                      {t('معلومات التواصل', 'Contact Information')}
                    </CardTitle>
                    {!isEditingProfile ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                        className="text-secondary hover:text-secondary hover:bg-secondary/10 font-bold transition-all"
                      >
                        <Edit className="h-4 w-4 me-2" />
                        {t('تعديل البيانات', 'Edit Details')}
                      </Button>
                    ) : (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
                        >
                          <Save className="h-4 w-4 me-2" />
                          {t('حفظ', 'Save')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setEditedProfile({ emailPersonal: profile?.emailPersonal, phone: profile?.phone });
                          }}
                          className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <X className="h-4 w-4 me-2" />
                          {t('إلغاء', 'Cancel')}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-2 group">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-secondary transition-colors">
                        {t('البريد الجامعي', 'University Email')}
                      </Label>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-transparent group-hover:border-secondary/10 transition-all">
                        <Building className="h-4 w-4 text-secondary/60" />
                        <p className="font-medium text-foreground select-all">{profile?.emailUniversity}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">{t('لا يمكن تعديل البريد الجامعي', 'University email cannot be changed')}</p>
                    </div>

                    <div className="space-y-2 group">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-secondary transition-colors">
                        {t('البريد الشخصي', 'Personal Email')}
                      </Label>
                      {isEditingProfile ? (
                        <div className="relative group/input">
                          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-secondary transition-colors" />
                          <Input
                            value={editedProfile.emailPersonal || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, emailPersonal: e.target.value }))}
                            className="ps-10 border-secondary/20 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                            placeholder="example@gmail.com"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-secondary/5 group-hover:border-secondary/20 transition-all shadow-sm">
                          <Mail className="h-4 w-4 text-secondary/60" />
                          <p className="font-medium text-foreground">{profile?.emailPersonal}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-secondary transition-colors">
                        {t('رقم الهاتف', 'Phone Number')}
                      </Label>
                      {isEditingProfile ? (
                        <div className="relative group/input">
                          <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-secondary transition-colors" />
                          <Input
                            value={editedProfile.phone || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                            className="ps-10 border-secondary/20 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                            dir="ltr"
                            placeholder="+967 ..."
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-secondary/5 group-hover:border-secondary/20 transition-all shadow-sm">
                          <Phone className="h-4 w-4 text-secondary/60" />
                          <p className="font-medium text-foreground" dir="ltr">{profile?.phone}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 group">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-secondary transition-colors">
                        {t('تاريخ الالتحاق', 'Admission Date')}
                      </Label>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-transparent group-hover:border-secondary/10 transition-all">
                        <Calendar className="h-4 w-4 text-secondary/60" />
                        <p className="font-medium text-foreground">
                          {new Date(profile?.admissionDate || '').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-secondary" />
                      {t('الإشعارات', 'Notifications')}
                      {unreadNotifications > 0 && (
                        <Badge variant="destructive">{unreadNotifications}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${notif.isRead ? 'bg-muted/30' : 'bg-secondary/5 border-secondary/20'}`}
                        onClick={() => handleMarkNotificationRead(notif.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {language === 'ar' ? notif.titleAr : notif.titleEn}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === 'ar' ? notif.messageAr : notif.messageEn}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">{notif.date}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="animate-fade-in space-y-6">
            {/* Course List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-secondary" />
                  {t('المقررات المسجلة', 'Registered Courses')}
                </CardTitle>
                <CardDescription>
                  {t('الفصل الدراسي الحالي', 'Current Semester')} - {courses.length} {t('مقررات', 'courses')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">{course.code}</Badge>
                          <h3 className="font-bold text-foreground">
                            {language === 'ar' ? course.nameAr : course.nameEn}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {language === 'ar' ? course.doctorAr : course.doctorEn}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {course.classroom}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {language === 'ar' ? course.scheduleAr : course.scheduleEn}
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {course.creditHours} {t('ساعات', 'credits')}
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course.id)}>
                            <FileText className="h-4 w-4 me-2" />
                            {t('الملفات', 'Files')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{course.code} - {language === 'ar' ? course.nameAr : course.nameEn}</DialogTitle>
                            <DialogDescription>{t('الملفات والمحتوى التعليمي', 'Files and course materials')}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 mt-4">
                            {files.filter(f => f.courseId === course.id).map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {getFileIcon(file.type)}
                                  <div>
                                    <p className="font-medium">{language === 'ar' ? file.titleAr : file.titleEn}</p>
                                    <p className="text-xs text-muted-foreground">{file.fileSize} • {file.uploadDate}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {files.filter(f => f.courseId === course.id).length === 0 && (
                              <p className="text-center text-muted-foreground py-8">{t('لا توجد ملفات حالياً', 'No files available')}</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* All Files */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-5 w-5 text-secondary" />
                    {t('جميع الملفات', 'All Files')}
                  </CardTitle>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('اختر المقرر', 'Select Course')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع المقررات', 'All Courses')}</SelectItem>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium">{language === 'ar' ? file.titleAr : file.titleEn}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{file.courseCode}</Badge>
                            <span>{file.fileSize}</span>
                            <span>{file.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 me-2" />
                        {t('تحميل', 'Download')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  {t('جدول الحصص الأسبوعي', 'Weekly Schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {days.map((day) => {
                      const daySchedule = schedule.filter(s =>
                        language === 'ar' ? s.dayAr === day.ar : s.dayEn === day.en
                      );

                      if (daySchedule.length === 0) return null;

                      return (
                        <div key={day.en} className="mb-6">
                          <h3 className="font-bold text-lg mb-3 text-secondary">
                            {language === 'ar' ? day.ar : day.en}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {daySchedule.map((item) => (
                              <Card
                                key={item.id}
                                className={`p-4 border-s-4 ${item.type === 'lecture' ? 'border-s-secondary' :
                                  item.type === 'lab' ? 'border-s-purple-500' : 'border-s-blue-500'
                                  }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <Badge variant="outline" className="mb-2 font-mono">{item.courseCode}</Badge>
                                    <h4 className="font-medium">
                                      {language === 'ar' ? item.courseNameAr : item.courseNameEn}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {language === 'ar' ? item.doctorAr : item.doctorEn}
                                    </p>
                                  </div>
                                  <div className="text-end">
                                    <p className="font-mono text-sm">{item.time}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {item.classroom}
                                    </p>
                                    <Badge
                                      variant="secondary"
                                      className={`mt-2 text-xs ${item.type === 'lecture' ? 'bg-secondary/20' :
                                        item.type === 'lab' ? 'bg-purple-500/20 text-purple-600' : 'bg-blue-500/20 text-blue-600'
                                        }`}
                                    >
                                      {item.type === 'lecture' ? t('محاضرة', 'Lecture') :
                                        item.type === 'lab' ? t('معمل', 'Lab') : t('تمارين', 'Tutorial')}
                                    </Badge>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="animate-fade-in space-y-6">
            {/* GPA Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-secondary/20">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('المعدل التراكمي', 'Cumulative GPA')}</p>
                    <p className="text-2xl font-bold text-secondary">{profile?.gpa.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('ناجح', 'Passed')}</p>
                    <p className="text-2xl font-bold text-green-600">{grades.filter(g => g.status === 'pass').length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <Timer className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('قيد الدراسة', 'In Progress')}</p>
                    <p className="text-2xl font-bold text-blue-600">{grades.filter(g => g.status === 'in_progress').length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-muted">
                    <GraduationCap className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('إجمالي الساعات', 'Total Credits')}</p>
                    <p className="text-2xl font-bold">{profile?.completedCredits}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-secondary" />
                    {t('كشف الدرجات', 'Grade Report')}
                  </CardTitle>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('اختر الفصل', 'Select Semester')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الفصول', 'All Semesters')}</SelectItem>
                      {semesters.map(sem => (
                        <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-start">{t('المقرر', 'Course')}</th>
                        <th className="p-3 text-center">{t('الساعات', 'Credits')}</th>
                        <th className="p-3 text-center">{t('الحضور', 'Attend.')}</th>
                        <th className="p-3 text-center">{t('أعمال السنة', 'Coursework')}</th>
                        <th className="p-3 text-center">{t('النصفي', 'Midterm')}</th>
                        <th className="p-3 text-center">{t('النهائي', 'Final')}</th>
                        <th className="p-3 text-center">{t('المجموع', 'Total')}</th>
                        <th className="p-3 text-center">{t('التقدير', 'Grade')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.map((grade) => (
                        <tr key={grade.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div>
                              <Badge variant="outline" className="font-mono text-xs mb-1">{grade.courseCode}</Badge>
                              <p className="font-medium">{language === 'ar' ? grade.courseNameAr : grade.courseNameEn}</p>
                              <p className="text-xs text-muted-foreground">{language === 'ar' ? grade.semesterAr : grade.semesterEn}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center">{grade.creditHours}</td>
                          <td className="p-3 text-center">{grade.attendance}%</td>
                          <td className="p-3 text-center">{grade.coursework}/30</td>
                          <td className="p-3 text-center">{grade.midterm}/30</td>
                          <td className="p-3 text-center">{grade.status === 'in_progress' ? '-' : `${grade.final}/50`}</td>
                          <td className="p-3 text-center font-bold">{grade.status === 'in_progress' ? grade.total : grade.total}/100</td>
                          <td className="p-3 text-center">
                            {grade.status === 'in_progress' ? (
                              <Badge variant="secondary">{t('قيد الدراسة', 'In Progress')}</Badge>
                            ) : (
                              <span className={`font-bold text-lg ${getGradeColor(grade.grade)}`}>{grade.grade}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="animate-fade-in space-y-6">
            {/* Finance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-secondary/20">
                    <Wallet className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('إجمالي الرسوم', 'Total Fees')}</p>
                    <p className="text-xl font-bold">{formatCurrency(finance?.totalFees || 0)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-green-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('المدفوع', 'Paid')}</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(finance?.totalPaid || 0)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('المتبقي', 'Remaining')}</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(finance?.totalRemaining || 0)}</p>
                  </div>
                </div>
              </Card>
              {finance?.discountAmount && finance.discountAmount > 0 && (
                <Card className="p-4 bg-purple-500/5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('الخصم', 'Discount')}</p>
                      <p className="text-xl font-bold text-purple-600">{formatCurrency(finance.discountAmount)}</p>
                      <p className="text-xs text-muted-foreground">{finance.discountType}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Payment Progress */}
            <Card>
              <CardHeader>
                <CardTitle>{t('نسبة السداد', 'Payment Progress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('المدفوع', 'Paid')}: {formatCurrency(finance?.totalPaid || 0)}</span>
                    <span>{Math.round((finance?.totalPaid || 0) / (finance?.totalFees || 1) * 100)}%</span>
                  </div>
                  <Progress value={(finance?.totalPaid || 0) / (finance?.totalFees || 1) * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Installments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  {t('الأقساط', 'Installments')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {finance?.installments.map((installment) => (
                    <div key={installment.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className={`p-3 rounded-full ${installment.status === 'paid' ? 'bg-green-500/20' :
                          installment.status === 'overdue' ? 'bg-red-500/20' :
                            installment.status === 'partial' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                          }`}>
                          {installment.status === 'paid' ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                            installment.status === 'overdue' ? <AlertCircle className="h-5 w-5 text-red-500" /> :
                              <Timer className="h-5 w-5 text-yellow-500" />}
                        </div>
                        <div>
                          <p className="font-bold">{t('القسط', 'Installment')} #{installment.installmentNumber}</p>
                          <p className="text-sm text-muted-foreground">{t('تاريخ الاستحقاق:', 'Due:')} {installment.dueDate}</p>
                          {installment.paidDate && (
                            <p className="text-sm text-green-600">{t('تاريخ الدفع:', 'Paid:')} {installment.paidDate}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">{t('المبلغ', 'Amount')}</p>
                          <p className="font-bold">{formatCurrency(installment.amountTotal)}</p>
                        </div>
                        {installment.status === 'partial' && (
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">{t('المتبقي', 'Remaining')}</p>
                            <p className="font-bold text-red-600">{formatCurrency(installment.amountRemaining)}</p>
                          </div>
                        )}
                        {getStatusBadge(installment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  {t('سجل المدفوعات', 'Payment History')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-start">{t('رقم الإيصال', 'Receipt No.')}</th>
                        <th className="p-3 text-start">{t('الوصف', 'Description')}</th>
                        <th className="p-3 text-center">{t('التاريخ', 'Date')}</th>
                        <th className="p-3 text-center">{t('طريقة الدفع', 'Method')}</th>
                        <th className="p-3 text-end">{t('المبلغ', 'Amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finance?.payments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-mono text-sm">{payment.receiptNumber}</td>
                          <td className="p-3">{language === 'ar' ? payment.descriptionAr : payment.descriptionEn}</td>
                          <td className="p-3 text-center">{payment.date}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline">{language === 'ar' ? payment.methodAr : payment.methodEn}</Badge>
                          </td>
                          <td className="p-3 text-end font-bold text-green-600">{formatCurrency(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admission Requests Tab */}
          <TabsContent value="admission" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  {t('طلبات القبول الخاصة بي', 'My Admission Requests')}
                </CardTitle>
                <CardDescription>
                  {t('يمكنك متابعة حالة طلبك المرسل من صفحة القبول', 'Track the status of your submitted admission request')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {admissionRequests.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                    {t('لا توجد طلبات قبول مرتبطة بهذا الحساب', 'No admission requests are linked to this account')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {admissionRequests.map((request) => (
                      <div key={request.id} className="rounded-xl border p-4">
                        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold">{request.fullName || '-'}</p>
                            <p className="text-xs text-muted-foreground">{request.id}</p>
                          </div>
                          {getAdmissionStatusBadge(request.status)}
                        </div>
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                          <div>
                            <p className="text-muted-foreground">{t('التخصص', 'Specialty')}</p>
                            <p className="font-medium">{request.specialty || '-'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t('تاريخ الإرسال', 'Submitted At')}</p>
                            <p className="font-medium">{request.createdAt || '-'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t('البريد الإلكتروني', 'Email')}</p>
                            <p className="font-medium">{request.email || '-'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">{t('رقم الهاتف', 'Phone')}</p>
                            <p className="font-medium">{request.phone || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="animate-fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Conversations List */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    {t('المحادثات', 'Conversations')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p className="text-sm">{t('لا توجد محادثات', 'No conversations')}</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${currentConversation?.id === conv.id ? 'bg-secondary/10 border-s-4 border-secondary' : ''
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-gold flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 text-secondary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{conv.doctorName}</p>
                              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || t('لا توجد رسائل', 'No messages')}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white">{conv.unreadCount}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(conv.lastMessageDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => router.push('/faculty')}>
                      {t('محادثة جديدة', 'New Conversation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    {currentConversation
                      ? currentConversation.doctorName
                      : t('اختر محادثة', 'Select a conversation')
                    }
                  </CardTitle>
                  {currentConversation && (
                    <CardDescription>{currentConversation.doctorEmail}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {currentConversation ? (
                    <div className="space-y-4">
                      {/* Messages List */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 bg-muted/30 rounded-lg">
                        {conversationMessages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t('لا توجد رسائل بعد، ابدأ المحادثة الآن', 'No messages yet, start the conversation')}</p>
                          </div>
                        ) : (
                          conversationMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg max-w-[80%] ${msg.senderType === 'student'
                                ? 'bg-secondary/20 ms-auto text-end'
                                : 'bg-background me-auto border'
                                }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Send Message */}
                      <div className="flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t('اكتب رسالتك هنا...', 'Write your message here...')}
                          className="flex-1 min-h-[80px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="self-end"
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg font-semibold text-foreground mb-2">
                        {t('اختر محادثة من القائمة', 'Select a conversation from the list')}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        {t('أو ابدأ محادثة جديدة مع أحد الدكاترة', 'Or start a new conversation with a faculty member')}
                      </p>
                      <Button variant="outline" onClick={() => router.push('/faculty')}>
                        {t('تصفح هيئة التدريس', 'Browse Faculty')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/')} className="px-8">
            {t('العودة للصفحة الرئيسية', 'Back to Home')}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
