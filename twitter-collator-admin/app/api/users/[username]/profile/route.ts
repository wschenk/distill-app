import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://twitter-collator.fly.dev';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    const response = await fetch(`${BACKEND_URL}/data/summary/${username}/profile.json`);
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `User profile not found: ${username}` },
        { status: 404 }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
