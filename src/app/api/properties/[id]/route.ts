export const dynamic = "force-dynamic";
// Enable dynamic property details 
import { NextRequest, NextResponse } from 'next/server';
import propertyService from '@/services/propertyService';
import { processFileUploads } from '@/lib/fileUpload';
import { ensureUploadsDir } from '@/lib/utils';

// Define expected parameter shape
type RouteParams = {
  id: string;
};

// GET /api/properties/[id] - Get a property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get ID from params properly
    const { id } = await Promise.resolve(params);
    const propertyId = String(id || '');
    
    console.log(`Received GET request for property ID: ${propertyId}`);
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Fetch the property from service
    const property = await propertyService.getPropertyById(propertyId);
    
    if (!property) {
      console.log(`Property not found for ID: ${propertyId}`);
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    // Return with no-cache headers to prevent browser caching
    return NextResponse.json(property, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in GET property by ID:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PUT /api/properties/[id] - Update a property
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('====== PROPERTY UPDATE API CALL START ======');
    
    // Extract and validate the ID parameter
    const id = params.id;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Property ID is required' }),
        { status: 400 }
      );
    }
    
    console.log(`Processing property update for ID: ${id}`);
    
    // Ensure uploads directory exists
    await ensureUploadsDir();
    
    // Check if property exists
    const existingProperty = await propertyService.getPropertyById(id);
    if (!existingProperty) {
      return new NextResponse(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404 }
      );
    }
    console.log(`Property found: "${existingProperty.title}" (ID: ${existingProperty.id})`);
    
    // Parse form data
    const contentType = request.headers.get('content-type') || '';
    console.log(`Request content type: ${contentType}`);
    
    // Parse multipart form data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      console.log('Form data parsed successfully');
      
      // Log form data entries for debugging
      const formDataEntries = Array.from(formData.entries());
      const fileEntries = formDataEntries.filter(([_, value]) => value instanceof File);
      console.log(`Form data contains ${formDataEntries.length} entries:`);
      console.log(`- ${fileEntries.length} file entries`);
      console.log(`- ${formDataEntries.length - fileEntries.length} text/other entries`);
      
      // Log keys in form data
      console.log(`Field names in form data: ${formDataEntries.map(([key]) => key).join(', ')}`);
      
      // Log file entries
      if (fileEntries.length > 0) {
        console.log('Files in form data:');
        fileEntries.forEach(([key, value]) => {
          const file = value as File;
          console.log(`- ${key}: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB, ${file.type})`);
        });
      } else {
        console.log('No files found in form data');
      }
      
      // Process uploaded files
      const fileResult = await processFileUploads(id, formData);
      console.log('[API Route] Result from processFileUploads:', JSON.stringify(fileResult));
      
      // Parse property data from form
      const propertyData = formData.get('propertyData');
      if (!propertyData || typeof propertyData !== 'string') {
        return new NextResponse(
          JSON.stringify({ error: 'Property data is required' }),
          { status: 400 }
        );
      }
      
      console.log(`Property data from form (first 50 chars): ${propertyData.substring(0, 50)}...`);
      let parsedData;
      try {
        parsedData = JSON.parse(propertyData);
        console.log('Property data parsed successfully');
      } catch (e) {
        console.error('Error parsing property data:', e);
        return new NextResponse(
          JSON.stringify({ error: 'Invalid property data format' }),
          { status: 400 }
        );
      }
      
      // Merge file URLs with property data
      const mergedData = {
        ...parsedData,
      };
      
      // Add new images if any were uploaded
      if (fileResult.images && fileResult.images.length > 0) {
        // If property already has images, append the new ones, otherwise just set them
        mergedData.images = [
          ...(mergedData.images || []),
          ...fileResult.images
        ];
      }
      
      // IMPORTANT: For videos, respect the exact list provided in the form data
      // If the form included videoUrls, use exactly what was provided (this handles deletions)
      // Only append newly uploaded videos to this list

      // First check if the form provided videoUrls explicitly
      const formHasVideoUrlsArray = Array.isArray(parsedData.videoUrls);
      console.log(`Form ${formHasVideoUrlsArray ? 'included' : 'did not include'} explicit videoUrls array`);

      if (formHasVideoUrlsArray) {
        // Use the exact videoUrls from the form as the base (respecting deletions)
        const baseVideoUrls = [...parsedData.videoUrls];
        console.log(`Using ${baseVideoUrls.length} videos from form data as base`);
        
        // Add any newly uploaded videos
        if (fileResult.videoUrls && fileResult.videoUrls.length > 0) {
          console.log(`Adding ${fileResult.videoUrls.length} newly uploaded videos`);
          
          // Add new videos to the list
          mergedData.videoUrls = [...baseVideoUrls, ...fileResult.videoUrls];
          
          // Set the first video as the main videoUrl if one exists
          if (mergedData.videoUrls.length > 0) {
            mergedData.videoUrl = mergedData.videoUrls[0];
          }
        } else {
          // No new uploads, just use the form's videoUrls
          mergedData.videoUrls = baseVideoUrls;
          
          // Set the first video as the main videoUrl if one exists
          if (baseVideoUrls.length > 0) {
            mergedData.videoUrl = baseVideoUrls[0];
          } else {
            // No videos left, clear the videoUrl
            mergedData.videoUrl = '';
          }
        }
      } else {
        // Form didn't include videoUrls array, fall back to traditional merge logic
        // Start with existing videos from the database
        const existingVideos = existingProperty.videoUrls || [];
        
        if (fileResult.videoUrls && fileResult.videoUrls.length > 0) {
          // Add newly uploaded videos to existing ones
          mergedData.videoUrls = [...existingVideos, ...fileResult.videoUrls];
          
          // Set the main videoUrl to the first of the new videos
          mergedData.videoUrl = fileResult.videoUrls[0];
        } else {
          // No new videos, preserve existing ones
          mergedData.videoUrls = existingVideos;
          
          // Keep the original videoUrl if it was already set
          if (!mergedData.videoUrl && existingVideos.length > 0) {
            mergedData.videoUrl = existingVideos[0];
          }
        }
      }
      
      // Log the final video list
      console.log(`Final video list contains ${mergedData.videoUrls?.length || 0} videos:`);
      if (mergedData.videoUrls && mergedData.videoUrls.length > 0) {
        mergedData.videoUrls.forEach((url: string, index: number) => {
          console.log(`  Video ${index + 1}: ${url.substring(0, 60)}...`);
        });
      } else {
        console.log('  No videos in final list');
      }
      
      console.log('[API Route] Property data BEFORE calling updateProperty:', JSON.stringify(mergedData, null, 2));
      
      // Update property with merged data
      const updateResult = await propertyService.updateProperty(id, mergedData);
      console.log(`Update result for property ${id}: ${updateResult}`);
      
      // Return success response
      return new NextResponse(
        JSON.stringify({ success: true, message: 'Property updated successfully' }),
        { status: 200 }
      );
    }
    
    // If not multipart/form-data, assume it's application/json
    const jsonData = await request.json();
    
    // Update property with JSON data
    const updateResult = await propertyService.updateProperty(id, jsonData);
    console.log(`Update result from JSON update for property ${id}: ${updateResult}`);
    
    // Return success response
    return new NextResponse(
      JSON.stringify({ success: true, message: 'Property updated successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT property by ID:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get ID from params properly
    const { id } = await Promise.resolve(params);
    const propertyId = String(id || '');
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    const success = await propertyService.deleteProperty(propertyId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
