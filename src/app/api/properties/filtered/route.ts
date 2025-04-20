import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the data file path
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'properties.json');

// Property interface
interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  description: string;
  category: 'buy' | 'lease';
  propertyType: string;
  // ... other fields
}

// GET handler for filtered properties
export async function GET(request: NextRequest) {
  try {
    console.log('FILTERED API CALLED WITH URL:', request.url);
    
    // Get query parameters manually from the URL
    const url = new URL(request.url);
    const queryParams = url.searchParams;
    
    // Extract parameters
    const category = queryParams.get('category');
    const location = queryParams.get('location');
    const propertyType = queryParams.get('propertyType');
    const priceMin = queryParams.get('priceMin');
    const priceMax = queryParams.get('priceMax');
    
    console.log('FILTERED API - Parameters:', {
      category,
      location,
      propertyType,
      priceMin,
      priceMax
    });
    
    // Read the data file
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const properties: Property[] = JSON.parse(data);
    
    console.log('FILTERED API - Total properties before filtering:', properties.length);
    
    // Filter properties
    const filtered = properties.filter(property => {
      // Apply filters one by one
      
      // Filter by category if provided
      if (category && property.category !== category) {
        return false;
      }
      
      // Filter by location if provided - using exact match
      if (location) {
        const propertyLocationParts = property.location
          .split(',')
          .map(part => part.trim().toLowerCase());
        
        // Match if any part of the location equals the filter
        const locationMatch = propertyLocationParts.some(
          part => part.toLowerCase() === location.toLowerCase()
        );
        
        if (!locationMatch) {
          console.log(`FILTERED API - Property ${property.id} excluded - location "${property.location}" doesn't match "${location}"`);
          return false;
        } else {
          console.log(`FILTERED API - Property ${property.id} MATCHES location "${property.location}" with "${location}"`);
        }
      }
      
      // Filter by property type if provided
      if (propertyType && property.propertyType.toLowerCase() !== propertyType.toLowerCase()) {
        return false;
      }
      
      // Filter by price if provided
      if (priceMin || priceMax) {
        // Extract the numeric part of the price
        const priceNumeric = parseInt(property.price.replace(/[^\d]/g, ''), 10);
        
        // Check minimum price
        if (priceMin && priceNumeric < parseInt(priceMin, 10)) {
          return false;
        }
        
        // Check maximum price
        if (priceMax && priceNumeric > parseInt(priceMax, 10)) {
          return false;
        }
      }
      
      // If passed all filters, include this property
      return true;
    });
    
    console.log(`FILTERED API - Found ${filtered.length} properties after filtering`);
    
    if (filtered.length > 0) {
      console.log('FILTERED API - Filtered properties:', 
        filtered.map(p => `${p.id}: ${p.title} (${p.location})`));
    }
    
    // Return filtered properties
    return NextResponse.json(filtered, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('FILTERED API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 