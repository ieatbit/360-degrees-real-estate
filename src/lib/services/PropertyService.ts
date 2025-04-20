import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { UPLOADS_DIR, ensureUploadsDir, saveUploadedFile, removePropertyFiles } from '@/lib/utils';

// Mock database for development purposes
// In production, this would be replaced with a real database connection
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'properties.json');

// Property type definition
export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  description: string;
  features: string[];
  specs: {
    bedrooms: string;
    bathrooms: string;
    area: string;
    landSize: string; // Now measured in Nali
  };
  amenities: string[];
  images: string[];
  category: 'buy' | 'lease';
  propertyType: string;
  createdAt: string;
  updatedAt: string;
  videoUrl?: string;
  videoUrls?: string[];
  // Additional plot-specific fields
  dimensions?: string;
  facing?: string;
  waterSource?: string;
  roadAccess?: string;
  electricity?: string;
  view?: string;
  bedrooms?: string; // Optional for backward compatibility
}

// Filter type for property searches
export type PropertyFilter = {
  category?: 'buy' | 'lease';
  location?: string;
  propertyType?: string;
  bhkOption?: string;
  priceMin?: string;
  priceMax?: string;
};

export class PropertyService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // Helper method to ensure directories exist
  private async ensureDirectories() {
    try {
      // Ensure data directory
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      try {
        await fs.access(DATA_FILE_PATH);
      } catch (error) {
        // File doesn't exist, create it with empty array
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify([]));
      }
      
      // Ensure uploads directory
      await ensureUploadsDir();
    } catch (error) {
      console.error('Error ensuring directories exist:', error);
      throw error;
    }
  }

  // Helper method to handle file uploads
  private async handleFileUploads(files: { 
    imageFiles?: File[] | undefined, 
    videoFile?: File | undefined 
  }, propertyId: string): Promise<{ images: string[], videoUrl?: string }> {
    const result: { images: string[], videoUrl?: string } = { images: [] };
    
    try {
      console.log(`Processing uploads for property ${propertyId}`);
      console.log(`Processing ${files.imageFiles?.length || 0} image files and ${files.videoFile ? 1 : 0} video files`);
      
      // Create property-specific upload folder
      const propertyDir = await ensureUploadsDir(propertyId);
      console.log(`Ensured property upload directory: ${propertyDir}`);
      
      // Process image files
      if (files.imageFiles && files.imageFiles.length > 0) {
        console.log(`Processing ${files.imageFiles.length} image files`);
        
        for (let i = 0; i < files.imageFiles.length; i++) {
          const file = files.imageFiles[i];
          console.log(`Saving image ${i}: ${file.name}, type: ${file.type}, size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
          
          try {
            // Save the file and get its URL
            const fileUrl = await saveUploadedFile(file, propertyDir, `image-${i}`);
            
            // Add to images array
            result.images.push(fileUrl);
            console.log(`Successfully saved image ${i} to: ${fileUrl}`);
          } catch (err) {
            console.error(`Error saving image ${i}:`, err);
          }
        }
        
        console.log(`Saved ${result.images.length} images`);
      } else {
        console.log('No image files to process');
      }
      
      // Process video file
      if (files.videoFile) {
        const videoFile = files.videoFile;
        const videoKey = 'video';
        console.log(`Processing video file: ${videoFile.name}, type: ${videoFile.type}, size: ${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`);
        
        try {
          // Save the video with consistent key
          const videoUrl = await saveUploadedFile(videoFile, propertyDir, videoKey);
          
          // Set video URL with cache-busting parameter
          const timestamp = Date.now();
          result.videoUrl = videoUrl.includes('?') ? `${videoUrl}&t=${timestamp}` : `${videoUrl}?t=${timestamp}`;
          
          console.log(`Successfully saved video to: ${result.videoUrl}`);
        } catch (err) {
          console.error('Error saving video file:', err);
        }
      } else {
        console.log('No video file to process');
      }
      
      return result;
    } catch (error) {
      console.error('Error handling file uploads:', error);
      throw error;
    }
  }

  // Get all properties without filtering
  async getAllProperties(): Promise<Property[]> {
    try {
      await this.ensureDirectories();
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting all properties:', error);
      return [];
    }
  }

  // Get all properties with optional filtering
  async getProperties(filters?: PropertyFilter): Promise<Property[]> {
    try {
      await this.ensureDirectories();
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      let properties: Property[] = JSON.parse(data);

      console.log('Total properties before filtering:', properties.length);
      
      if (filters && Object.keys(filters).length > 0) {
        console.log('Applying filters:', JSON.stringify(filters));
        
        // Define all properties' locations for debugging if a location filter is present
        if (filters.location) {
          console.log('All location values in database:', properties.map(p => p.location));
        }
        
        return properties.filter(property => {
          // Debug each property we're checking
          console.log(`Checking property: ${property.id}, location: "${property.location}"`);
          
          // Category filter - exact match required
          if (filters.category && property.category !== filters.category) {
            console.log(`Property ${property.id} excluded: Category mismatch - "${property.category}" vs "${filters.category}"`);
            return false;
          }

          // Location filter - handle with extreme care
          if (filters.location) {
            // Don't lowercase or trim here - compare exact strings
            console.log(`Comparing locations - Property: "${property.location}" with Filter: "${filters.location}"`);
            
            // Check if the full location contains our filter location
            // For example, "Basot, Uttarakhand" should match filter "Basot"
            const propertyLocationParts = property.location.split(',').map(part => part.trim().toLowerCase());
            const filterLocationLower = filters.location.toLowerCase();
            
            // Check if any part of the location matches
            const locationMatches = propertyLocationParts.some(part => 
              part.toLowerCase() === filterLocationLower);
            
            if (!locationMatches) {
              console.log(`Property ${property.id} EXCLUDED: Location "${property.location}" doesn't match filter "${filters.location}"`);
              return false;
            } else {
              console.log(`Property ${property.id} INCLUDED: Location "${property.location}" matches filter "${filters.location}"`);
            }
          }

          // Property type filter
          if (filters.propertyType && filters.propertyType.trim() !== '') {
            const propertyType = property.propertyType.toLowerCase();
            const filterPropertyType = filters.propertyType.toLowerCase().trim();
            
            if (propertyType !== filterPropertyType) {
              console.log(`Property ${property.id} excluded: Property type mismatch - "${propertyType}" vs "${filterPropertyType}"`);
              return false;
            }
          }
          
          // Filter by BHK option (bedrooms)
          if (filters.bhkOption && filters.bhkOption.trim() !== '') {
            const propertyBedrooms = property.specs?.bedrooms || property.bedrooms;
            const bhkValue = propertyBedrooms ? propertyBedrooms.toString().trim() : '';
            
            if (bhkValue && bhkValue !== filters.bhkOption) {
              console.log(`Property ${property.id} excluded: BHK mismatch - "${bhkValue}" vs "${filters.bhkOption}"`);
              return false;
            }
          }

          // Price min filter
          if (filters.priceMin && filters.priceMin.trim() !== '') {
            const priceStr = property.price.replace(/[^\d]/g, '');
            const price = parseInt(priceStr, 10) || 0;
            const minPrice = parseInt(filters.priceMin, 10) || 0;
            
            if (price < minPrice) {
              console.log(`Property ${property.id} excluded: Price too low - ${price} < ${minPrice}`);
              return false;
            }
          }

          // Price max filter
          if (filters.priceMax && filters.priceMax.trim() !== '') {
            const priceStr = property.price.replace(/[^\d]/g, '');
            const price = parseInt(priceStr, 10) || 0;
            const maxPrice = parseInt(filters.priceMax, 10) || 0;
            
            if (maxPrice > 0 && price > maxPrice) {
              console.log(`Property ${property.id} excluded: Price too high - ${price} > ${maxPrice}`);
              return false;
            }
          }

          return true;
        });
      }

      return properties;
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      await this.ensureDirectories();
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      const properties: Property[] = JSON.parse(data);
      return properties.find(p => p.id === id) || null;
    } catch (error) {
      console.error(`Error getting property ${id}:`, error);
      throw error;
    }
  }

  // Create a new property
  async createProperty(propertyData: any): Promise<string> {
    try {
      await this.ensureDirectories();
      
      // Extract the basic property data
      const { title, price, location, description, features, specs, amenities, category, propertyType, imageFiles, videoFile } = propertyData;
      
      // Make sure specs is properly structured
      const formattedSpecs = {
        bedrooms: specs?.bedrooms || "0",
        bathrooms: specs?.bathrooms || "0",
        area: specs?.area || "0 sq ft",
        landSize: specs?.landSize || "0 Nali"
      };
      
      // Generate UUID for new property
      const id = uuidv4();
      const now = new Date().toISOString();
      
      // Create new property object
      const newProperty: Property = {
        id,
        title: title || '',
        price: price || '',
        location: location || '',
        description: description || '',
        features: features || [],
        specs: formattedSpecs,
        amenities: amenities || [],
        images: [],
        category: category || 'buy',
        propertyType: propertyType || 'plot',
        createdAt: now,
        updatedAt: now,
        // Add plot-specific fields if provided
        dimensions: propertyData.dimensions,
        facing: propertyData.facing,
        waterSource: propertyData.waterSource,
        roadAccess: propertyData.roadAccess,
        electricity: propertyData.electricity,
        view: propertyData.view
      };
      
      // Handle file uploads
      if (imageFiles || videoFile) {
        const uploadResults = await this.handleFileUploads(
          { imageFiles, videoFile },
          id
        );
        newProperty.images = uploadResults.images;
        newProperty.videoUrl = uploadResults.videoUrl;
      }
      
      // Get existing properties
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      const properties: Property[] = JSON.parse(data);
      
      // Add new property
      properties.push(newProperty);
      
      // Save to file
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(properties, null, 2));
      
      return id;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update an existing property
   */
  async updateProperty(
    id: string, 
    propertyData: Partial<Property> & { 
      imageFiles?: File[], 
      videoFile?: File,
      hasVideo?: boolean
    }
  ): Promise<boolean> {
    try {
      console.log(`Starting property update for ID: ${id}`);
      
      await this.ensureDirectories();
      
      // Get the current data
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      const properties: Property[] = JSON.parse(data);
      
      // Find the property to update
      const index = properties.findIndex(p => p.id === id);
      if (index === -1) {
        console.log(`Property not found with ID: ${id}`);
        return false;
      }
      
      const existingProperty = properties[index];
      console.log(`Found existing property: ${existingProperty.title} (ID: ${id})`);
      
      // Create an updated property object
      const updatedProperty = {
        ...existingProperty,
        ...propertyData,
        id // Ensure ID doesn't change
      };
      
      // Handle files if present
      if (propertyData.imageFiles?.length || propertyData.videoFile) {
        console.log(`Processing files for property update: ${propertyData.imageFiles?.length || 0} images, ${propertyData.videoFile ? 1 : 0} video`);
        
        const files = {
          imageFiles: propertyData.imageFiles,
          videoFile: propertyData.videoFile
        };
        
        try {
          // Upload files and get URLs
          const { images, videoUrl } = await this.handleFileUploads(files, id);
          
          // Update property with new files if available
          if (images.length > 0) {
            updatedProperty.images = [...images]; // Use only new images
            console.log(`Updated property with ${images.length} new images`);
          }
          
          if (videoUrl) {
            updatedProperty.videoUrl = videoUrl;
            
            // Also update videoUrls array if it exists
            if (!updatedProperty.videoUrls) {
              updatedProperty.videoUrls = [videoUrl];
            } else if (!updatedProperty.videoUrls.includes(videoUrl)) {
              updatedProperty.videoUrls.push(videoUrl);
            }
            
            console.log(`Updated property with new video URL: ${videoUrl}`);
          }
        } catch (fileError) {
          console.error('Error processing files during property update:', fileError);
          // Continue with update even if file processing fails
        }
      }
      
      // If explicit videoUrls are provided, use them directly
      if (propertyData.videoUrls) {
        updatedProperty.videoUrls = propertyData.videoUrls;
        
        // Also update the main videoUrl for backward compatibility
        if (propertyData.videoUrls.length > 0 && !propertyData.videoUrl) {
          updatedProperty.videoUrl = propertyData.videoUrls[0];
        }
        console.log(`Updated property with ${propertyData.videoUrls.length} video URLs`);
      }
      
      // Update the property in the array
      properties[index] = updatedProperty;
      
      // Save the updated array back to file
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(properties, null, 2));
      console.log(`Property data saved successfully for ID: ${id}`);
      
      return true;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  }

  // Delete property by ID
  async deleteProperty(id: string): Promise<boolean> {
    try {
      await this.ensureDirectories();
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      const properties: Property[] = JSON.parse(data);
      
      const index = properties.findIndex(p => p.id === id);
      if (index === -1) {
        return false;
      }

      // Delete associated files
      await removePropertyFiles(id);

      properties.splice(index, 1);
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(properties, null, 2));
      return true;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  }

  // Get property files (images and video URLs)
  async getPropertyFiles(propertyId: string): Promise<{ images: string[]; videoUrl?: string }> {
    try {
      const property = await this.getPropertyById(propertyId);
      return {
        images: property?.images || [],
        videoUrl: property?.videoUrl
      };
    } catch (error) {
      console.error(`Error getting property files for ${propertyId}:`, error);
      return { images: [], videoUrl: undefined };
    }
  }

  // Get total count of properties
  async getTotalCount(): Promise<number> {
    try {
      await this.ensureDirectories();
      const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
      const properties: Property[] = JSON.parse(data);
      return properties.length;
    } catch (error) {
      console.error('Error getting property count:', error);
      return 0;
    }
  }

  async getAllPropertiesWithFilters(filters: any = {}) {
    console.log('API: Using filters:', filters);
    console.log('API: Filter non-empty keys:', Object.keys(filters).filter(k => filters[k] !== null && filters[k] !== undefined));
    
    try {
      // Get all properties
      const properties = await this.getAllProperties();
      
      console.log('Total properties before filtering:', properties.length);
      
      // Apply filters if needed
      let filteredProperties = [...properties];
      
      // Filter by category
      if (filters.category) {
        console.log(`Filtering by category: "${filters.category}"`);
        filteredProperties = filteredProperties.filter(p => 
          p.category?.toLowerCase() === filters.category.toLowerCase()
        );
        console.log(`After category filter (${filters.category}): ${filteredProperties.length} properties`);
      }
      
      // Filter by location - case-insensitive match
      if (filters.location) {
        console.log(`Filtering by location: "${filters.location}"`);
        const searchLocation = filters.location.toLowerCase().trim();
        
        // Special case for Uttarakhand - include all Uttarakhand properties
        if (searchLocation === 'uttarakhand') {
          console.log('Using special case for Uttarakhand - including all Uttarakhand properties');
          // This is the simplified approach - assuming all properties are in Uttarakhand
          // If you have properties from other states, you'll need to filter them out
          
          // Option 1: Return all properties if all are in Uttarakhand
          // Leave filteredProperties as is - no filtering
          
          // Option 2: Filter for properties with Uttarakhand locations
          // Define all Uttarakhand locations, cities, and areas
          const uttarakhandLocations = [
            'uttarakhand', 'uttrakhand', 'dehradun', 'nainital', 'mussoorie', 'haridwar', 
            'rishikesh', 'almora', 'ranikhet', 'bhimtal', 'pithoragarh', 
            'tehri', 'chamoli', 'rudraprayag', 'uttarkashi', 'bageshwar', 
            'champawat', 'corbett', 'ramnagar', 'binsar', 'mukteshwar', 'garhwal', 'kumaon'
          ];
          
          filteredProperties = filteredProperties.filter(p => {
            if (!p.location) return false;
            
            const propertyLocation = p.location.toLowerCase().trim();
            
            // Check if the property location contains any of the Uttarakhand locations
            const isUttarakhandProperty = uttarakhandLocations.some(place => 
              propertyLocation.includes(place)
            );
            
            console.log(`Location "${p.location}" is in Uttarakhand: ${isUttarakhandProperty}`);
            return isUttarakhandProperty;
          });
          
          console.log(`After Uttarakhand filter: ${filteredProperties.length} properties`);
        } else {
          // Regular location filtering for non-Uttarakhand searches
          filteredProperties = filteredProperties.filter(p => {
            if (!p.location) return false;
            
            // Convert property location to lowercase for case-insensitive comparison
            const propertyLocation = p.location.toLowerCase().trim();
            
            // Try exact match on the whole location (case insensitive)
            const exactMatch = propertyLocation === searchLocation;
            
            // Try matching city/village/area name parts (if comma-separated)
            const locationParts = propertyLocation.split(',').map(part => part.trim());
            const partialMatch = locationParts.some(part => part === searchLocation);
            
            const match = exactMatch || partialMatch;
            console.log(`Location "${p.location}" match with "${filters.location}": ${match}`);
            return match;
          });
          
          console.log(`After location filter (${filters.location}): ${filteredProperties.length} properties`);
        }
      }
      
      // Filter by property type - exact match
      if (filters.propertyType) {
        console.log(`Filtering by property type: "${filters.propertyType}"`);
        const searchType = filters.propertyType.toLowerCase().trim();
        
        filteredProperties = filteredProperties.filter(p => {
          if (!p.propertyType) return false;
          
          const propType = p.propertyType.toLowerCase().trim();
          const match = propType === searchType;
          console.log(`Property type "${p.propertyType}" match with "${filters.propertyType}": ${match}`);
          return match;
        });
        
        console.log(`After property type filter (${filters.propertyType}): ${filteredProperties.length} properties`);
      }
      
      // Filter by min price
      if (filters.priceMin) {
        console.log(`Filtering by min price: ${filters.priceMin}`);
        
        const min = parseInt(filters.priceMin, 10);
        if (!isNaN(min)) {
          filteredProperties = filteredProperties.filter(p => {
            if (!p.price) return false;
            
            // Handle various price formats
            let numericPrice;
            const priceStr = p.price.toString();
            
            if (priceStr.includes('Cr') || priceStr.includes('cr')) {
              // Convert crore to absolute value (1 crore = 10,000,000)
              const match = priceStr.match(/(\d+(\.\d+)?)/);
              const value = match ? parseFloat(match[0]) : 0;
              numericPrice = value * 10000000;
              console.log(`Converting ${p.id} price ${value}Cr to ${numericPrice}`);
            } 
            else if (priceStr.includes('L') || priceStr.includes('l') || priceStr.includes('Lakh')) {
              // Convert lakh to absolute value (1 lakh = 100,000)
              const match = priceStr.match(/(\d+(\.\d+)?)/);
              const value = match ? parseFloat(match[0]) : 0;
              numericPrice = value * 100000;
              console.log(`Converting ${p.id} price ${value}L to ${numericPrice}`);
            } 
            else {
              // Direct numeric conversion
              numericPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
            }
            
            const result = numericPrice >= min;
            console.log(`Price comparison ${p.id}: ${numericPrice} >= ${min}: ${result}`);
            return result;
          });
          console.log(`After min price filter (${filters.priceMin}): ${filteredProperties.length} properties`);
        }
      }
      
      // Filter by max price
      if (filters.priceMax) {
        console.log(`Filtering by max price: ${filters.priceMax}`);
        
        const max = parseInt(filters.priceMax, 10);
        if (!isNaN(max)) {
          filteredProperties = filteredProperties.filter(p => {
            if (!p.price) return false;
            
            // Handle various price formats
            let numericPrice;
            const priceStr = p.price.toString();
            
            if (priceStr.includes('Cr') || priceStr.includes('cr')) {
              // Convert crore to absolute value (1 crore = 10,000,000)
              const match = priceStr.match(/(\d+(\.\d+)?)/);
              const value = match ? parseFloat(match[0]) : 0;
              numericPrice = value * 10000000;
              console.log(`Converting ${p.id} price ${value}Cr to ${numericPrice}`);
            } 
            else if (priceStr.includes('L') || priceStr.includes('l') || priceStr.includes('Lakh')) {
              // Convert lakh to absolute value (1 lakh = 100,000)
              const match = priceStr.match(/(\d+(\.\d+)?)/);
              const value = match ? parseFloat(match[0]) : 0;
              numericPrice = value * 100000;
              console.log(`Converting ${p.id} price ${value}L to ${numericPrice}`);
            } 
            else {
              // Direct numeric conversion
              numericPrice = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
            }
            
            const result = numericPrice <= max;
            console.log(`Price comparison ${p.id}: ${numericPrice} <= ${max}: ${result}`);
            return result;
          });
          console.log(`After max price filter (${filters.priceMax}): ${filteredProperties.length} properties`);
        }
      }
      
      console.log(`API: Found ${filteredProperties.length} properties matching filters from total of ${properties.length}`);
      return filteredProperties;
    } catch (error) {
      console.error('Error in getAllPropertiesWithFilters:', error);
      return [];
    }
  }
} 