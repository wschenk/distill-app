import { NextRequest, NextResponse } from 'next/server'
import { backendApi } from '@/lib/server-api'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const data = await backendApi.users.getUserSummary(username)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching user summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user summary' },
      { status: 500 }
    )
  }
}
