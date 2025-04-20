import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure this route to handle large file uploads
export const config = {
  runtime: 'edge',
  regions: ['auto'],
};

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public/uploads');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    return uploadsDir;
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    throw new Error('Failed to create uploads directory');
  }
}

// Process file upload
export async function POST(request: NextRequest) {
  try {
    // Check if request is multipart form data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return new NextResponse(
        JSON.stringify({ error: 'Request must be multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get file details
    const fileSize = file.size;
    const fileType = file.type;
    const originalName = file.name;

    // Log file details
    console.log(`Uploading file: ${originalName}, size: ${fileSize / 1024 / 1024}MB, type: ${fileType}`);

    // Check file size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      return new NextResponse(
        JSON.stringify({ error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check file type (only images)
    if (!fileType.startsWith('image/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Only image files are allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();

    // Generate a unique filename
    const fileExtension = path.extname(originalName);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Generate a relative URL for the file
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Return the URL and success status
    return new NextResponse(
      JSON.stringify({ 
        url: fileUrl,
        success: true,
        message: 'File uploaded successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error uploading file:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Failed to upload file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 