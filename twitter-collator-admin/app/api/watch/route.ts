/**
 * API Route for Watched Users
 * Uses TwitterCollatorAPI from src/api to fetch watched users
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  try {
    console.log('[Watch API] Fetching watched users using src/api...');
    
    // Use the getWatchedUsers method from TwitterCollatorAPI
    // This handles trying /api/watch and falling back to /data/watched-users.json
    const result = await backendApi.users.getWatchedUsers();
    
    console.log('[Watch API] Successfully fetched watched users:', result.users?.length || 0);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Watch API] Error fetching watched users:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { users: [] },
    }, { status: 500 });
  }
}
