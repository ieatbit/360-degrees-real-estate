export const dynamic = "force-static";
// Rebuilt for static export
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { HomePageContent } from '@/types';

// Path to home content JSON file
const contentFilePath = path.join(process.cwd(), 'data', 'home-content.json');

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

// Default home content
const defaultHomeContent: HomePageContent = {
  id: 'home-page',
  heroTitle: 'Search Your Real Estate Requirement',
  heroSubtitle: 'Find luxury properties in Uttarakhand with stunning mountain views',
  heroBackgroundImage: '/images/uttarakhand-bg.svg',
  featuredSectionTitle: 'Featured Properties',
  whyChooseUsTitle: 'Why Choose Our Properties?',
  whyChooseUsFeatures: [
    {
      title: 'Prime Locations',
      description: 'All our properties are situated in the most scenic and convenient locations for your dream home.',
      icon: 'location'
    },
    {
      title: 'Competitive Pricing',
      description: 'We offer the best value for your investment with transparent pricing and no hidden fees.',
      icon: 'price'
    },
    {
      title: 'Verified Properties',
      description: 'Every listing is thoroughly verified for authenticity and legal compliance.',
      icon: 'verify'
    }
  ],
  aboutSectionTitle: 'About Uttarakhand Real Estate',
  aboutSectionContent: 'Discover the beauty of owning property in Uttarakhand, where nature meets luxury. Our curated collection of properties provides the perfect blend of modern amenities and natural splendor.',
  seoTitle: 'Luxury Properties in Uttarakhand | Find Your Dream Home',
  seoDescription: 'Explore premium real estate in Uttarakhand. Find luxury homes, plots, and investment properties with stunning mountain views.',
  customSections: [],
  updatedAt: new Date().toISOString()
};

// GET: Retrieve home page content
export async function GET(req: NextRequest) {
  try {
    console.log('GET request for home page content');
    await ensureDataDir();
    
    // Check if content file exists
    try {
      await fs.access(contentFilePath);
      
      // Read content file
      const contentRaw = await fs.readFile(contentFilePath, 'utf-8');
      const content = JSON.parse(contentRaw) as HomePageContent;
      
      return NextResponse.json(content, { status: 200 });
    } catch (error) {
      console.log('Home content file not found. Creating with defaults.');
      
      // If file doesn't exist, create it with default content
      await fs.writeFile(contentFilePath, JSON.stringify(defaultHomeContent, null, 2));
      
      return NextResponse.json(defaultHomeContent, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching home content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home content' },
      { status: 500 }
    );
  }
}

// POST: Update home page content
export async function POST(req: NextRequest) {
  try {
    console.log('POST request to update home page content');
    
    // Parse request body
    const content = await req.json();
    
    // Validate required fields
    if (!content.heroTitle || !content.featuredSectionTitle) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }
    
    // Ensure data directory exists
    await ensureDataDir();
    
    // Add timestamp and id
    const updatedContent: HomePageContent = {
      ...content,
      id: 'home-page', // Always use the same ID
      updatedAt: new Date().toISOString()
    };
    
    // Write content to file
    await fs.writeFile(
      contentFilePath, 
      JSON.stringify(updatedContent, null, 2)
    );
    
    console.log('Home content updated successfully');
    
    return NextResponse.json(updatedContent, { status: 200 });
  } catch (error) {
    console.error('Error updating home content:', error);
    return NextResponse.json(
      { error: 'Failed to update home content' },
      { status: 500 }
    );
  }
}
