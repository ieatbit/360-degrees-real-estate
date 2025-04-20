import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'src/data/property-page.json');

// Ensure the data directory exists
async function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'src/data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Default content structure
const defaultContent = {
  heroImage: '/images/properties-banner.jpg',
  heroHeading: 'Find Your Dream Property',
  heroSubheading: 'Explore our curated selection of premium properties',
  mainContent: 'We offer a wide range of properties to meet your needs and preferences. From luxury villas to affordable apartments, our portfolio has something for everyone.'
};

// GET handler
export async function GET() {
  try {
    await ensureDataDirectoryExists();

    try {
      // Try to read existing data
      const fileData = await fs.readFile(dataFilePath, 'utf8');
      return NextResponse.json(JSON.parse(fileData));
    } catch (error) {
      // If file doesn't exist, return default content
      await fs.writeFile(dataFilePath, JSON.stringify(defaultContent, null, 2));
      return NextResponse.json(defaultContent);
    }
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json(
      { error: 'Failed to load property page content' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    await ensureDataDirectoryExists();
    
    const data = await request.json();
    
    // Validate the data
    if (!data.heroHeading || !data.heroSubheading) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save the data
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling POST request:', error);
    return NextResponse.json(
      { error: 'Failed to save property page content' },
      { status: 500 }
    );
  }
}