export const dynamic = "force-static";
// Rebuilt for static export
import { NextRequest, NextResponse } from 'next/server';
import { RegionService } from '@/lib/services';

// GET /api/regions - Get all regions
export async function GET(request: NextRequest) {
  try {
    const regionService = new RegionService(process.env.DB as any);
    const regions = await regionService.getRegions();
    
    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
