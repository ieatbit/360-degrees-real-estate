export const dynamic = "force-static";
// Rebuilt for static export
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the content data structure
interface UttarakhandGuideContent {
  title: string;
  subtitle: string;
  content: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
}

// Path to content JSON file
const contentFilePath = path.join(process.cwd(), 'data', 'uttarakhand-guide.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize with default content if file doesn't exist
async function initializeDefaultContent(): Promise<UttarakhandGuideContent> {
  return {
    title: 'Uttarakhand Guide',
    subtitle: 'Discover the beauty and opportunities in Uttarakhand',
    content: `
      <h2>Welcome to our Uttarakhand Guide</h2>
      <p>Uttarakhand, known as the "Land of Gods", is a state in northern India that's known for its natural beauty, temples, and as a destination for yoga and hiking.</p>
      
      <h3>Why Invest in Uttarakhand?</h3>
      <ul>
        <li>Growing tourism industry</li>
        <li>Developing infrastructure</li>
        <li>Attractive property prices compared to metropolitan cities</li>
        <li>Beautiful natural surroundings</li>
        <li>Potential for excellent rental returns from vacation homes</li>
      </ul>
      
      <h3>Popular Investment Areas</h3>
      <p>Some of the popular areas for real estate investment in Uttarakhand include:</p>
      <ul>
        <li>Dehradun - The capital city with growing infrastructure</li>
        <li>Mussoorie - Famous hill station with luxury properties</li>
        <li>Nainital - Tourist hotspot with lakeside properties</li>
        <li>Haridwar - Religious city with steady demand</li>
        <li>Rishikesh - Yoga capital with growing international interest</li>
        <li>Almora - Peaceful destination with growing demand</li>
      </ul>
      
      <h3>Contact Us</h3>
      <p>If you're interested in exploring real estate opportunities in Uttarakhand, our team of experts can help you find the perfect property that meets your needs and budget.</p>
    `,
    heroImage: '/images/uttarakhand-mountains.jpg',
    metaTitle: 'Uttarakhand Guide - 360° Real Estate',
    metaDescription: 'Everything you need to know about Uttarakhand - tourism, property investment, local attractions, and more.',
  };
}

// Get content
async function getContent(): Promise<UttarakhandGuideContent> {
  try {
    await ensureDataDir();
    
    try {
      await fs.access(contentFilePath);
      const data = await fs.readFile(contentFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, create default content
      const defaultContent = await initializeDefaultContent();
      await fs.writeFile(contentFilePath, JSON.stringify(defaultContent, null, 2));
      return defaultContent;
    }
  } catch (error) {
    console.error('Error accessing content file:', error);
    return await initializeDefaultContent();
  }
}

// Save content
async function saveContent(content: UttarakhandGuideContent): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(contentFilePath, JSON.stringify(content, null, 2));
}

// GET /api/uttarakhand-guide - Get page content
export async function GET(request: NextRequest) {
  try {
    console.log('GET request for Uttarakhand guide content');
    const content = await getContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching Uttarakhand guide content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST /api/uttarakhand-guide - Update page content
export async function POST(request: NextRequest) {
  try {
    console.log('POST request to update Uttarakhand guide content');
    const contentData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'content'];
    for (const field of requiredFields) {
      if (!contentData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Update content
    await saveContent(contentData);
    
    console.log('Uttarakhand guide content updated successfully');
    
    return NextResponse.json(contentData, { status: 200 });
  } catch (error) {
    console.error('Error updating Uttarakhand guide content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
} 