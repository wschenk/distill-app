/**
 * API Route for Collections
 * Uses TwitterCollatorAPI from src/api to fetch collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  try {
    console.log('[Collections API] Fetching collections using src/api...');
    
    // Use the getCollections method from TwitterCollatorAPI
    const result = await backendApi.collections.getCollections();
    
    console.log('[Collections API] Successfully fetched collections:', result.collections?.length || 0);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Collections API] Error fetching collections:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { collections: [] },
    }, { status: 500 });
  }
}
