import path from 'path';
import fs from 'fs/promises';

// Interface for settings
interface NavItem {
  title: string;
  path: string;
  order: number;
  visible: boolean;
}

// Social links interface
interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface Settings {
  siteName: string;
  contactEmail: string;
  phoneNumber: string;
  mainLocation: string;
  metaTitle: string;
  metaDescription: string;
  featuredPropertiesCount: string;
  enableVirtualTours: boolean;
  navigation: NavItem[];
  updatedAt: string;
  // Email settings
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  emailFrom?: string;
  // Social media links
  socialLinks?: SocialLinks;
}

// Path to settings JSON file
const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

// Default settings
const defaultSettings: Settings = {
  siteName: '360° Real Estate',
  contactEmail: 'info@360degreesrealestate.in',
  phoneNumber: '+91 9876543210',
  mainLocation: 'Mall Road, Nainital, Uttarakhand',
  metaTitle: 'Premium Real Estate in Uttarakhand | 360° Real Estate',
  metaDescription: 'Discover premium properties in Uttarakhand with panoramic mountain views. Buy or lease villas, cottages, and bungalows in the serene Himalayan landscape.',
  featuredPropertiesCount: '3',
  enableVirtualTours: false,
  navigation: [
    { title: 'Home', path: '/', order: 1, visible: true },
    { title: 'Properties', path: '/properties', order: 2, visible: true },
    { title: 'Contact Us', path: '/contact', order: 3, visible: true },
    { title: 'About Us', path: '/about', order: 4, visible: true },
    { title: 'Admin', path: '/admin', order: 5, visible: true }
  ],
  updatedAt: new Date().toISOString(),
  // Default email settings (should be configured in admin)
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpPass: '',
  emailFrom: '',
  // Default social media links
  socialLinks: {
    facebook: 'https://facebook.com/360degreesrealestate',
    instagram: 'https://instagram.com/360degreesrealestate',
    youtube: 'https://youtube.com/360degreesrealestate',
    whatsapp: '919876543210'
  }
};

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

/**
 * Get the website settings from the settings file
 */
export async function getSettings(): Promise<Settings> {
  try {
    await ensureDataDir();
    
    // Check if settings file exists
    try {
      await fs.access(settingsFilePath);
      
      // Read settings file
      const settingsRaw = await fs.readFile(settingsFilePath, 'utf-8');
      return JSON.parse(settingsRaw) as Settings;
    } catch (error) {
      console.log('Settings file not found. Creating with defaults.');
      
      // If file doesn't exist, create it with default settings
      await fs.writeFile(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
      
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings; // Return defaults in case of error
  }
} 