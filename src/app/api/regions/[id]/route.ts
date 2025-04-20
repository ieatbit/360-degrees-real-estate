export const dynamic = "force-static";
// Rebuilt for static export
export async function generateStaticParams() { return [{ id: "1" }]; }
import { NextRequest, NextResponse } from 'next/server';
import { RegionService } from '@/lib/services';

// GET /api/regions/[id] - Get region by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const regionService = new RegionService(process.env.DB as any);
    const region = await regionService.getRegionById(params.id);
    
    if (!region) {
      return NextResponse.json(
        { error: 'Region not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(region);
  } catch (error) {
    console.error(`Error fetching region ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch region' },
      { status: 500 }
    );
  }
