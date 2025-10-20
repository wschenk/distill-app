import { NextRequest, NextResponse } from 'next/server'
import { backendApi } from '@/lib/server-api'

export async function GET(_req: NextRequest) {
  try {
    const feed = await backendApi.getCombinedFeed()
    return NextResponse.json({ success: true, data: feed })
  } catch (error) {
    console.error('[CombinedFeed API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}



