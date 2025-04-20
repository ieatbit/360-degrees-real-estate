import { PropertyService } from '@/lib/services/PropertyService';

// Create a singleton instance of PropertyService
const propertyService = new PropertyService(null);

// Helper method to get property files
propertyService.getPropertyFiles = async (propertyId: string) => {
  try {
    const property = await propertyService.getPropertyById(propertyId);
    return {
      images: property?.images || [],
      videoUrl: property?.videoUrl
    };
  } catch (error) {
    console.error(`Error getting property files for ${propertyId}:`, error);
    return { images: [], videoUrl: undefined };
  }
};

// Override the updateProperty method to ensure proper updates
const originalUpdateProperty = propertyService.updateProperty;
propertyService.updateProperty = async (id: string, propertyData: any) => {
  console.log(`Updating property ${id} with data:`, {
    title: propertyData.title,
    hasImages: !!propertyData.images?.length,
    hasVideo: !!propertyData.videoUrl
  });
  
  // Force timestamps to be updated
  if (!propertyData.updatedAt) {
    propertyData.updatedAt = new Date().toISOString();
  }
  
  // Call the original method
  const result = await originalUpdateProperty.call(propertyService, id, propertyData);
  
  // Log the result for debugging
  console.log(`Update result for property ${id}:`, result);
  
  return result;
};

// Export the singleton instance
export default propertyService; 