export interface NewsItem {
  id: string;
  slug: string;
  collegeId?: string;
  isGlobal?: boolean;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  contentAr: string;
  contentEn: string;
  image?: string | any;
  date: string;
  views: number;
  tags?: string[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  students: string[];
  progress?: number;
  year?: number;
  status: 'current' | 'completed';
  type?: 'graduation' | 'studio';
  categoryAr?: string;
  categoryEn?: string;
  images?: string[];
  detailsAr?: string;
  detailsEn?: string;
  startDate?: string;
  endDate?: string;
}

export interface CenterItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  services: { ar: string; en: string }[];
  programs: { ar: string; en: string }[];
  image?: string | any;
  location?: string;
  phone?: string;
  email?: string;
}

export interface PartnerItem {
  id: string;
  nameAr: string;
  nameEn: string;
  logo: string | any;
  type: 'local' | 'international';
  website?: string;
}

export interface OfferItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  image?: string | any;
  category: 'academic' | 'scholarship' | 'training' | 'admissions' | 'students' | 'other';
  validUntil?: string;
}

export interface Offer extends OfferItem {
  detailsAr?: string;
  detailsEn?: string;
  targetAudienceAr?: string;
  targetAudienceEn?: string;
  benefitsAr?: string;
  benefitsEn?: string;
  durationAr?: string;
  durationEn?: string;
  locationAr?: string;
  locationEn?: string;
  requirementsAr?: string;
  requirementsEn?: string;
  applyLink?: string;
}

export interface FAQItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  category?: string;
}

export interface SearchResult {
  id: string;
  type: 'news' | 'project' | 'center' | 'offer' | 'event' | 'blog' | 'college';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  link: string;
  image?: string | any;
}

export interface FacultyMember {
  id: string;
  nameAr: string;
  nameEn: string;
  degreeAr: string;
  degreeEn: string;
  specializationAr: string;
  specializationEn: string;
  collegeAr: string;
  collegeEn: string;
  departmentAr?: string;
  departmentEn?: string;
  email?: string;
  phone?: string;
  bioAr?: string;
  bioEn?: string;
  image?: string | any;
}

export interface FacultyMemberDetail extends FacultyMember {
  officeHoursAr?: string;
  officeHoursEn?: string;
  researchInterestsAr?: string[];
  researchInterestsEn?: string[];
  publications?: {
    id: string;
    titleAr: string;
    titleEn: string;
    journal: string;
    year: string;
    link?: string;
  }[];
  courses?: {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    semester: string;
  }[];
  education?: {
    id: string;
    degreeAr: string;
    degreeEn: string;
    institutionAr: string;
    institutionEn: string;
    year: string;
  }[];
  experience?: {
    id: string;
    positionAr: string;
    positionEn: string;
    organizationAr: string;
    organizationEn: string;
    periodAr: string;
    periodEn: string;
  }[];
}

// Academic Program Type
export interface ProgramObjective {
  id: string;
  textAr: string;
  textEn: string;
}

export interface StudyPlanItem {
  id: string;
  yearAr: string;
  yearEn: string;
  semesterAr: string;
  semesterEn: string;
  courses: { nameAr: string; nameEn: string; creditHours: number }[];
}

// Program Faculty Member
export interface ProgramFacultyMember {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  image?: string | any;
  email?: string;
  specializationAr?: string;
  specializationEn?: string;
}

export interface AcademicProgram {
  id: string;
  nameAr: string;
  nameEn: string;
  departmentAr: string;
  departmentEn: string;
  degreeType?: string;
  admissionRate: number;
  highSchoolType: 'علمي' | 'ادبي' | 'علمي + ادبي';
  highSchoolTypeEn: 'Scientific' | 'Literary' | 'Scientific + Literary';
  studyYears: string;
  image?: string | any;
  descriptionAr?: string;
  descriptionEn?: string;
  objectives?: ProgramObjective[];
  studyPlan?: StudyPlanItem[];
  careerProspectsAr?: string[];
  careerProspectsEn?: string[];
  facultyMembers?: ProgramFacultyMember[];
}

// College Type with Departments
export interface CollegeNewsItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  date: string;
  image: string;
  collegeId?: string;
}

export interface College {
  id: string;
  slug: string;
  collegeName?: string;
  nameAr: string;
  nameEn: string;
  deanNameAr?: string;
  deanNameEn?: string;
  descriptionAr: string;
  descriptionEn: string;
  visionAr: string;
  visionEn: string;
  missionAr: string;
  missionEn: string;
  goalsAr?: string;
  goalsEn?: string;
  valuesAr?: string;
  valuesEn?: string;
  qualityAr?: string;
  qualityEn?: string;
  strategyAr?: string;
  strategyEn?: string;
  programs: AcademicProgram[];
  admissionRequirementsAr: string;
  admissionRequirementsEn: string;
  icon?: string | any;
  image?: string | any;
  news?: CollegeNewsItem[];
}

export interface SitePage {
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  heroImage?: string | null;
}

export interface EventItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  contentAr?: string;
  contentEn?: string;
  date: string;
  endDate?: string;
  locationAr: string;
  locationEn: string;
  organizerAr: string;
  organizerEn: string;
  category: 'academic' | 'cultural' | 'sports' | 'social' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationRequired: boolean;
  registrationLink?: string;
  image?: string | any;
}

export interface CampusLifeItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  contentAr: string;
  contentEn: string;
  category: 'facilities' | 'activities' | 'campus';
  image?: string | any;
}

export interface ResearchArticle {
  id: string;
  titleAr: string;
  titleEn: string;
  authorAr: string;
  authorEn: string;
  categoryAr: string;
  categoryEn: string;
  summaryAr: string;
  summaryEn: string;
  contentAr: string;
  contentEn: string;
  publishDateAr: string;
  publishDateEn: string;
  image?: string | any;
  tags: string[];
}

// Doctor Dashboard Types
export interface DoctorProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  degreeAr: string;
  degreeEn: string;
  specializationAr: string;
  specializationEn: string;
  collegeAr: string;
  collegeEn: string;
  departmentAr?: string;
  departmentEn?: string;
  email: string;
  phone: string;
  officeHoursAr: string;
  officeHoursEn: string;
  bioAr?: string;
  bioEn?: string;
  image?: string | any;
}

export interface TeachingCourse {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  creditHours: number;
  semester: string;
  studentsCount: number;
  scheduleAr: string;
  scheduleEn: string;
  classroom: string;
}

export interface DoctorStudent {
  id: string;
  nameAr: string;
  nameEn: string;
  academicNumber: string;
  courseId: string;
  courseCode: string;
  attendance: number;
  midterm?: number;
  final?: number;
  total?: number;
}

export interface DoctorScheduleItem {
  id: string;
  dayAr: string;
  dayEn: string;
  time: string;
  courseCode: string;
  courseNameAr: string;
  courseNameEn: string;
  classroom: string;
  type: 'lecture' | 'lab' | 'office';
}

export interface PaymentRecord {
  id: string;
  monthAr: string;
  monthEn: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending' | 'delayed';
  paidDate?: string;
}

export interface DoctorFinance {
  baseSalary: number;
  allowances: {
    housingAr: string;
    housingEn: string;
    housingAmount: number;
    transportAr: string;
    transportEn: string;
    transportAmount: number;
    otherAr: string;
    otherEn: string;
    otherAmount: number;
    total: number;
  };
  deductions: {
    taxAr: string;
    taxEn: string;
    taxAmount: number;
    insuranceAr: string;
    insuranceEn: string;
    insuranceAmount: number;
    otherAr: string;
    otherEn: string;
    otherAmount: number;
    total: number;
  };
  netSalary: number;
  paymentHistory: PaymentRecord[];
}

// Doctor Notifications & Messages
export interface DoctorNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: 'announcement' | 'reminder' | 'alert' | 'system';
  senderAr: string;
  senderEn: string;
  senderType: 'admin' | 'system';
  date: string;
  isRead: boolean;
}

export interface DoctorMessage {
  id: string;
  studentId: string;
  studentNameAr: string;
  studentNameEn: string;
  studentAcademicNumber: string;
  subjectAr: string;
  subjectEn: string;
  messageAr: string;
  messageEn: string;
  date: string;
  isRead: boolean;
  courseCode?: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: 'lecture' | 'assignment' | 'resource' | 'video';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  downloadCount: number;
}

// User & Role Management Types
export type AppRole = string;

export interface Permission {
  id: string;
  key: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: 'users' | 'content' | 'settings' | 'reports';
}

export interface Role {
  id: string;
  key: AppRole;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string | null;
}

export interface User {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export type TeamMember = {
  id: string;
  nameAr: string;
  nameEn: string;
  positionAr: string;
  positionEn: string;
  email?: string;
  phone?: string;
  bioAr?: string;
  bioEn?: string;
  image?: string | any;
};
