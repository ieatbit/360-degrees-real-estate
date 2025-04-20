export const dynamic = "force-dynamic";
// Enable dynamic options fetching
import { NextResponse, NextRequest } from 'next/server';
import propertyService from '@/services/propertyService';

export async function GET(req: NextRequest) {
  try {
    console.log('API: Fetching property options (locations and property types)');

    // Get all properties
    const properties = await propertyService.getProperties();

    // Extract and normalize location names (usually city names)
    const locationSet = new Set<string>();
    properties.forEach((property: any) => {
      if (property.location) {
        // Extract first part of location (usually the city name)
        const locationParts = property.location.split(',');
        const city = locationParts[0].trim();
        
        // Add the full location and also just the city part
        if (city) {
          locationSet.add(city);
        }
        
        // Also add Uttarakhand as a location option if it's not already in the set
        if (property.location.toLowerCase().includes('uttarakhand')) {
          locationSet.add('Uttarakhand');
        }
      }
    });
    
    // Convert Set to sorted Array
    const locations = Array.from(locationSet).sort();

    // Extract unique property types - using Array.from to safely iterate over Set
    const propertyTypeSet = new Set<string>();
    properties.forEach((property: any) => {
      if (property.propertyType) {
        propertyTypeSet.add(property.propertyType.toLowerCase());
      }
    });
    
    // Convert Set to Array and capitalize first letter
    const propertyTypes = Array.from(propertyTypeSet).sort().map((type: string) => 
      type.charAt(0).toUpperCase() + type.slice(1)
    );

    // Ensure we have some default values if no data is found
    const finalLocations = locations.length > 0 ? locations : ['Uttarakhand', 'Dehradun', 'Nainital', 'Mussoorie'];
    const finalPropertyTypes = propertyTypes.length > 0 ? propertyTypes : ['House', 'Apartment', 'Plot', 'Land'];

    console.log(`API: Found ${finalLocations.length} unique locations and ${finalPropertyTypes.length} unique property types`);

    return NextResponse.json({
      locations: finalLocations,
      propertyTypes: finalPropertyTypes
    });
  } catch (error) {
    console.error('API Error fetching property options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property options' },
      { status: 500 }
    );
  }
}
       
