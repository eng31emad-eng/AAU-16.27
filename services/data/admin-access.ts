'use client'

import type { Permission, Role, User } from '@/types'
import { portalRequest } from './portal-api'

type UserInput = {
  nameAr: string
  nameEn: string
  email: string
  phone?: string
  roleId: string
  status?: User['status']
}

type RoleInput = {
  key: string
  nameAr: string
  nameEn: string
  descriptionAr?: string
  descriptionEn?: string
  permissions: string[]
}

function normalizeUser(item: any): User {
  return {
    id: String(item?.id || item?.email || ''),
    nameAr: String(item?.nameAr || item?.nameEn || item?.email || ''),
    nameEn: String(item?.nameEn || item?.nameAr || item?.email || ''),
    email: String(item?.email || ''),
    phone: item?.phone || '',
    avatar: item?.avatar || '',
    roleId: String(item?.roleId || ''),
    status: (item?.status || 'active') as User['status'],
    lastLogin: item?.lastLogin || '',
    createdAt: String(item?.createdAt || ''),
  }
}

function normalizeRole(item: any): Role {
  return {
    id: String(item?.id || item?.key || ''),
    key: String(item?.key || item?.id || ''),
    nameAr: String(item?.nameAr || item?.nameEn || item?.id || ''),
    nameEn: String(item?.nameEn || item?.nameAr || item?.id || ''),
    descriptionAr: String(item?.descriptionAr || item?.nameAr || item?.id || ''),
    descriptionEn: String(item?.descriptionEn || item?.nameEn || item?.id || ''),
    permissions: Array.isArray(item?.permissions) ? item.permissions.map(String) : [],
    isSystem: Boolean(item?.isSystem),
    createdAt: item?.createdAt || null,
  }
}

function normalizePermission(item: any): Permission {
  return {
    id: String(item?.id || item?.key || ''),
    key: String(item?.key || ''),
    nameAr: String(item?.nameAr || item?.key || ''),
    nameEn: String(item?.nameEn || item?.key || ''),
    descriptionAr: String(item?.descriptionAr || item?.nameAr || item?.key || ''),
    descriptionEn: String(item?.descriptionEn || item?.nameEn || item?.key || ''),
    category: item?.category || 'content',
  }
}

export async function getUsers() {
  const payload = await portalRequest<any[]>('/api/users')
  return payload.map(normalizeUser)
}

export async function createUser(data: UserInput) {
  const payload = await portalRequest<any>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return normalizeUser(payload)
}

export async function updateUser(id: string, data: Partial<UserInput>) {
  const payload = await portalRequest<any>(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return normalizeUser(payload)
}

export async function deleteUser(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function getRoles() {
  const payload = await portalRequest<any[]>('/api/roles')
  return payload.map(normalizeRole)
}

export async function createRole(data: RoleInput) {
  const payload = await portalRequest<any>('/api/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return normalizeRole(payload)
}

export async function updateRole(id: string, data: Partial<RoleInput>) {
  const payload = await portalRequest<any>(`/api/roles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return normalizeRole(payload)
}

export async function deleteRole(id: string) {
  return portalRequest<{ deleted: boolean }>(`/api/roles/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function getPermissions() {
  const payload = await portalRequest<any[]>('/api/permissions')
  return payload.map(normalizePermission)
}
