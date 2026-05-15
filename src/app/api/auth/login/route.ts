import { NextRequest, NextResponse } from 'next/server'

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'missioncontrol'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === DASHBOARD_PASSWORD) {
      const response = NextResponse.json({ ok: true })
      // Set cookie that lasts 30 days
      response.cookies.set('mc-auth', 'authenticated', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false, // Needs to be readable by middleware
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      return response
    }

    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}