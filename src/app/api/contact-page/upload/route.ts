export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles image uploads for the Contact page
 */
export async function POST(req: NextRequest) {
  try {
    // Get the form data
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const sectionId = formData.get('sectionId') as string;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Check if the file is an image
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File is not an image' },
        { status: 400 }
      );
    }
    
    // Get image bytes
    const imageBytes = await image.arrayBuffer();
    const buffer = Buffer.from(imageBytes);
    
    // Create a unique filename with section identifier
    const filename = `contact-${sectionId}-${uuidv4()}.${image.type.split('/')[1]}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log(`Ensured uploads directory exists: ${uploadsDir}`);
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
    
    // Save the file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);
    console.log(`Saved file to: ${filePath}`);
    
    // Return the URL to the file
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json(
      { url: fileUrl, message: 'Image uploaded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 