import { NextResponse } from 'next/server'

const API_BASE = (process.env.NEXT_PUBLIC_AAU_API_BASE_URL || process.env.AAU_API_BASE_URL || 'https://edu.yemenfrappe.com').replace(/\/$/, '')
const CONTACT_MESSAGE_ENDPOINT = '/api/method/aau_university.api.v1.public.create_contact_message'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${API_BASE}${CONTACT_MESSAGE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const payload = await response.json().catch(() => null)
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'CONTACT_SUBMIT_FAILED',
          message: 'Unable to submit contact message',
        },
      },
      { status: 500 },
    )
  }
}
