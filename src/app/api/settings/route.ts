import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Dynamic route for fetching and updating settings
export const dynamic = 'force-dynamic';

// Settings file path
const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

// Settings interface
interface Settings {
  siteName: string;
  contactEmail: string;
  phoneNumber: string;
  mainLocation: string;
  metaTitle: string;
  metaDescription: string;
  featuredPropertiesCount: string;
  enableVirtualTours: boolean;
  updatedAt: string;
  // Email settings
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  emailFrom?: string;
  // Social media links
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

// Helper to ensure the data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    // If directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Default settings
const defaultSettings: Settings = {
  siteName: '360° Real Estate',
  contactEmail: 'info@360degreesrealestate.in',
  phoneNumber: '+91 9759866333',
  mainLocation: 'Dehradun, Uttarakhand',
  metaTitle: '360° Real Estate - Properties in Uttarakhand',
  metaDescription: 'Find your dream property in Uttarakhand with 360° Real Estate. We offer a wide range of properties including residential, commercial, and agricultural.',
  featuredPropertiesCount: '3',
  enableVirtualTours: true,
  updatedAt: new Date().toISOString(),
  socialLinks: {
    facebook: '',
    instagram: '',
    youtube: '',
    whatsapp: ''
  }
};

// GET: Retrieve settings
export async function GET(req: NextRequest) {
  try {
    console.log('GET request for website settings');
    await ensureDataDir();
    
    // Check if settings file exists
    try {
      await fs.access(settingsFilePath);
      
      // Read settings file
      const settingsRaw = await fs.readFile(settingsFilePath, 'utf-8');
      const settings = JSON.parse(settingsRaw) as Settings;
      
      return NextResponse.json(settings, { status: 200 });
    } catch (error) {
      console.log('Settings file not found. Creating with defaults.');
      
      // If file doesn't exist, create it with default settings
      await fs.writeFile(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
      
      return NextResponse.json(defaultSettings, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST: Update settings
export async function POST(req: NextRequest) {
  try {
    console.log('POST request to update website settings');
    
    // Parse request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.siteName || !data.contactEmail) {
      return NextResponse.json(
        { error: 'Site name and contact email are required' },
        { status: 400 }
      );
    }
    
    // Ensure data directory exists
    await ensureDataDir();
    
    // Get current settings or use defaults
    let currentSettings: Settings;
    try {
      const fileContent = await fs.readFile(settingsFilePath, 'utf8');
      currentSettings = JSON.parse(fileContent);
    } catch (error) {
      currentSettings = {...defaultSettings};
    }
    
    // Update settings
    const updatedSettings: Settings = {
      ...currentSettings,
      siteName: data.siteName,
      contactEmail: data.contactEmail || data.siteEmail,
      phoneNumber: data.phoneNumber || data.sitePhone || currentSettings.phoneNumber,
      mainLocation: data.mainLocation || data.siteAddress || currentSettings.mainLocation,
      metaTitle: data.metaTitle || (data.seo?.metaTitle) || currentSettings.metaTitle,
      metaDescription: data.metaDescription || (data.seo?.metaDescription) || currentSettings.metaDescription,
      featuredPropertiesCount: data.featuredPropertiesCount || currentSettings.featuredPropertiesCount,
      enableVirtualTours: data.enableVirtualTours !== undefined ? data.enableVirtualTours : 
                          data.showVirtualTours !== undefined ? data.showVirtualTours : 
                          currentSettings.enableVirtualTours,
      smtpHost: data.smtpHost || (data.smtp?.host) || currentSettings.smtpHost,
      smtpPort: data.smtpPort || (data.smtp?.port) || currentSettings.smtpPort,
      smtpUser: data.smtpUser || (data.smtp?.user) || currentSettings.smtpUser,
      smtpPass: data.smtpPass || (data.smtp?.password) || currentSettings.smtpPass,
      emailFrom: data.emailFrom || currentSettings.emailFrom,
      socialLinks: {
        facebook: data.socialLinks?.facebook || (data.social?.facebook) || currentSettings.socialLinks?.facebook || '',
        instagram: data.socialLinks?.instagram || (data.social?.instagram) || currentSettings.socialLinks?.instagram || '',
        youtube: data.socialLinks?.youtube || (data.social?.youtube) || currentSettings.socialLinks?.youtube || '',
        whatsapp: data.socialLinks?.whatsapp || (data.social?.whatsapp) || currentSettings.socialLinks?.whatsapp || ''
      },
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(settingsFilePath, JSON.stringify(updatedSettings, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
    
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
