import { getStudentProfile } from '@/services/data/student.service'
import { normalizeArray, normalizeNumber, normalizeString, portalRequest } from '@/services/data/portal-api'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderType: 'student' | 'doctor'
  senderName: string
  text: string
  createdAt: string
  isRead: boolean
}

export interface Conversation {
  id: string
  studentId: string
  studentName: string
  studentAcademicNumber: string
  doctorId: string
  doctorName: string
  doctorEmail: string
  lastMessage: string
  lastMessageDate: string
  unreadCount: number
}

function mapConversation(item: any): Conversation {
  return {
    id: normalizeString(item?.id),
    studentId: normalizeString(item?.studentId),
    studentName: normalizeString(item?.studentName),
    studentAcademicNumber: normalizeString(item?.studentAcademicNumber),
    doctorId: normalizeString(item?.doctorId),
    doctorName: normalizeString(item?.doctorName),
    doctorEmail: normalizeString(item?.doctorEmail),
    lastMessage: normalizeString(item?.lastMessage),
    lastMessageDate: normalizeString(item?.lastMessageDate),
    unreadCount: normalizeNumber(item?.unreadCount),
  }
}

function mapMessage(item: any): Message {
  const senderType = normalizeString(item?.senderType) as Message['senderType']
  return {
    id: normalizeString(item?.id),
    conversationId: normalizeString(item?.conversationId),
    senderId: normalizeString(item?.senderId),
    senderType: senderType || 'student',
    senderName: normalizeString(item?.senderName),
    text: normalizeString(item?.text),
    createdAt: normalizeString(item?.createdAt),
    isRead: Boolean(item?.isRead),
  }
}

function normalizeConversationId(studentId: string, doctorId: string) {
  return `student::${studentId}::doctor::${doctorId}`
}

function sameIdentity(left: string, right: string) {
  return normalizeString(left).toLowerCase() === normalizeString(right).toLowerCase()
}

export const messagesService = {
  getStudentConversations: async (): Promise<Conversation[]> => {
    try {
      const payload = await portalRequest('/api/messages/conversations?view=student')
      return normalizeArray(payload).map(mapConversation)
    } catch {
      return []
    }
  },

  getDoctorConversations: async (_doctorId: string): Promise<Conversation[]> => {
    try {
      const payload = await portalRequest('/api/messages/conversations?view=doctor')
      return normalizeArray(payload).map(mapConversation)
    } catch {
      return []
    }
  },

  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const payload = await portalRequest(`/api/messages/conversations/${encodeURIComponent(conversationId)}`)
      return normalizeArray(payload).map(mapMessage)
    } catch {
      return []
    }
  },

  sendMessage: async (
    conversationId: string,
    text: string,
    senderType: 'student' | 'doctor',
    senderName: string,
  ): Promise<Message> => {
    const payload = await portalRequest('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        text,
        senderType,
        senderName,
      }),
    })
    return mapMessage(payload)
  },

  getOrCreateConversation: async (
    doctorId: string,
    doctorName: string,
    doctorEmail: string,
  ): Promise<Conversation> => {
    const [profile, conversations] = await Promise.all([
      getStudentProfile(),
      messagesService.getStudentConversations(),
    ])
    const doctorIdentifier = normalizeString(doctorEmail || doctorId)
    const existing = conversations.find(
      (conversation) =>
        sameIdentity(conversation.doctorId, doctorIdentifier) ||
        sameIdentity(conversation.doctorEmail, doctorIdentifier) ||
        sameIdentity(conversation.doctorId, doctorId) ||
        sameIdentity(conversation.doctorEmail, doctorEmail),
    )

    if (existing) {
      return existing
    }

    return {
      id: normalizeConversationId(profile.id, doctorIdentifier),
      studentId: profile.id,
      studentName: profile.nameAr || profile.nameEn,
      studentAcademicNumber: profile.academicNumber,
      doctorId: doctorIdentifier,
      doctorName: normalizeString(doctorName),
      doctorEmail: normalizeString(doctorEmail || doctorId),
      lastMessage: '',
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0,
    }
  },

  getDoctorUnreadCount: async (_doctorId: string): Promise<number> => {
    try {
      const payload = await portalRequest<{ count?: number }>('/api/messages/unread-count')
      return normalizeNumber(payload?.count)
    } catch {
      return 0
    }
  },

  markConversationAsRead: async (
    conversationId: string,
    _userType: 'student' | 'doctor',
  ): Promise<void> => {
    try {
      await portalRequest(`/api/messages/conversations/${encodeURIComponent(conversationId)}/read`, {
        method: 'PUT',
      })
    } catch {
      return
    }
  },
}
