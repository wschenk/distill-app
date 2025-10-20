/**
 * API Route for Sync and Summarize
 * Bridges Next.js API with existing backend services
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://twitter-collator.fly.dev';

export async function POST(request: NextRequest) {
  try {
    console.log('[Sync API] Starting sync-and-summarize request to backend...');
    
    // Forward the request to the existing backend
    const response = await fetch(`${BACKEND_URL}/api/sync-and-summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any relevant headers
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
    });

    console.log('[Sync API] Backend response status:', response.status);

    if (!response.ok) {
      console.error('[Sync API] Backend returned error:', response.status, response.statusText);
      throw new Error(`Backend sync failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Sync API] Backend sync completed successfully:', data.message);
    
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Sync API] Sync and summarize failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to sync and summarize. Please try again.',
    }, { status: 500 });
  }
}
