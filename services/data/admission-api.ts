'use client'

import { normalizeArray, normalizeString, portalRequest } from './portal-api'

export type AdmissionStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export type AdmissionDocumentUpload = {
  name: string
  content: string
  mimeType?: string
}

export type CreateAdmissionRequestPayload = {
  fullName: string
  email: string
  phone: string
  specialty: string
  collegeId?: string
  collegeName?: string
  programId?: string
  programName?: string
  educationStatus?: 'graduate' | 'student'
  hasRequiredDocuments?: boolean
  highSchoolDocumentName?: string
  idDocumentName?: string
  personalPhotoName?: string
  serialNumber?: string
  type?: 'student' | 'employee'
  status?: AdmissionStatus
  title?: string
  message?: string
  documents?: {
    highSchool?: AdmissionDocumentUpload
    id?: AdmissionDocumentUpload
    photo?: AdmissionDocumentUpload
  }
}

export type AdmissionRequestItem = {
  id: string
  fullName: string
  email: string
  phone: string
  specialty: string
  collegeId: string
  collegeName: string
  programId: string
  programName: string
  educationStatus: string
  hasRequiredDocuments: boolean
  highSchoolDocumentName: string
  idDocumentName: string
  personalPhotoName: string
  serialNumber: string
  type: string
  status: AdmissionStatus
  message: string
  createdAt: string
}

function normalizeAdmissionRequest(item: any): AdmissionRequestItem {
  return {
    id: normalizeString(item?.id || item?.docname),
    fullName: normalizeString(item?.fullName || item?.full_name),
    email: normalizeString(item?.email),
    phone: normalizeString(item?.phone),
    specialty: normalizeString(item?.specialty),
    collegeId: normalizeString(item?.collegeId || item?.college_id),
    collegeName: normalizeString(item?.collegeName || item?.college_name),
    programId: normalizeString(item?.programId || item?.program_id),
    programName: normalizeString(item?.programName || item?.program_name),
    educationStatus: normalizeString(item?.educationStatus || item?.education_status),
    hasRequiredDocuments: Boolean(item?.hasRequiredDocuments ?? item?.has_required_documents),
    highSchoolDocumentName: normalizeString(item?.highSchoolDocumentName || item?.high_school_document_name),
    idDocumentName: normalizeString(item?.idDocumentName || item?.id_document_name),
    personalPhotoName: normalizeString(item?.personalPhotoName || item?.personal_photo_name),
    serialNumber: normalizeString(item?.serialNumber || item?.serial_number),
    type: normalizeString(item?.type || 'student'),
    status: (normalizeString(item?.status || 'pending') as AdmissionStatus),
    message: normalizeString(item?.message || item?.content),
    createdAt: normalizeString(item?.createdAt || item?.created_at),
  }
}

export async function createAdmissionRequest(payload: CreateAdmissionRequestPayload) {
  const body = {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    specialty: payload.specialty,
    collegeId: payload.collegeId || '',
    collegeName: payload.collegeName || '',
    programId: payload.programId || '',
    programName: payload.programName || '',
    educationStatus: payload.educationStatus || 'graduate',
    hasRequiredDocuments: payload.hasRequiredDocuments ? 1 : 0,
    highSchoolDocumentName: payload.highSchoolDocumentName || '',
    idDocumentName: payload.idDocumentName || '',
    personalPhotoName: payload.personalPhotoName || '',
    serialNumber: payload.serialNumber || '',
    type: payload.type || 'student',
    documents: payload.documents || undefined,
  }
  const result = await portalRequest<any>('/api/join-requests', {
    method: 'POST',
    credentials: 'omit',
    body: JSON.stringify(body),
  })
  return normalizeAdmissionRequest(result)
}

export async function listAdmissionRequests() {
  const payload = await portalRequest<any[]>('/api/join-requests')
  return normalizeArray(payload).map(normalizeAdmissionRequest)
}

export async function updateAdmissionRequestStatus(id: string, status: AdmissionStatus) {
  const payload = await portalRequest<any>(`/api/join-requests/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  return normalizeAdmissionRequest(payload)
}
