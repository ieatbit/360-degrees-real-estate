export const dynamic = "force-static";
// Rebuilt for static export
export async function generateStaticParams() { return [{ id: "1" }]; }
// Add this function to pre-generate paths for all possible IDs
  // Return a few placeholder IDs - modify based on your actual data
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // Add more IDs as needed
import { NextRequest, NextResponse } from 'next/server';
import { InquiryService } from '@/lib/services';

// GET /api/inquiries/[id] - Get inquiry by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you would check authentication here
    // For example: if (!isAdmin(request)) return unauthorized();
    
    const inquiryService = new InquiryService(process.env.DB as any);
    const inquiry = await inquiryService.getInquiryById(params.id);
    
    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error(`Error fetching inquiry ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }

// PATCH /api/inquiries/[id] - Update inquiry status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you would check authentication here
    // For example: if (!isAdmin(request)) return unauthorized();
    
    const { status } = await request.json();
    
    if (!status || !['new', 'in-progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const inquiryService = new InquiryService(process.env.DB as any);
    const success = await inquiryService.updateInquiryStatus(
      params.id, 
      status as 'new' | 'in-progress' | 'completed'
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating inquiry ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
