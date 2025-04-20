import { Metadata } from 'next';
import propertyService from '@/services/propertyService';

// Define a type for the params
type PageParams = {
  id: string;
};

async function getPropertyDetails(id: string) {
  try {
    // Use direct service call for metadata - simpler than API call
    const property = await propertyService.getPropertyById(id);
    return property;
  } catch (error) {
    console.error('Error fetching property details for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  try {
    const property = await getPropertyDetails(id);
    
    if (!property) {
      return {
        title: 'Property Not Found | Uttarakhand Dreams',
        description: 'The requested property could not be found',
      };
    }
    
    return {
      title: `${property.title || 'Property'} | Uttarakhand Dreams`,
      description: property.description || 'Discover your dream property in the beautiful Uttarakhand region.',
    };
  } catch (error) {
    return {
      title: 'Property | Uttarakhand Dreams',
      description: 'Find your dream property in Uttarakhand',
    };
  }
} 