/**
 * API Route for Watch Management with Username in URL
 * Handles adding/removing specific users from watch list
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://twitter-collator.fly.dev';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required',
      }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/api/watch/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Return the backend's error response instead of throwing
      return NextResponse.json({
        success: false,
        error: data.message || `Backend responded with status: ${response.status}`,
        data,
      }, { status: response.status });
    }
    
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Add user API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required',
      }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/api/watch/${username}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Return the backend's error response instead of throwing
      return NextResponse.json({
        success: false,
        error: data.message || `Backend responded with status: ${response.status}`,
        data,
      }, { status: response.status });
    }
    
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Remove user API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
