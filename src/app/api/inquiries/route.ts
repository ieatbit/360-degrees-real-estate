// Rebuilt for static export
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// This tells Next.js that this route should be dynamically rendered
export const dynamic = 'force-dynamic';

// Define the inquiry data structure
interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: 'new' | 'seen' | 'responded';
  createdAt: string;
  updatedAt: string;
}

// Path to inquiries JSON file
const inquiriesFilePath = path.join(process.cwd(), 'data', 'inquiries.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get all inquiries from file
async function getInquiries(): Promise<Inquiry[]> {
  try {
    await ensureDataDir();
    
    try {
      await fs.access(inquiriesFilePath);
      const data = await fs.readFile(inquiriesFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, create empty array
      await fs.writeFile(inquiriesFilePath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error('Error accessing inquiries file:', error);
    return [];
  }
}

// Save inquiries to file
async function saveInquiries(inquiries: Inquiry[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(inquiriesFilePath, JSON.stringify(inquiries, null, 2));
}

// POST /api/inquiries - Create a new inquiry
export async function POST(request: NextRequest) {
  try {
    console.log('Received inquiry submission');
    const inquiryData = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'message'];
    for (const field of requiredFields) {
      if (!inquiryData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create new inquiry object
    const inquiry: Inquiry = {
      id: uuidv4(),
      firstName: inquiryData.firstName || '',
      lastName: inquiryData.lastName || '',
      email: inquiryData.email,
      phone: inquiryData.phone || '',
      subject: inquiryData.subject || '',
      message: inquiryData.message,
      inquiryType: inquiryData.inquiryType || 'contact-form',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get existing inquiries
    const inquiries = await getInquiries();
    
    // Add new inquiry
    inquiries.push(inquiry);
    
    // Save updated inquiries list
    await saveInquiries(inquiries);
    
    console.log(`Inquiry saved with ID: ${inquiry.id}`);
    
    return NextResponse.json({ id: inquiry.id, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Get all inquiries
export async function GET(request: NextRequest) {
  try {
    const inquiries = await getInquiries();
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// DELETE /api/inquiries?id=123 - Delete a single inquiry
// or DELETE /api/inquiries?ids=123,456,789 - Delete multiple inquiries
export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE request received for inquiry');
    const url = new URL(request.url);
    console.log('Full request URL:', request.url);
    console.log('Search params:', Object.fromEntries(url.searchParams.entries()));
    
    const id = url.searchParams.get('id');
    const ids = url.searchParams.get('ids');
    
    // Validate that at least one parameter is provided
    if (!id && !ids) {
      console.error('No inquiry ID provided in delete request');
      return NextResponse.json(
        { error: 'No inquiry ID provided' },
        { status: 400 }
      );
    }
    
    // Get inquiries
    const inquiries = await getInquiries();
    console.log(`Current inquiries count: ${inquiries.length}`);
    
    // Handle single deletion
    if (id) {
      console.log(`Attempting to delete inquiry with ID: ${id}`);
      const originalLength = inquiries.length;
      const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== id);
      
      // Check if any inquiry was removed
      if (updatedInquiries.length === originalLength) {
        console.error(`Inquiry with ID ${id} not found`);
        return NextResponse.json(
          { error: 'Inquiry not found' },
          { status: 404 }
        );
      }
      
      // Save updated inquiries list
      await saveInquiries(updatedInquiries);
      console.log(`Successfully deleted inquiry with ID: ${id}`);
      return NextResponse.json({ success: true });
    }
    
    // Handle multiple deletion
    if (ids) {
      console.log(`Attempting to delete multiple inquiries with IDs: ${ids}`);
      const idArray = ids.split(',');
      const idSet = new Set(idArray);
      
      const originalLength = inquiries.length;
      const updatedInquiries = inquiries.filter(inquiry => !idSet.has(inquiry.id));
      
      // Check if any inquiries were removed
      if (updatedInquiries.length === originalLength) {
        console.error('No inquiries found with the provided IDs');
        return NextResponse.json(
          { error: 'No inquiries found with the provided IDs' },
          { status: 404 }
        );
      }
      
      // Save updated inquiries list
      await saveInquiries(updatedInquiries);
      console.log(`Successfully deleted ${originalLength - updatedInquiries.length} inquiries`);
      return NextResponse.json({ 
        success: true, 
        deleted: originalLength - updatedInquiries.length 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting inquiry/inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}

// PATCH /api/inquiries - Update inquiry status
export async function PATCH(request: NextRequest) {
  try {
    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.id) {
      return NextResponse.json(
        { error: 'Missing inquiry ID' },
        { status: 400 }
      );
    }
    
    if (!updateData.status || !['new', 'seen', 'responded'].includes(updateData.status)) {
      return NextResponse.json(
        { error: 'Invalid or missing status' },
        { status: 400 }
      );
    }
    
    // Get inquiries
    const inquiries = await getInquiries();
    
    // Find and update the inquiry
    const inquiryIndex = inquiries.findIndex(inquiry => inquiry.id === updateData.id);
    
    if (inquiryIndex === -1) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }
    
    // Update the inquiry
    inquiries[inquiryIndex] = {
      ...inquiries[inquiryIndex],
      status: updateData.status,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated inquiries list
    await saveInquiries(inquiries);
    
    return NextResponse.json({ 
      success: true,
      inquiry: inquiries[inquiryIndex]
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry status' },
      { status: 500 }
    );
  }
}
