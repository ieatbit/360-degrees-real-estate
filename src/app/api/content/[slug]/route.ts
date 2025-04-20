export const dynamic = "force-static";
// Rebuilt for static export
export async function generateStaticParams() { return [{ id: "1" }]; }

// Add this function to pre-generate all possible slug parameters
  // Return all possible content slugs
    { slug: 'about' },
    { slug: 'privacy-policy' },
    { slug: 'terms' },
    { slug: 'contact' },
    // Add any other content slugs you have

import path from 'path';
import fs from 'fs/promises';
import { ContentPage } from '@/types';

// Path to content JSON file
const contentFilePath = path.join(process.cwd(), 'data', 'content.json');

// GET /api/content/[slug] - Get content by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log(`GET request for content with slug: ${params.slug}`);
    
    // Read content file
    try {
      const contentRaw = await fs.readFile(contentFilePath, 'utf-8');
      const contentItems = JSON.parse(contentRaw) as ContentPage[];
      
      // Find content by slug
      const content = contentItems.find(item => item.slug === params.slug);
      
      if (content) {
        return NextResponse.json(content, { status: 200 });
      } else {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Content file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }

// PUT /api/content/[slug] - Update content by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log(`PUT request to update content with slug: ${params.slug}`);
    
    // Parse request body
    const updatedContent = await request.json();
    
    // Validate required fields
    if (!updatedContent.title) {
      return NextResponse.json(
        { error: 'Required fields are missing (title)' },
        { status: 400 }
      );
    }
    
    // Read content file
    try {
      const contentRaw = await fs.readFile(contentFilePath, 'utf-8');
      const contentItems = JSON.parse(contentRaw) as ContentPage[];
      
      // Find content by slug
      const index = contentItems.findIndex(item => item.slug === params.slug);
      
      if (index === -1) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      
      // Update content
      const now = new Date().toISOString();
      contentItems[index] = {
        ...contentItems[index],
        ...updatedContent,
        updatedAt: now
      };
      
      // Write content to file
      await fs.writeFile(
        contentFilePath, 
        JSON.stringify(contentItems, null, 2)
      );
      
      console.log('Content updated successfully');
      
      return NextResponse.json(contentItems[index], { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Content file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }

// DELETE /api/content/[slug] - Delete content by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log(`DELETE request for content with slug: ${params.slug}`);
    
    // Read content file
    try {
      const contentRaw = await fs.readFile(contentFilePath, 'utf-8');
      const contentItems = JSON.parse(contentRaw) as ContentPage[];
      
      // Find content by slug
      const filteredContent = contentItems.filter(item => item.slug !== params.slug);
      
      // Check if content was found
      if (filteredContent.length === contentItems.length) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      
      // Write content to file
      await fs.writeFile(
        contentFilePath, 
        JSON.stringify(filteredContent, null, 2)
      );
      
      console.log('Content deleted successfully');
      
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Content file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
