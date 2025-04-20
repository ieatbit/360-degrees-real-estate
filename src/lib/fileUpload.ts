import path from 'path';
import { saveUploadedFile, ensureUploadsDir } from './utils';
import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Process file uploads from form data with enhanced debugging
 */
export async function processFileUploads(
  propertyId: string,
  formData: FormData
): Promise<{ images: string[]; videoUrl?: string; videoUrls?: string[] }> {
  const result: { images: string[]; videoUrl?: string; videoUrls: string[] } = { 
    images: [],
    videoUrls: []
  };

  try {
    console.log(`======= STARTING FILE UPLOAD PROCESS =======`);
    console.log(`Property ID: ${propertyId}`);
    
    // Validate property ID
    if (!propertyId || propertyId.trim() === '') {
      throw new Error('Invalid property ID provided for file upload');
    }
    
    // Check if uploads directory exists
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    try {
      if (!existsSync(uploadsPath)) {
        console.error(`CRITICAL: Base uploads directory does not exist: ${uploadsPath}`);
      } else {
        console.log(`Base uploads directory exists: ${uploadsPath}`);
      }
    } catch (dirError) {
      console.error(`Error checking uploads directory: ${dirError}`);
    }
    
    // Create property-specific upload folder
    let propertyDir;
    try {
      propertyDir = await ensureUploadsDir(propertyId);
      console.log(`Property directory ensured: ${propertyDir}`);
    } catch (dirError) {
      console.error(`CRITICAL: Failed to create property directory:`, dirError);
      throw new Error(`Failed to create upload directory for property ${propertyId}: ${(dirError as Error).message}`);
    }

    // Debug: Log all form data entries for better debugging
    const formDataEntries = Array.from(formData.entries());
    console.log(`Form data contains ${formDataEntries.length} entries`);
    
    // Count file entries vs other entries
    const fileEntries = formDataEntries.filter(([_, value]) => value instanceof File);
    console.log(`Found ${fileEntries.length} file entries and ${formDataEntries.length - fileEntries.length} non-file entries`);
    
    // Log each entry type and size for debugging
    formDataEntries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`Entry: ${key}, type: File, name: ${value.name}, size: ${value.size} bytes, mime: ${value.type}`);
      } else {
        console.log(`Entry: ${key}, type: ${typeof value}, value: ${String(value).substring(0, 30)}${String(value).length > 30 ? '...' : ''}`);
      }
    });
    
    // Process image files (they are named with pattern 'image-0', 'image-1', etc.)
    const imageEntries = formDataEntries.filter(([key, value]) => 
      key.startsWith('image-') && value instanceof File && value.size > 0
    );

    if (imageEntries.length > 0) {
      console.log(`Processing ${imageEntries.length} image files`);

      for (const [key, value] of imageEntries) {
        if (value instanceof File && value.size > 0) {
          console.log(`----- SAVING IMAGE: ${key} -----`);
          console.log(`File: ${value.name} (${value.size} bytes), type: ${value.type}`);

          try {
            // Save the file and get its URL
            const fileUrl = await saveUploadedFile(value, propertyDir, key);

            // Add to images array
            result.images.push(fileUrl);
            console.log(`Successfully saved image: ${fileUrl}`);
            
            // Verify file exists on disk
            try {
              const localPath = path.join(process.cwd(), 'public', fileUrl.split('?')[0]);
              await fs.access(localPath);
              const stat = await fs.stat(localPath);
              console.log(`Verified file exists on disk: ${localPath} (${stat.size} bytes)`);
            } catch (verifyError) {
              console.error(`WARNING: File not found on disk after save: ${verifyError}`);
            }
          } catch (imageError) {
            console.error(`Error saving image ${key}:`, imageError);
            console.error(`Stack trace:`, (imageError as Error).stack);
            // Continue with other images even if one fails
          }
        } else {
          console.log(`Skipping invalid or empty image file: ${key}`);
        }
      }

      console.log(`Saved ${result.images.length} images out of ${imageEntries.length} attempts`);
      
      if (result.images.length === 0 && imageEntries.length > 0) {
        console.error(`CRITICAL: Failed to save any images despite having ${imageEntries.length} valid entries`);
      }
    } else {
      console.log(`No valid image files found in form data. Please check file input names match 'image-[number]' pattern.`);
    }

    // Process video files - check for multiple video files with pattern video-0, video-1, etc.
    console.log("[processFileUploads] Checking for video files...");
    
    // Better detection of video files - check for both 'video' and 'video-N' patterns with improved logging
    const videoEntries = formDataEntries.filter(([key, value]) => 
      (key === 'video' || key.match(/^video-\d+$/)) && 
      value instanceof File && 
      value.size > 0
    );
    
    if (videoEntries.length > 0) {
      console.log(`----- PROCESSING ${videoEntries.length} VIDEO FILES -----`);
      
      // List all video entry keys for debugging
      console.log(`Video keys found: ${videoEntries.map(([key]) => key).join(', ')}`);
      
      for (const [key, value] of videoEntries) {
        if (value instanceof File && value.size > 0) {
          console.log(`Processing video: ${key}, ${value.name} (${value.size} bytes), type: ${value.type}`);
          
          try {
            // Generate a unique name for each video
            const timestamp = Date.now();
            const videoKey = `${key}-${timestamp}`;
            
            // Save the video and get its URL
            const videoUrl = await saveUploadedFile(value, propertyDir, videoKey);
            
            // Add cache-busting parameter
            const processedUrl = videoUrl.includes('?') 
              ? `${videoUrl}&t=${timestamp}` 
              : `${videoUrl}?t=${timestamp}`;
            
            // Add to videoUrls array
            result.videoUrls.push(processedUrl);
            
            // Set as main videoUrl if we don't have one yet (for backward compatibility)
            if (!result.videoUrl) {
              result.videoUrl = processedUrl;
            }
            
            console.log(`Successfully saved video: ${processedUrl}`);
          } catch (videoError: any) {
            console.error(`Error saving video file ${key}:`, videoError);
            console.error('Stack trace:', videoError.stack);
          }
        }
      }
    } else {
      console.log("No video files found in form data");
    }

    console.log(`======= FILE UPLOAD PROCESS COMPLETE =======`);
    console.log(`Results: ${result.images.length} images, videos: ${result.videoUrls.length}`);
    
    // Provide detailed summary of all processed videos
    if (result.videoUrls.length > 0) {
      console.log("Video URLs processed:");
      result.videoUrls.forEach((url, index) => {
        console.log(`  ${index + 1}: ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('CRITICAL: Error processing file uploads:', error);
    console.error('Stack trace:', (error as Error).stack);
    throw error;
  }
} 