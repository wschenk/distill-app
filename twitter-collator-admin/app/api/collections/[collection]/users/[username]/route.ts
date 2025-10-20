import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://twitter-collator.fly.dev'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ collection: string; username: string }> }
) {
  try {
    const { collection, username } = await params
    const resp = await fetch(`${BACKEND_URL}/api/collections/${collection}/users/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await resp.json()
    if (!resp.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || `Backend error ${resp.status}`, data },
        { status: resp.status }
      )
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[Collections AddUser API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}



