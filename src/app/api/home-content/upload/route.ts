export const dynamic = "force-static";
// Rebuilt for static export
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { saveUploadedFile, ensureUploadsDir } from '@/lib/utils';

// Home content images directory constant
const HOME_CONTENT_DIR = 'home-content';

/**
 * POST: Upload an image for the home page content
 */
export async function POST(req: NextRequest) {
  try {
    console.log('POST request to upload image for home content');
    
    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse form data
    const formData = await req.formData();
    const imageFile = formData.get('image');
    const sectionId = formData.get('sectionId') as string || 'general';
    
    // Validate file existence
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    console.log(`Processing image upload: ${imageFile.name}, size: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB, section: ${sectionId}`);
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validImageTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the limit of 5MB` },
        { status: 400 }
      );
    }
    
    // Create directory structure for home content images
    const homeContentDir = path.join(await ensureUploadsDir(), HOME_CONTENT_DIR);
    await fs.mkdir(homeContentDir, { recursive: true });
    
    // Generate a specific prefix for this section
    const prefix = `section-${sectionId}`;
    
    // Save the file and get its URL
    const fileUrl = await saveUploadedFile(imageFile, homeContentDir, prefix);
    
    // Return the URL for the uploaded image
    return NextResponse.json({ 
      url: fileUrl,
      success: true 
    });
    
  } catch (error) {
    console.error('Error uploading home content image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: (error as Error).message },
      { status: 500 }
    );
  }
}
