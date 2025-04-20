export const dynamic = "force-static";
// Rebuilt for static export
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ContentPage } from '@/types';

// Path to content JSON file
const contentFilePath = path.join(process.cwd(), 'src/data/content.json');

// Ensure the data directory exists
async function ensureDataDirectoryExists() {
  const dataDirectory = path.join(process.cwd(), 'src/data');
  try {
    await fs.access(dataDirectory);
  } catch (error) {
    await fs.mkdir(dataDirectory, { recursive: true });
  }

// Get content file
async function getContentFile(): Promise<ContentPage[]> {
  try {
    await ensureDataDirectoryExists();
    
    try {
      await fs.access(contentFilePath);
    } catch (error) {
      // Create empty content file if it doesn't exist
      await fs.writeFile(contentFilePath, JSON.stringify([], null, 2));
    }
    
    const fileContent = await fs.readFile(contentFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading content file:', error);
  }

// Save content file
async function saveContentFile(content: ContentPage[]): Promise<void> {
  await ensureDataDirectoryExists();
  await fs.writeFile(contentFilePath, JSON.stringify(content, null, 2));

// GET: Fetch all content pages
export async function GET() {
  console.log('GET content API called');
  
  try {
    const content = await getContentFile();
    
    // Sort by updatedAt desc
    content.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }

// POST: Create a new content page
export async function POST(request: NextRequest) {
  console.log('POST content API called');
  
  try {
    const contentData = await request.json();
    
    // Validate required fields
    if (!contentData.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Generate slug if not provided
    if (!contentData.slug) {
      contentData.slug = contentData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    const existingContent = await getContentFile();
    
    // Check if slug already exists
    if (existingContent.some(page => page.slug === contentData.slug)) {
      return NextResponse.json(
        { error: 'Content with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Create new content page
    const newContent: ContentPage = {
      id: uuidv4(),
      title: contentData.title,
      slug: contentData.slug,
      content: contentData.content || '',
      status: contentData.status || 'draft',
      type: contentData.type || 'page',
      metaTitle: contentData.metaTitle || contentData.title,
      metaDescription: contentData.metaDescription || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add optional fields if they exist
    if (contentData.featuredImage) newContent.featuredImage = contentData.featuredImage;
    if (contentData.sections) newContent.sections = contentData.sections;
    if (contentData.order) newContent.order = contentData.order;
    
    // Add to content file
    existingContent.push(newContent);
    await saveContentFile(existingContent);
    
    return NextResponse.json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }

// PUT: Update existing content
export async function PUT(request: NextRequest) {
  console.log('PUT content API called');
  
  try {
    const contentData = await request.json();
    
    // Validate required fields
    if (!contentData.id || !contentData.title) {
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      );
    }
    
    const existingContent = await getContentFile();
    const contentIndex = existingContent.findIndex(page => page.id === contentData.id);
    
    if (contentIndex === -1) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Check if slug already exists and belongs to a different content
    if (contentData.slug && 
        contentData.slug !== existingContent[contentIndex].slug && 
        existingContent.some(page => page.slug === contentData.slug)) {
      return NextResponse.json(
        { error: 'Content with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Update content
    const updatedContent = {
      ...existingContent[contentIndex],
      ...contentData,
      updatedAt: new Date().toISOString(),
    };
    
    existingContent[contentIndex] = updatedContent;
    await saveContentFile(existingContent);
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }

// DELETE: Delete content
export async function DELETE(request: NextRequest) {
  console.log('DELETE content API called');
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }
    
    const existingContent = await getContentFile();
    const contentIndex = existingContent.findIndex(page => page.id === id);
    
    if (contentIndex === -1) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Remove content
    existingContent.splice(contentIndex, 1);
    await saveContentFile(existingContent);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
