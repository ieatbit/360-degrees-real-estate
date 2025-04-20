import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// Upload directory for property page images
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'property-page');

// Ensure upload directory exists
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!acceptedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP formats are accepted.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = `${uuidv4()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Convert file to buffer and save
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    
    // Generate URL for the uploaded file
    const fileUrl = `/uploads/property-page/${fileName}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 