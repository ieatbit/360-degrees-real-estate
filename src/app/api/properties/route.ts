// Force dynamic rendering to ensure search filters work correctly
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/lib/services/PropertyService';

// GET /api/properties - Get all properties with optional filtering
export async function GET(req: NextRequest) {
  try {
    // Add cache control headers to prevent caching
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
    
    // Get search parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    // Log the full request URL for debugging
    console.log('Full request URL:', req.url);
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    
    // Extract all filter parameters - preserve exact strings for matching
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    
    // Handle numeric parameters - ensure they're valid numbers
    const rawPriceMin = searchParams.get('priceMin');
    const rawPriceMax = searchParams.get('priceMax');
    
    const priceMin = rawPriceMin && !isNaN(parseInt(rawPriceMin, 10)) 
      ? rawPriceMin 
      : null;
      
    const priceMax = rawPriceMax && !isNaN(parseInt(rawPriceMax, 10)) 
      ? rawPriceMax 
      : null;
    
    const bhkOption = searchParams.get('bhkOption');
    const propertySize = searchParams.get('propertySize');
    
    // Log parameters for debugging
    console.log('API: Filter parameters normalized:');
    console.log('- category:', category);
    console.log('- location:', location);
    console.log('- propertyType:', propertyType);
    console.log('- priceMin:', priceMin);
    console.log('- priceMax:', priceMax);
    
    // Create filter object with non-null parameters
    const filters: any = {};
    
    // Only add filters that have actual values
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (propertyType) filters.propertyType = propertyType;
    if (priceMin) filters.priceMin = priceMin;
    if (priceMax) filters.priceMax = priceMax;
    if (bhkOption) filters.bhkOption = bhkOption;
    if (propertySize) filters.propertySize = propertySize;
    
    console.log('API: Final filter values:', filters);
    console.log('API: Filter keys being applied:', Object.keys(filters));
    
    // Get filtered properties with a new service instance
    const propertyService = new PropertyService();
    const properties = await propertyService.getAllPropertiesWithFilters(filters);
    
    console.log(`API: Returning ${properties.length} filtered properties`);
    
    return NextResponse.json(properties, { headers });
  } catch (error) {
    console.error('Error in properties API route:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    let propertyData;
    
    // Check if the request is FormData or JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData();
      
      // Check if propertyData is included as a JSON string
      const propertyDataString = formData.get('propertyData');
      if (propertyDataString && typeof propertyDataString === 'string') {
        try {
          // Parse the JSON string into an object
          propertyData = JSON.parse(propertyDataString);
          console.log('Property data parsed successfully from form:', propertyData.title);
        } catch (e) {
          console.error('Error parsing propertyData JSON:', e);
          return NextResponse.json(
            { error: 'Invalid propertyData JSON' },
            { status: 400 }
          );
        }
      } else {
        // Fallback to the old approach if no propertyData field
        propertyData = {};
        
        // Process all non-file form fields first
        for (const [key, value] of formData.entries()) {
          // Skip file entries which will be handled separately
          if (value instanceof File) {
            continue;
          }
          
          // Handle nested objects (like specs, which were stringified)
          if (key === 'specs' || key === 'features' || key === 'amenities' || key === 'images') {
            try {
              propertyData[key] = JSON.parse(value as string);
            } catch (e) {
              console.error(`Error parsing ${key}:`, e, value);
              propertyData[key] = value;
            }
          } else {
            propertyData[key] = value;
          }
        }
      }
      
      // Handle file uploads
      const imageFiles = [];
      const videoFiles = [];
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && key.startsWith('image-')) {
          // Process image files
          imageFiles.push(value);
        }
        
        if (value instanceof File && (key === 'video' || key.startsWith('video-'))) {
          // Process video files - handle both legacy 'video' key and new 'video-0', 'video-1' format
          videoFiles.push(value);
        }
      }
      
      if (imageFiles.length > 0) {
        propertyData.imageFiles = imageFiles;
      }
      
      if (videoFiles.length > 0) {
        propertyData.videoFiles = videoFiles;
      }
    } else {
      // Handle JSON - use try/catch to handle parsing errors
      try {
        propertyData = await request.json();
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }
    
    // Validate required fields
    const requiredFields = ['title', 'price', 'location', 'description', 'specs', 'features', 'category', 'propertyType'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const propertyService = new PropertyService(null);
    const id = await propertyService.createProperty(propertyData);
    
    // Add no-cache headers to the response
    return NextResponse.json({ id }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
