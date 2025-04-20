export const dynamic = "force-dynamic";
// Updated to be dynamic to allow API changes
import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

// Path to about page JSON file
const aboutFilePath = path.join(process.cwd(), 'data', 'about.json');

// Ensure the data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    // If directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Default about page content
const defaultAboutContent = {
  title: 'About Us',
  subtitle: 'Learn more about our real estate company',
  mainContent: 'We are a premier real estate company specializing in luxury properties in Uttarakhand. With years of experience and deep local knowledge, we help clients find their perfect property in this beautiful region.',
  mission: 'Our mission is to help clients find their dream properties while ensuring sustainable development in the pristine Himalayan region.',
  vision: 'We envision creating a platform where finding premium properties in Uttarakhand is seamless, transparent, and enjoyable.',
  bannerImage: '',
  ceoSection: {
    name: 'John Doe',
    position: 'Chief Executive Officer',
    bio: 'With over 15 years of experience in the real estate industry, our CEO has a deep understanding of the Uttarakhand property market. Specializing in luxury and investment properties, John has helped hundreds of clients find their dream homes in the Himalayas.',
    imageUrl: '',
    socialLinks: {
      facebook: 'https://facebook.com/360degreesrealestate',
      instagram: 'https://instagram.com/360degreesrealestate',
      linkedin: 'https://linkedin.com/company/360degreesrealestate',
      twitter: 'https://twitter.com/360realestate'
    }
  },
  teamSection: {
    title: 'Our Team',
    subtitle: 'Meet the people who make it all happen',
    members: []
  },
  updatedAt: new Date().toISOString()
};

// GET: Retrieve about page content
export async function GET(req: NextRequest) {
  try {
    console.log('GET request for about page content');
    await ensureDataDir();
    
    // Check if about file exists
    try {
      await fs.access(aboutFilePath);
      
      // Read about file
      const aboutRaw = await fs.readFile(aboutFilePath, 'utf-8');
      const aboutContent = JSON.parse(aboutRaw);
      
      return NextResponse.json(aboutContent, { status: 200 });
    } catch (error) {
      console.log('About file not found. Creating with defaults.');
      
      // If file doesn't exist, create it with default content
      await fs.writeFile(aboutFilePath, JSON.stringify(defaultAboutContent, null, 2));
      
      return NextResponse.json(defaultAboutContent, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching about page content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about page content' },
      { status: 500 }
    );
  }
}

// POST: Update about page content
export async function POST(req: NextRequest) {
  try {
    console.log('POST request to update about page content');
    
    // Parse request body
    const content = await req.json();
    
    // Validate required fields
    if (!content.title || !content.mainContent) {
      return NextResponse.json(
        { error: 'Title and main content are required' },
        { status: 400 }
      );
    }
    
    // Ensure data directory exists
    await ensureDataDir();
    
    // Add timestamp
    const updatedContent = {
      ...content,
      updatedAt: new Date().toISOString()
    };
    
    // Write content to file
    await fs.writeFile(
      aboutFilePath, 
      JSON.stringify(updatedContent, null, 2)
    );
    
    console.log('About page content updated successfully');
    
    return NextResponse.json(updatedContent, { status: 200 });
  } catch (error) {
    console.error('Error updating about page content:', error);
    return NextResponse.json(
      { error: 'Failed to update about page content' },
      { status: 500 }
    );
  }
}
