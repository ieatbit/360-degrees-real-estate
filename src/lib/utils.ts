import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import path from 'path';
import fs from 'fs/promises';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Constants
export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Create utility functions for common operations
export const formatCurrency = (value: string | number): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// File handling utilities
export const ensureUploadsDir = async (propertyId?: string): Promise<string> => {
  try {
    // Ensure base uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    console.log(`Ensured uploads directory exists: ${UPLOADS_DIR}`);
    
    if (propertyId) {
      // Create property-specific directory if requested
      const propertyDir = path.join(UPLOADS_DIR, propertyId);
      await fs.mkdir(propertyDir, { recursive: true });
      console.log(`Created property directory: ${propertyDir}`);
      return propertyDir;
    }
    
    return UPLOADS_DIR;
  } catch (error) {
    console.error('Error ensuring uploads directory:', error);
    throw new Error(`Failed to create upload directories: ${(error as Error).message}`);
  }
};

/**
 * Check if a directory exists
 */
async function directoryExists(dir: string): Promise<boolean> {
  try {
    await fs.access(dir);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Assert that we can write to a directory by creating a test file
 */
async function assertCanWrite(dir: string): Promise<void> {
  const testFilePath = path.join(dir, `.test-write-${Date.now()}.tmp`);
  try {
    await fs.writeFile(testFilePath, 'test');
    await fs.unlink(testFilePath);
  } catch (error) {
    throw new Error(`Cannot write to directory. Disk might be full or permissions issue: ${(error as Error).message}`);
  }
}

/**
 * Ensure a directory exists
 */
async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dir}: ${(error as Error).message}`);
  }
}

// Save a file from a File object
export async function saveUploadedFile(
  file: File,
  targetDir: string,
  prefix: string
): Promise<string> {
  try {
    console.log('========== FILE SAVE OPERATION START ==========');
    console.log(`Saving file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`Target directory: ${targetDir}`);
    console.log(`Prefix: ${prefix}`);
    
    // Check if directory exists
    const dirExists = await directoryExists(targetDir);
    console.log(`Directory exists: ${dirExists ? 'Yes' : 'No - Creating'}`);
    
    if (!dirExists) {
      await fs.mkdir(targetDir, { recursive: true });
      console.log(`Created directory: ${targetDir}`);
    }
    
    // Process the file name
    console.log(`Processing file: ${file.name.toLowerCase()}`);
    console.log(`MIME type: ${file.type}`);
    console.log(`File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    
    // Determine file type (image or video)
    let fileType = 'misc';
    if (file.type.startsWith('image/')) {
      fileType = 'IMAGE';
    } else if (file.type.startsWith('video/')) {
      fileType = 'VIDEO';
    } else if (prefix.startsWith('image')) {
      console.log('File designated as image based on prefix');
      fileType = 'IMAGE';
    } else if (prefix.startsWith('video')) {
      console.log('File designated as video based on prefix');
      fileType = 'VIDEO';
    }
    console.log(`File categorized as: ${fileType}`);
    
    // Create a clean filename by sanitizing the original name
    const timestamp = Date.now();
    const cleanOriginalName = file.name.toLowerCase()
      .replace(/[^a-z0-9.]/g, '-') // Replace special chars with hyphens
      .replace(/--+/g, '-')        // Replace multiple hyphens with single one
      .replace(/\.+$/, '')         // Remove trailing dots
      .replace(/^\.+/, '');        // Remove leading dots
    
    // Create the final filename that includes:
    // 1. The prefix (e.g., "video-0")
    // 2. A timestamp for uniqueness 
    // 3. A short hash of the timestamp for additional uniqueness
    // 4. The sanitized original filename
    const hash = timestamp.toString().slice(-4); // Use last 4 digits as a simple hash
    const fileName = `${prefix}-${timestamp}-${hash}-${cleanOriginalName}`;
    
    // Create the target path
    const targetPath = path.join(targetDir, fileName);
    console.log(`Target path: ${targetPath}`);
    
    // Check if we can write to the directory
    try {
      await assertCanWrite(targetDir);
      console.log('Write permission test passed');
    } catch (writeErr) {
      console.error('Failed write permission test:', writeErr);
      throw new Error(`Cannot write to directory: ${(writeErr as Error).message}`);
    }
    
    // Ensure the directory exists again (double-check)
    await ensureDir(targetDir);
    console.log(`Ensured directory exists: ${targetDir}`);
    
    // Convert the file to a buffer
    console.log('Converting file to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`Buffer created with ${buffer.length} bytes`);
    
    // Write the file to the file system
    console.log(`Writing ${buffer.length} bytes to: ${targetPath}`);
    await fs.writeFile(targetPath, buffer);
    console.log(`File written successfully: ${fileName} (${buffer.length} bytes)`);
    
    // Generate the public URL
    const publicUrl = `/uploads/${path.relative(path.join(process.cwd(), 'public', 'uploads'), targetPath)}`;
    
    // Add a timestamp to the URL to prevent caching
    const urlWithTimestamp = `${publicUrl}?t=${timestamp}`;
    console.log(`Generated public URL: ${urlWithTimestamp}`);
    
    console.log('========== FILE SAVE OPERATION COMPLETE ==========');
    
    return urlWithTimestamp;
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw new Error(`Failed to save file: ${(error as Error).message}`);
  }
}

// Remove property directory and all its files
export const removePropertyFiles = async (propertyId: string): Promise<void> => {
  try {
    const propertyDir = path.join(UPLOADS_DIR, propertyId);
    
    try {
      await fs.access(propertyDir);
      await fs.rm(propertyDir, { recursive: true, force: true });
      console.log(`Removed property files for property ${propertyId}`);
    } catch (error) {
      // Directory doesn't exist, that's fine
      console.log(`No files found for property ${propertyId}`);
    }
  } catch (error) {
    console.error(`Error removing property files:`, error);
    // Don't throw here, just log the error
    // This prevents deletion failures from breaking the main flow
  }
};
