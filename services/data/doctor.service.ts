import type {
  CourseMaterial,
  DoctorFinance,
  DoctorMessage,
  DoctorNotification,
  DoctorProfile,
  DoctorScheduleItem,
  DoctorStudent,
  PaymentRecord,
  TeachingCourse,
} from '@/types'
import {
  normalizeArray,
  normalizeIsoDate,
  normalizeNumber,
  normalizeString,
  portalRequest,
} from '@/services/data/portal-api'

export interface DoctorAnnouncement {
  id: string
  courseId: string
  textAr: string
  textEn: string
  createdAt: string
  createdBy: string
}

function mapDoctorProfile(item: any): DoctorProfile {
  return {
    id: normalizeString(item?.id),
    nameAr: normalizeString(item?.nameAr),
    nameEn: normalizeString(item?.nameEn || item?.nameAr),
    degreeAr: normalizeString(item?.degreeAr),
    degreeEn: normalizeString(item?.degreeEn || item?.degreeAr),
    specializationAr: normalizeString(item?.specializationAr),
    specializationEn: normalizeString(item?.specializationEn || item?.specializationAr),
    collegeAr: normalizeString(item?.collegeAr),
    collegeEn: normalizeString(item?.collegeEn || item?.collegeAr),
    departmentAr: normalizeString(item?.departmentAr),
    departmentEn: normalizeString(item?.departmentEn || item?.departmentAr),
    email: normalizeString(item?.email),
    phone: normalizeString(item?.phone),
    officeHoursAr: normalizeString(item?.officeHoursAr),
    officeHoursEn: normalizeString(item?.officeHoursEn || item?.officeHoursAr),
    bioAr: normalizeString(item?.bioAr),
    bioEn: normalizeString(item?.bioEn || item?.bioAr),
    image: normalizeString(item?.image),
  }
}

function mapTeachingCourse(item: any): TeachingCourse {
  return {
    id: normalizeString(item?.id || item?.code),
    code: normalizeString(item?.code || item?.id),
    nameAr: normalizeString(item?.nameAr),
    nameEn: normalizeString(item?.nameEn || item?.nameAr),
    creditHours: normalizeNumber(item?.creditHours),
    semester: normalizeString(item?.semester),
    studentsCount: normalizeNumber(item?.studentsCount),
    scheduleAr: normalizeString(item?.scheduleAr),
    scheduleEn: normalizeString(item?.scheduleEn || item?.scheduleAr),
    classroom: normalizeString(item?.classroom),
  }
}

function mapDoctorStudent(item: any): DoctorStudent {
  return {
    id: normalizeString(item?.id),
    nameAr: normalizeString(item?.nameAr),
    nameEn: normalizeString(item?.nameEn || item?.nameAr),
    academicNumber: normalizeString(item?.academicNumber),
    courseId: normalizeString(item?.courseId),
    courseCode: normalizeString(item?.courseCode || item?.courseId),
    attendance: normalizeNumber(item?.attendance),
    midterm: normalizeNumber(item?.midterm),
    final: normalizeNumber(item?.final),
    total: normalizeNumber(item?.total),
  }
}

function mapDoctorScheduleItem(item: any): DoctorScheduleItem {
  const rawType = normalizeString(item?.type)
  const type: DoctorScheduleItem['type'] =
    rawType === 'lab' ? 'lab' : rawType === 'office' ? 'office' : 'lecture'

  return {
    id: normalizeString(item?.id),
    dayAr: normalizeString(item?.dayAr),
    dayEn: normalizeString(item?.dayEn || item?.dayAr),
    time: normalizeString(item?.time),
    courseCode: normalizeString(item?.courseCode),
    courseNameAr: normalizeString(item?.courseNameAr),
    courseNameEn: normalizeString(item?.courseNameEn || item?.courseNameAr),
    classroom: normalizeString(item?.classroom),
    type,
  }
}

function mapPaymentRecord(item: any): PaymentRecord {
  const rawStatus = normalizeString(item?.status)
  const status: PaymentRecord['status'] =
    rawStatus === 'pending' ? 'pending' : rawStatus === 'delayed' ? 'delayed' : 'paid'

  return {
    id: normalizeString(item?.id),
    monthAr: normalizeString(item?.monthAr),
    monthEn: normalizeString(item?.monthEn || item?.monthAr),
    baseSalary: normalizeNumber(item?.baseSalary),
    allowances: normalizeNumber(item?.allowances),
    deductions: normalizeNumber(item?.deductions),
    netSalary: normalizeNumber(item?.netSalary),
    status,
    paidDate: normalizeIsoDate(item?.paidDate),
  }
}

function mapDoctorFinance(item: any): DoctorFinance {
  return {
    baseSalary: normalizeNumber(item?.baseSalary),
    allowances: {
      housingAr: normalizeString(item?.allowances?.housingAr),
      housingEn: normalizeString(item?.allowances?.housingEn || item?.allowances?.housingAr),
      housingAmount: normalizeNumber(item?.allowances?.housingAmount),
      transportAr: normalizeString(item?.allowances?.transportAr),
      transportEn: normalizeString(item?.allowances?.transportEn || item?.allowances?.transportAr),
      transportAmount: normalizeNumber(item?.allowances?.transportAmount),
      otherAr: normalizeString(item?.allowances?.otherAr),
      otherEn: normalizeString(item?.allowances?.otherEn || item?.allowances?.otherAr),
      otherAmount: normalizeNumber(item?.allowances?.otherAmount),
      total: normalizeNumber(item?.allowances?.total),
    },
    deductions: {
      taxAr: normalizeString(item?.deductions?.taxAr),
      taxEn: normalizeString(item?.deductions?.taxEn || item?.deductions?.taxAr),
      taxAmount: normalizeNumber(item?.deductions?.taxAmount),
      insuranceAr: normalizeString(item?.deductions?.insuranceAr),
      insuranceEn: normalizeString(item?.deductions?.insuranceEn || item?.deductions?.insuranceAr),
      insuranceAmount: normalizeNumber(item?.deductions?.insuranceAmount),
      otherAr: normalizeString(item?.deductions?.otherAr),
      otherEn: normalizeString(item?.deductions?.otherEn || item?.deductions?.otherAr),
      otherAmount: normalizeNumber(item?.deductions?.otherAmount),
      total: normalizeNumber(item?.deductions?.total),
    },
    netSalary: normalizeNumber(item?.netSalary),
    paymentHistory: normalizeArray(item?.paymentHistory).map(mapPaymentRecord),
  }
}

function mapDoctorNotification(item: any): DoctorNotification {
  const rawType = normalizeString(item?.type)
  const type: DoctorNotification['type'] =
    rawType === 'announcement'
      ? 'announcement'
      : rawType === 'reminder'
        ? 'reminder'
        : rawType === 'alert'
          ? 'alert'
          : 'system'

  const rawSenderType = normalizeString(item?.senderType)
  const senderType: DoctorNotification['senderType'] = rawSenderType === 'admin' ? 'admin' : 'system'

  return {
    id: normalizeString(item?.id),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn || item?.titleAr),
    messageAr: normalizeString(item?.messageAr),
    messageEn: normalizeString(item?.messageEn || item?.messageAr),
    type,
    senderAr: normalizeString(item?.senderAr || item?.createdBy),
    senderEn: normalizeString(item?.senderEn || item?.senderAr || item?.createdBy),
    senderType,
    date: normalizeIsoDate(item?.date),
    isRead: Boolean(item?.isRead),
  }
}

function mapDoctorMessage(item: any): DoctorMessage {
  return {
    id: normalizeString(item?.id),
    studentId: normalizeString(item?.studentId),
    studentNameAr: normalizeString(item?.studentNameAr),
    studentNameEn: normalizeString(item?.studentNameEn || item?.studentNameAr),
    studentAcademicNumber: normalizeString(item?.studentAcademicNumber),
    subjectAr: normalizeString(item?.subjectAr),
    subjectEn: normalizeString(item?.subjectEn || item?.subjectAr),
    messageAr: normalizeString(item?.messageAr),
    messageEn: normalizeString(item?.messageEn || item?.messageAr),
    date: normalizeIsoDate(item?.date),
    isRead: Boolean(item?.isRead),
    courseCode: normalizeString(item?.courseCode),
  }
}

function mapCourseMaterial(item: any): CourseMaterial {
  const rawType = normalizeString(item?.type)
  const type: CourseMaterial['type'] =
    rawType === 'lecture' || rawType === 'assignment' || rawType === 'video' ? rawType : 'resource'

  return {
    id: normalizeString(item?.id),
    courseId: normalizeString(item?.courseId),
    titleAr: normalizeString(item?.titleAr),
    titleEn: normalizeString(item?.titleEn || item?.titleAr),
    descriptionAr: normalizeString(item?.descriptionAr),
    descriptionEn: normalizeString(item?.descriptionEn || item?.descriptionAr),
    type,
    fileName: normalizeString(item?.fileName),
    fileSize: normalizeString(item?.fileSize),
    uploadDate: normalizeIsoDate(item?.uploadDate),
    downloadCount: normalizeNumber(item?.downloadCount),
  }
}

function mapDoctorAnnouncement(item: any): DoctorAnnouncement {
  return {
    id: normalizeString(item?.id),
    courseId: normalizeString(item?.courseId),
    textAr: normalizeString(item?.textAr),
    textEn: normalizeString(item?.textEn || item?.textAr),
    createdAt: normalizeIsoDate(item?.createdAt),
    createdBy: normalizeString(item?.createdBy),
  }
}

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
  try {
    const payload = await portalRequest('/api/doctor/profile')
    return mapDoctorProfile(payload)
  } catch {
    return mapDoctorProfile({})
  }
}

export const getTeachingCourses = async (): Promise<TeachingCourse[]> => {
  try {
    const payload = await portalRequest('/api/doctor/courses')
    return normalizeArray(payload).map(mapTeachingCourse)
  } catch {
    return []
  }
}

export const getDoctorStudents = async (courseId?: string): Promise<DoctorStudent[]> => {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''
  try {
    const payload = await portalRequest(`/api/doctor/students${query}`)
    return normalizeArray(payload).map(mapDoctorStudent)
  } catch {
    return []
  }
}

export const getDoctorSchedule = async (): Promise<DoctorScheduleItem[]> => {
  try {
    const payload = await portalRequest('/api/doctor/schedule')
    return normalizeArray(payload).map(mapDoctorScheduleItem)
  } catch {
    return []
  }
}

export const getDoctorFinance = async (): Promise<DoctorFinance> => {
  try {
    const payload = await portalRequest('/api/doctor/finance')
    return mapDoctorFinance(payload)
  } catch {
    return mapDoctorFinance({})
  }
}

export const updateStudentGrades = async (
  studentId: string,
  grades: { courseId: string; midterm?: number; final?: number; coursework?: number; total?: number },
): Promise<DoctorStudent> => {
  await portalRequest(`/api/doctor/students/${encodeURIComponent(studentId)}/grades`, {
    method: 'PUT',
    body: JSON.stringify(grades),
  })

  return {
    id: normalizeString(studentId),
    nameAr: '',
    nameEn: '',
    academicNumber: '',
    courseId: normalizeString(grades.courseId),
    courseCode: normalizeString(grades.courseId),
    attendance: 0,
    midterm: normalizeNumber(grades.midterm),
    final: normalizeNumber(grades.final),
    total: normalizeNumber(grades.total ?? normalizeNumber(grades.midterm) + normalizeNumber(grades.final) + normalizeNumber(grades.coursework)),
  }
}

export const getDoctorNotifications = async (): Promise<DoctorNotification[]> => {
  try {
    const payload = await portalRequest('/api/doctor/notifications')
    return normalizeArray(payload).map(mapDoctorNotification)
  } catch {
    return []
  }
}

export const getDoctorMessages = async (): Promise<DoctorMessage[]> => {
  try {
    const payload = await portalRequest('/api/doctor/messages')
    return normalizeArray(payload).map(mapDoctorMessage)
  } catch {
    return []
  }
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await portalRequest(`/api/doctor/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
  })
}

export const markMessageAsRead = async (id: string): Promise<void> => {
  await portalRequest(`/api/doctor/messages/${encodeURIComponent(id)}/read`, {
    method: 'PUT',
  })
}

export const getCourseMaterials = async (courseId?: string): Promise<CourseMaterial[]> => {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''
  try {
    const payload = await portalRequest(`/api/doctor/materials${query}`)
    return normalizeArray(payload).map(mapCourseMaterial)
  } catch {
    return []
  }
}

export const uploadCourseMaterial = async (
  file: File,
  courseId?: string,
): Promise<CourseMaterial> => {
  const formData = new FormData()
  formData.append('file', file)
  if (courseId) {
    formData.append('courseId', courseId)
  }

  const payload = await portalRequest('/api/doctor/materials', {
    method: 'POST',
    body: formData,
  })
  return mapCourseMaterial(payload)
}

export const deleteCourseMaterial = async (id: string): Promise<void> => {
  await portalRequest(`/api/doctor/materials/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export const getCourseAnnouncements = async (courseId?: string): Promise<DoctorAnnouncement[]> => {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''
  try {
    const payload = await portalRequest(`/api/doctor/announcements${query}`)
    return normalizeArray(payload).map(mapDoctorAnnouncement)
  } catch {
    return []
  }
}

export const createCourseAnnouncement = async (
  courseId: string,
  text: string,
): Promise<DoctorAnnouncement> => {
  const payload = await portalRequest('/api/doctor/announcements', {
    method: 'POST',
    body: JSON.stringify({ courseId, text }),
  })
  return mapDoctorAnnouncement(payload)
}

export const deleteCourseAnnouncement = async (id: string): Promise<void> => {
  await portalRequest(`/api/doctor/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export const updateDoctorProfile = async (updates: Partial<DoctorProfile>): Promise<DoctorProfile> => {
  const payload = await portalRequest('/api/doctor/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return mapDoctorProfile(payload)
}

export const uploadDoctorProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const payload = await portalRequest<{ fileUrl?: string }>('/api/doctor/profile/image', {
    method: 'POST',
    body: formData,
  })
  return normalizeString(payload?.fileUrl)
}
