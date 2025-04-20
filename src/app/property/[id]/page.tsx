import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
// Components
import ImageGallery from '@/components/ImageGallery';
import PropertySpecs from '@/components/PropertySpecs';
import Container from '@/components/Container';
import Avatar from '@/components/Avatar';
import PropertyActions from '@/components/PropertyActions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Icons
import { FaLocationDot, FaMapMarkerAlt } from 'react-icons/fa6';
// Utilities
import { formatIndianPrice } from '@/utils/formatPrice';
// Services
import propertyService from '@/services/propertyService';
import Image from 'next/image';

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;  // Don't cache this page

// Define a type for the params
type PageParams = {
  id: string;
};

// Type for ImageItem used in the gallery
type ImageItem = {
  url: string;
  caption?: string;
};

// Modify the getPropertyDetails function for better error handling and reliability
async function getPropertyDetails(id: string) {
  try {
    console.log(`Fetching property details for ID: ${id}`);
    
    // Initialize a flag to track if API fetch succeeded
    let apiSuccess = false;
    let property = null;
    
    // Add a retry mechanism for API fetch
    const maxRetries = 2;
    let retryCount = 0;
    
    // Try direct service call first (more reliable for server components)
    try {
      console.log(`Using direct service call for property ${id}`);
      property = await propertyService.getPropertyById(id);
      
      if (property) {
        console.log(`Property data loaded via direct service:`, {
          title: property.title,
          images: property.images?.length || 0
        });
        return property;
      }
    } catch (serviceError) {
      console.error(`Direct service call failed, will try API as fallback: ${serviceError}`);
    }
    
    // Fall back to API if service call failed
    while (retryCount <= maxRetries && !apiSuccess) {
      try {
        // Add cache-busting timestamp to URL
        const timestamp = Date.now();
        
        // Must use absolute URL for server-side fetch
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000';
        const apiUrl = `${protocol}://${host}/api/properties/${id}?t=${timestamp}`;
        
        console.log(`Making API request to: ${apiUrl} (Attempt ${retryCount + 1}/${maxRetries + 1})`);
        
        // Fetch from API route with increased timeout (60 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          next: { revalidate: 0 },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Property not found');
            return null;
          }
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // Check if response is valid JSON
        const text = await response.text();
        console.log(`Response received. Text length: ${text.length}. First 100 chars: ${text.substring(0, 100)}...`);
        
        try {
          // Parse the JSON response
          property = JSON.parse(text);
          apiSuccess = true;
          
          console.log(`Property data loaded via API:`, {
            title: property.title,
            images: property.images?.length || 0,
            videoUrl: property.videoUrl ? 'Present' : 'Not present'
          });
          
          // If we have video URLs, process them
          if (property.videoUrls && Array.isArray(property.videoUrls) && property.videoUrls.length > 0) {
            console.log(`Processing multiple video URLs for property: ${property.title}`);
            
            // Add timestamps to each video URL to avoid caching issues
            const processedUrls = property.videoUrls.map((url: string, idx: number) => {
              const timestamp = Date.now() + idx;
              const baseUrl = url.split('?')[0]; // Remove existing query params
              const processedUrl = `${baseUrl}?t=${timestamp}`;
              console.log(`Processed ${idx === 0 ? 'main' : 'additional'} video URL ${idx + 1}: ${processedUrl}`);
              return processedUrl;
            });
            
            // Update the property object with processed URLs
            property.videoUrls = processedUrls;
            
            // Set the main videoUrl to the first one for backwards compatibility
            if (processedUrls.length > 0) {
              property.videoUrl = processedUrls[0];
            }
            
            console.log(`Total processed video URLs: ${processedUrls.length}`);
            console.log(`Found ${property.videoUrls.length} videos in videoUrls array`);
            console.log(`Total videos available for display: ${property.videoUrls.length}`);
          }
          
          break; // Exit the retry loop on success
        } catch (parseError) {
          console.error(`Error parsing JSON response: ${parseError}`);
          throw new Error(`Invalid JSON response from API: ${parseError}`);
        }
      } catch (fetchError: any) {
        // Increment retry counter
        retryCount++;
        
        if (fetchError.name === 'AbortError') {
          console.error(`API fetch attempt ${retryCount}/${maxRetries + 1} timed out after 60 seconds`);
        } else {
          console.error(`API fetch attempt ${retryCount}/${maxRetries + 1} failed: ${fetchError.message}`);
        }
        
        if (retryCount <= maxRetries) {
          console.log(`API fetch attempt ${retryCount}/${maxRetries + 1} failed, retrying...`);
          // Add a short delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        } else {
          console.log(`All ${maxRetries + 1} API fetch attempts failed.`);
        }
      }
    }
    
    return property;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error; // Re-throw to handle in the component
  }
}

// This component renders the property detail page
export default async function PropertyPage({ params }: { params: PageParams }) {
  // Get the property ID safely
  const { id } = await Promise.resolve(params);
  console.log(`Rendering property page for ID: ${id}`);
  
  if (!id) {
    notFound();
  }
  
  try {
    // Fetch the property data
    const property = await getPropertyDetails(id);
    
    if (!property) {
      console.log(`Property not found with ID: ${id}`);
      notFound();
    }
    
    // Process images to ensure they work with our ImageGallery component
    const galleryImages = property.images?.map((img: string | ImageItem) => {
      // Handle both string and object formats
      if (typeof img === 'string') {
        // Ensure we never pass empty strings as image URLs
        return { url: img || '/images/placeholder.jpg' };
      }
      // Ensure we never pass empty strings as image URLs
      return { url: img.url || '/images/placeholder.jpg', caption: img.caption };
    }) || [];
    
    // Process and validate video URLs
    const videoUrls: string[] = [];
    
    // Add the main videoUrl if it exists and is valid
    if (property.videoUrl && typeof property.videoUrl === 'string' && property.videoUrl.trim() !== '') {
      videoUrls.push(property.videoUrl);
    }
    
    // Add additional videoUrls if they exist
    if (Array.isArray(property.videoUrls) && property.videoUrls.length > 0) {
      // Filter out empty or invalid URLs
      property.videoUrls.forEach((url: string) => {
        if (url && typeof url === 'string' && url.trim() !== '' && !videoUrls.includes(url)) {
          videoUrls.push(url);
        }
      });
    }
    
    console.log('Processed video URLs:', {
      originalVideoUrl: property.videoUrl || 'none',
      originalVideoUrls: property.videoUrls?.length || 0,
      processedVideoUrls: videoUrls.length
    });
    
    // Format price for display
    const formattedPrice = property.price 
      ? formatIndianPrice(property.price)
      : 'Price on Request';

    // Capitalize property type
    const capitalizedPropertyType = property.propertyType 
      ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
      : '';

    return (
      <>
        <Header />
        <Container className="py-8 px-4 md:px-6">
          {/* Hero Section */}
          <div className="relative h-[40vh] md:h-[50vh]">
            <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div> {/* Increased opacity for better contrast */}
            <Image
              src={property.heroImage || property.images[0] || '/images/property-placeholder.jpg'}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-end pb-8">
              <div className="max-w-4xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
                  {property.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    <span className="text-sm sm:text-base">{property.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl font-bold">{formattedPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Image Gallery with increased height */}
            <div className="lg:col-span-8 mb-6 lg:mb-0">
              <div className="relative" style={{ height: "70vh" }}>
                <ImageGallery 
                  images={galleryImages} 
                  videoUrls={videoUrls || []}
                  height="100%"
                  aspectRatio="aspect-[16/9]"
                />
              </div>
            </div>
            
            {/* Right column - Property Details */}
            <div className="lg:col-span-4">
              <div className="flex flex-col space-y-4">
                {/* Location & Price Section */}
                <div className="mb-3 mt-3">
                  <h2 className="text-2xl font-bold mb-2 text-navy-800 border-l-4 border-navy-600 pl-3">Location & Price</h2>
                  <div className="flex justify-between items-center p-2 rounded-lg">
                    <div className="flex items-center gap-2 text-navy-700">
                      <FaLocationDot className="text-2xl text-navy-600 mr-3" />
                      <p className="font-semibold text-navy-800">{property.location || 'Uttarakhand'}</p>
                    </div>
                    <div className="ml-10 text-2xl font-bold text-emerald-700">{formattedPrice}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-navy-800 border-l-4 border-navy-600 pl-3">Property Specifications</h2>
                  <PropertySpecs
                    specifications={{
                      // Only pass bedrooms/bathrooms for non-plot properties
                      ...(property.propertyType?.toLowerCase() !== 'plot' && property.propertyType?.toLowerCase() !== 'land' ? {
                        bedrooms: Number(property.bedrooms || 0),
                        bathrooms: Number(property.bathrooms || 0)
                      } : {}),
                      // Always include these properties
                      area: Number(property.area || 0),
                      propertyType: capitalizedPropertyType || 'Plot',
                      // Include for all properties if available
                      landSize: property.landSize ? Number(property.landSize) : undefined,
                      naliSize: property.specs?.naliSize,
                      yearBuilt: property.yearBuilt ? Number(property.yearBuilt) : undefined,
                      view: property.view
                    }}
                    showPrice={false}
                  />
                </div>
                
                <div className="my-3">
                  <h2 className="text-2xl font-bold mb-2 text-navy-800 border-l-4 border-navy-600 pl-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed p-3 rounded-lg">{property.description || 'No description available.'}</p>
                  
                  {/* Book a Virtual Tour button */}
                  <div className="mt-3">
                    <a href="mailto:contact@uttarakhanddreams.com?subject=Virtual Tour Request for Property&body=I would like to schedule a virtual tour for this property" className="block w-full bg-navy-600 hover:bg-navy-700 text-white text-center py-3 px-4 rounded-lg font-medium">
                      Book a Virtual Tour
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* New layout with form on left, features and description on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10" id="contact-form">
            {/* Left column - Contact Form */}
            <div className="lg:col-span-5">
              <PropertyActions 
                property={property} 
                formattedPrice={formattedPrice} 
              />
            </div>

            {/* Right column - Property Features */}
            <div className="lg:col-span-7">
              {/* Property Features Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-navy-900 border-l-4 border-navy-600 pl-3">Property Features</h2>
                
                {/* Amenities Section with Table Format */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-navy-800">Amenities</h3>
                    <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="divide-y divide-gray-200">
                          {property.amenities.map((amenity: string, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-navy-700 w-1/2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                                  <span>{amenity}</span>
                                </div>
                              </td>
                              {index + 1 < property.amenities!.length && (index + 1) % 2 === 1 && (
                                <td className="px-4 py-3 text-sm text-navy-700 w-1/2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                                    <span>{property.amenities![index + 1]}</span>
                                  </div>
                                </td>
                              )}
                            </tr>
                          )).filter((_: React.ReactNode, i: number) => i % 2 === 0)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Features Section with Table Format */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-8">
                    <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="divide-y divide-gray-200">
                          {property.features.map((feature: string, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-navy-700 w-1/2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                                  <span>{feature}</span>
                                </div>
                              </td>
                              {index + 1 < property.features!.length && (index + 1) % 2 === 1 && (
                                <td className="px-4 py-3 text-sm text-navy-700 w-1/2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                                    <span>{property.features![index + 1]}</span>
                                  </div>
                                </td>
                              )}
                            </tr>
                          )).filter((_: React.ReactNode, i: number) => i % 2 === 0)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </>
    );
  } catch (error) {
    console.error(`Error loading property with ID: ${id}:`, error);
    notFound();
  }
}
