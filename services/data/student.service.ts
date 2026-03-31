import {
  normalizeArray,
  normalizeIsoDate,
  normalizeNumber,
  normalizeString,
  portalRequest,
} from '@/services/data/portal-api'

export interface StudentProfile {
  id: string
  academicNumber: string
  nameAr: string
  nameEn: string
  emailPersonal: string
  emailUniversity: string
  phone: string
  collegeAr: string
  collegeEn: string
  departmentAr: string
  departmentEn: string
  specializationAr: string
  specializationEn: string
  levelAr: string
  levelEn: string
  status: 'active' | 'suspended' | 'graduated'
  gpa: number
  totalCredits: number
  completedCredits: number
  admissionDate: string
  expectedGraduation: string
  advisorAr: string
  advisorEn: string
  image?: string
}

export interface StudentCourse {
  id: string
  code: string
  nameAr: string
  nameEn: string
  creditHours: number
  doctorAr: string
  doctorEn: string
  classroom: string
  scheduleAr: string
  scheduleEn: string
  semester: string
  status: 'current' | 'completed' | 'upcoming'
}

export interface CourseFile {
  id: string
  courseId: string
  courseCode: string
  titleAr: string
  titleEn: string
  descriptionAr?: string
  descriptionEn?: string
  type: 'lecture' | 'assignment' | 'resource' | 'video' | 'exam'
  fileName: string
  fileSize: string
  uploadDate: string
  downloadCount: number
  fileUrl?: string
}

export interface StudentScheduleItem {
  id: string
  dayAr: string
  dayEn: string
  time: string
  courseCode: string
  courseNameAr: string
  courseNameEn: string
  doctorAr: string
  doctorEn: string
  classroom: string
  type: 'lecture' | 'lab' | 'tutorial'
}

export interface StudentGrade {
  id: string
  courseId: string
  courseCode: string
  courseNameAr: string
  courseNameEn: string
  creditHours: number
  semester: string
  semesterAr: string
  semesterEn: string
  attendance: number
  coursework: number
  midterm: number
  final: number
  total: number
  grade: string
  points: number
  status: 'pass' | 'fail' | 'in_progress'
}

export interface StudentInstallment {
  id: string
  installmentNumber: number
  amountTotal: number
  amountPaid: number
  amountRemaining: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue' | 'partial'
  semester: string
}

export interface StudentPayment {
  id: string
  receiptNumber: string
  amount: number
  date: string
  method: 'cash' | 'bank_transfer' | 'card' | 'check'
  methodAr: string
  methodEn: string
  descriptionAr: string
  descriptionEn: string
  installmentId?: string
}

export interface StudentFinance {
  totalFees: number
  totalPaid: number
  totalRemaining: number
  discountAmount: number
  discountType?: string
  installments: StudentInstallment[]
  payments: StudentPayment[]
}

export interface StudentNotification {
  id: string
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  type: 'announcement' | 'grade' | 'payment' | 'course' | 'system'
  date: string
  isRead: boolean
}

export interface StudentAdmissionRequest {
  id: string
  requestName: string
  fullName: string
  email: string
  phone: string
  specialty: string
  type: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  message: string
  createdAt: string
}

function mapStudentProfile(item: any): StudentProfile {
  const status = normalizeString(item?.status) as StudentProfile['status']

  return {
    id: normalizeString(item?.id),
    academicNumber: normalizeString(item?.academicNumber),
    nameAr: normalizeString(item?.nameAr),
    nameEn: normalizeString(item?.nameEn || item?.nameAr),
    emailPersonal: normalizeString(item?.emailPersonal),
    emailUniversity: normalizeString(item?.emailUniversity),
    phone: normalizeString(item?.phone),
    collegeAr: normalizeString(item?.collegeAr),
    collegeEn: normalizeString(item?.collegeEn || item?.collegeAr),
    departmentAr: normalizeString(item?.departmentAr),
    departmentEn: normalizeString(item?.departmentEn || item?.departmentAr),
    specializationAr: normalizeString(item?.specializationAr),
    specializationEn: normalizeString(item?.specializationEn || item?.specializationAr),
    levelAr: normalizeString(item?.levelAr),
    levelEn: normalizeString(item?.levelEn || item?.levelAr),
    status: status || 'active',
    gpa: normalizeNumber(item?.gpa),
    totalCredits: normalizeNumber(item?.totalCredits),
    completedCredits: normalizeNumber(item?.completedCredits),
    admissionDate: normalizeIsoDate(item?.admissionDate),
    expectedGraduation: normalizeIsoDate(item?.expectedGraduation),
    advisorAr: normalizeString(item?.advisorAr),
    advisorEn: normalizeString(item?.advisorEn || item?.advisorAr),
    image: normalizeString(item?.image),
  }
}

function mapStudentCourse(item: any): StudentCourse {
  return {
    id: normalizeString(item?.id || item?.code),
    code: normalizeString(item?.code || item?.id),
    nameAr: normalizeString(item?.nameAr),
    nameEn: normalizeString(item?.nameEn || item?.nameAr),
    creditHours: normalizeNumber(item?.creditHours),
    doctorAr: normalizeString(item?.doctorAr),
    doctorEn: normalizeString(item?.doctorEn || item?.doctorAr),
    classroom: normalizeString(item?.classroom),
    scheduleAr: normalizeString(item?.scheduleAr),
    scheduleEn: normalizeString(item?.scheduleEn || item?.scheduleAr),
    semester: normalizeString(item?.semester),
    status: (normalizeString(item?.status) as StudentCourse['status']) || 'current',
  }
}

function mapCourseFile(item: any): CourseFile {
  const type = normalizeString(item?.type) as CourseFile['type']
  return {
    id: normalizeString(item?.id),
    courseId: normalizeString(item?.courseId),
    courseCode: normalizeString(item?.courseCode || item?.courseId),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn || item?.titleAr),
    descriptionAr: normalizeString(item?.descriptionAr),
    descriptionEn: normalizeString(item?.descriptionEn || item?.descriptionAr),
    type: type || 'resource',
    fileName: normalizeString(item?.fileName),
    fileSize: normalizeString(item?.fileSize),
    uploadDate: normalizeIsoDate(item?.uploadDate),
    downloadCount: normalizeNumber(item?.downloadCount),
    fileUrl: normalizeString(item?.fileUrl),
  }
}

function mapStudentScheduleItem(item: any): StudentScheduleItem {
  const type = normalizeString(item?.type) as StudentScheduleItem['type']
  return {
    id: normalizeString(item?.id),
    dayAr: normalizeString(item?.dayAr),
    dayEn: normalizeString(item?.dayEn || item?.dayAr),
    time: normalizeString(item?.time),
    courseCode: normalizeString(item?.courseCode),
    courseNameAr: normalizeString(item?.courseNameAr),
    courseNameEn: normalizeString(item?.courseNameEn || item?.courseNameAr),
    doctorAr: normalizeString(item?.doctorAr),
    doctorEn: normalizeString(item?.doctorEn || item?.doctorAr),
    classroom: normalizeString(item?.classroom),
    type: type || 'lecture',
  }
}

function mapStudentGrade(item: any): StudentGrade {
  const status = normalizeString(item?.status) as StudentGrade['status']
  return {
    id: normalizeString(item?.id),
    courseId: normalizeString(item?.courseId),
    courseCode: normalizeString(item?.courseCode),
    courseNameAr: normalizeString(item?.courseNameAr),
    courseNameEn: normalizeString(item?.courseNameEn || item?.courseNameAr),
    creditHours: normalizeNumber(item?.creditHours),
    semester: normalizeString(item?.semester),
    semesterAr: normalizeString(item?.semesterAr || item?.semester),
    semesterEn: normalizeString(item?.semesterEn || item?.semesterAr || item?.semester),
    attendance: normalizeNumber(item?.attendance),
    coursework: normalizeNumber(item?.coursework),
    midterm: normalizeNumber(item?.midterm),
    final: normalizeNumber(item?.final),
    total: normalizeNumber(item?.total),
    grade: normalizeString(item?.grade),
    points: normalizeNumber(item?.points),
    status: status || 'in_progress',
  }
}

function mapStudentInstallment(item: any): StudentInstallment {
  const status = normalizeString(item?.status) as StudentInstallment['status']
  return {
    id: normalizeString(item?.id),
    installmentNumber: normalizeNumber(item?.installmentNumber),
    amountTotal: normalizeNumber(item?.amountTotal),
    amountPaid: normalizeNumber(item?.amountPaid),
    amountRemaining: normalizeNumber(item?.amountRemaining),
    dueDate: normalizeIsoDate(item?.dueDate),
    paidDate: normalizeIsoDate(item?.paidDate),
    status: status || 'pending',
    semester: normalizeString(item?.semester),
  }
}

function mapStudentPayment(item: any): StudentPayment {
  const method = normalizeString(item?.method) as StudentPayment['method']
  return {
    id: normalizeString(item?.id),
    receiptNumber: normalizeString(item?.receiptNumber),
    amount: normalizeNumber(item?.amount),
    date: normalizeIsoDate(item?.date),
    method: method || 'cash',
    methodAr: normalizeString(item?.methodAr),
    methodEn: normalizeString(item?.methodEn || item?.methodAr),
    descriptionAr: normalizeString(item?.descriptionAr),
    descriptionEn: normalizeString(item?.descriptionEn || item?.descriptionAr),
    installmentId: normalizeString(item?.installmentId),
  }
}

function mapStudentFinance(item: any): StudentFinance {
  return {
    totalFees: normalizeNumber(item?.totalFees),
    totalPaid: normalizeNumber(item?.totalPaid),
    totalRemaining: normalizeNumber(item?.totalRemaining),
    discountAmount: normalizeNumber(item?.discountAmount),
    discountType: normalizeString(item?.discountType),
    installments: normalizeArray(item?.installments).map(mapStudentInstallment),
    payments: normalizeArray(item?.payments).map(mapStudentPayment),
  }
}

function mapStudentNotification(item: any): StudentNotification {
  const type = normalizeString(item?.type) as StudentNotification['type']
  return {
    id: normalizeString(item?.id),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn || item?.titleAr),
    messageAr: normalizeString(item?.messageAr),
    messageEn: normalizeString(item?.messageEn || item?.messageAr),
    type: type || 'system',
    date: normalizeIsoDate(item?.date),
    isRead: Boolean(item?.isRead),
  }
}

function mapStudentAdmissionRequest(item: any): StudentAdmissionRequest {
  return {
    id: normalizeString(item?.id || item?.requestName),
    requestName: normalizeString(item?.requestName),
    fullName: normalizeString(item?.fullName),
    email: normalizeString(item?.email),
    phone: normalizeString(item?.phone),
    specialty: normalizeString(item?.specialty),
    type: normalizeString(item?.type || 'student'),
    status: (normalizeString(item?.status) as StudentAdmissionRequest['status']) || 'pending',
    message: normalizeString(item?.message),
    createdAt: normalizeIsoDate(item?.createdAt),
  }
}

export const getStudentProfile = async (): Promise<StudentProfile> => {
  try {
    const payload = await portalRequest('/api/student/profile')
    return mapStudentProfile(payload)
  } catch {
    return mapStudentProfile({})
  }
}

export const getStudentCourses = async (
  status?: 'current' | 'completed',
): Promise<StudentCourse[]> => {
  try {
    const payload = await portalRequest('/api/student/courses')
    const items = normalizeArray(payload).map(mapStudentCourse)
    return status ? items.filter((item) => item.status === status) : items
  } catch {
    return []
  }
}

export const getCourseFiles = async (courseId?: string): Promise<CourseFile[]> => {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''
  try {
    const payload = await portalRequest(`/api/student/materials${query}`)
    return normalizeArray(payload).map(mapCourseFile)
  } catch {
    return []
  }
}

export const getStudentSchedule = async (): Promise<StudentScheduleItem[]> => {
  try {
    const payload = await portalRequest('/api/student/schedule')
    return normalizeArray(payload).map(mapStudentScheduleItem)
  } catch {
    return []
  }
}

export const getStudentGrades = async (semester?: string): Promise<StudentGrade[]> => {
  const query = semester ? `?semester=${encodeURIComponent(semester)}` : ''
  try {
    const payload = await portalRequest(`/api/student/grades${query}`)
    return normalizeArray(payload).map(mapStudentGrade)
  } catch {
    return []
  }
}

export const getStudentFinance = async (): Promise<StudentFinance> => {
  try {
    const payload = await portalRequest('/api/student/finance')
    return mapStudentFinance(payload)
  } catch {
    return mapStudentFinance({})
  }
}

export const getStudentNotifications = async (): Promise<StudentNotification[]> => {
  try {
    const payload = await portalRequest('/api/student/notifications')
    return normalizeArray(payload).map(mapStudentNotification)
  } catch {
    return []
  }
}

export const getStudentAdmissionRequests = async (): Promise<StudentAdmissionRequest[]> => {
  try {
    const payload = await portalRequest('/api/student/admission-requests')
    return normalizeArray(payload).map(mapStudentAdmissionRequest)
  } catch {
    return []
  }
}

export const markStudentNotificationAsRead = async (id: string): Promise<void> => {
  await portalRequest(`/api/student/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
  })
}

export const updateStudentProfile = async (
  data: Partial<StudentProfile>,
): Promise<StudentProfile> => {
  const payload = await portalRequest('/api/student/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return mapStudentProfile(payload)
}

export const uploadStudentProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const payload = await portalRequest<{ fileUrl?: string }>('/api/student/profile/image', {
    method: 'POST',
    body: formData,
  })
  return normalizeString(payload?.fileUrl)
}
