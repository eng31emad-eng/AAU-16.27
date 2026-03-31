'use client'

import { API_BASE, PortalApiError, portalRequest } from './portal-api'

export type AccessRole = 'admin' | 'doctor' | 'student' | null

export interface AccessPayload {
  authenticated?: boolean
  user?: string | null
  roles?: string[]
  adminRoles?: string[]
  canAccessAdmin?: boolean
  entityPermissions?: Record<string, { read: boolean; write: boolean }>
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AccessRole
  roles: string[]
  adminRoles: string[]
  canAccessAdmin: boolean
}

function inferRole(payload: AccessPayload): AccessRole {
  const roles = Array.isArray(payload.roles) ? payload.roles : []

  if (payload.canAccessAdmin || (payload.adminRoles || []).length > 0) {
    return 'admin'
  }
  if (roles.includes('Instructor')) {
    return 'doctor'
  }
  if (roles.includes('Student')) {
    return 'student'
  }
  return null
}

function normalizeUserName(user: string) {
  const local = user.split('@')[0] || user
  return local.replace(/[._-]+/g, ' ').trim() || user
}

export function mapAccessToUser(payload: AccessPayload | null | undefined): AuthUser | null {
  if (!payload?.authenticated || !payload.user) {
    return null
  }

  const email = String(payload.user)
  const roles = Array.isArray(payload.roles) ? payload.roles : []
  const adminRoles = Array.isArray(payload.adminRoles) ? payload.adminRoles : []

  return {
    id: email,
    email,
    name: normalizeUserName(email),
    role: inferRole(payload),
    roles,
    adminRoles,
    canAccessAdmin: Boolean(payload.canAccessAdmin),
  }
}

export async function fetchCurrentAccess() {
  return portalRequest<AccessPayload>('/api/access/me')
}

export async function loginWithFrappe(username: string, password: string) {
  let resolvedUsername = username
  try {
    const resolver = await portalRequest<{ identifier?: string }>(
      `/api/access/resolve-login?identifier=${encodeURIComponent(username)}`,
      { method: 'GET' },
    )
    if (resolver?.identifier) {
      resolvedUsername = String(resolver.identifier)
    }
  } catch {
    resolvedUsername = username
  }

  const body = new URLSearchParams()
  body.set('usr', resolvedUsername)
  body.set('pwd', password)

  const response = await fetch(`${API_BASE}/api/method/login`, {
    method: 'POST',
    body,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    mode: 'cors',
  })

  const text = await response.text()
  let payload: any = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }

  if (!response.ok || payload?.exc || payload?.message === 'Logged Out') {
    const message =
      payload?._server_messages ||
      payload?.message ||
      payload?.exception ||
      response.statusText ||
      'Login failed'

    throw new PortalApiError(String(message), `HTTP_${response.status}`, response.status)
  }

  return payload
}

export async function logoutFromFrappe() {
  await fetch(`${API_BASE}/api/method/logout`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
    mode: 'cors',
  }).catch(() => null)
}
