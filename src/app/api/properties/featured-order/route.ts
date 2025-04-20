export const dynamic = "force-dynamic";
// Rebuilt for static export
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createFileIfNotExists } from '@/lib/utils';

interface FeaturedOrderUpdate {
  id: string;
  featuredOrder: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body as { updates: FeaturedOrderUpdate[] };
    
    // Log request details for debugging
    console.log('Featured order update request received:', updates);
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: updates array is required' },
        { status: 400 }
      );
    }
    
    // Process each property update
    const results = await Promise.all(
      updates.map(async (update) => {
        try {
          const { id, featuredOrder } = update;
          
          if (!id) {
            return { id, success: false, error: 'Property ID is required' };
          }
          
          // Get property file path
          const propertyPath = path.join(process.cwd(), 'public', 'data', 'properties', `${id}.json`);
          
          // Ensure property file exists
          try {
            await fs.access(propertyPath);
          } catch (error) {
            return { id, success: false, error: 'Property not found' };
          }
          
          // Read property data
          const propertyData = JSON.parse(await fs.readFile(propertyPath, 'utf-8'));
          
          // Update featured order
          propertyData.featuredOrder = featuredOrder;
          
          // Ensure property is marked as featured if it has an order
          if (featuredOrder !== undefined && featuredOrder !== null) {
            propertyData.featured = true;
          }
          
          // Write updated property data
          await fs.writeFile(propertyPath, JSON.stringify(propertyData, null, 2), 'utf-8');
          
          return { id, success: true };
        } catch (error) {
          console.error(`Error updating property ${update.id}:`, error);
          return { id: update.id, success: false, error: 'Failed to update property' };
        }
      })
    );
    
    // Check if any updates failed
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      return NextResponse.json({ success: true, results });
    } else {
      return NextResponse.json(
        { success: false, results },
        { status: 207 } // Multi-Status for partial success
      );
    }
  } catch (error) {
    console.error('Error processing featured order update:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
