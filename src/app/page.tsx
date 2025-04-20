'use client';

import React, { useEffect, useState, useLayoutEffect } from 'react';
// @ts-ignore
import Header from '@/components/Header';
// @ts-ignore
import Footer from '@/components/Footer';
// @ts-ignore
import SearchFilter from '@/components/SearchFilter';
// @ts-ignore
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';
// @ts-ignore
import type { Property } from '@/types';
// @ts-ignore
import type { HomePageContent } from '@/types';
// @ts-ignore
import { formatIndianPrice } from '@/utils/formatPrice';
// @ts-ignore
import { formatAreaDisplay } from '@/utils/areaConversion';
import { useRouter } from 'next/navigation';
// @ts-ignore
import EarthLogo from '@/components/EarthLogo';
import Image from 'next/image';

// Create a type that matches what PropertyCard needs
type PropertyCardData = {
  id: string;
  title: string;
  price: string;
  location: string;
  specs: {
    bedrooms?: string;
    bathrooms?: string;
    area: string;
    landSize?: string;
  };
  has360Tour: boolean;
  imageUrl: string;
  propertyType: string;
};

// Helper function to convert API Property to PropertyCard format
const convertToCardFormat = (property: Property): PropertyCardData => {
  // Determine if it's a plot/land property
  const propertyType = property.propertyType ? property.propertyType.toLowerCase() : '';
  const isPlotOrLand = propertyType.includes('plot') || propertyType.includes('land');
  const isFlat = propertyType.includes('flat') || propertyType.includes('apartment');
  
  // Extract specs if available (admin interface saves to specs object)
  const specs = property.specs || {};
  
  // Format area display based on property type - always include sq ft for non-Nali values
  const areaDisplay = property.area ? `${property.area.toLocaleString()} sq ft` : 
                     (specs.area ? `${specs.area} sq ft` : '');
                     
  // For plot/land properties, use landSize (sq ft) for the area display
  const plotAreaDisplay = specs.landSize || specs.plotSize || specs.plotDimensions || '0 sq ft';
  
  // Format land size properly for display using specs
  let formattedLandSize: string;
  
  // Check for naliSize first - this is our preferred field for Nali values
  if (specs.naliSize) {
    // Ensure it has "Nali" suffix 
    formattedLandSize = specs.naliSize.toString().includes('Nali') ? 
      specs.naliSize.toString() : `${specs.naliSize} Nali`;
  } 
  // Then check for landSize field
  else if (property.landSize) {
    // Check if it's already in Nali format
    if (String(property.landSize).includes('Nali')) {
      formattedLandSize = String(property.landSize);
    } else {
      // Convert landSize to Nali if it's a number
      const landSizeNum = parseFloat(String(property.landSize));
      if (!isNaN(landSizeNum)) {
        // Approximate conversion: 1 Nali ≈ 2160 sq ft
        const naliValue = landSizeNum / 2160;
        formattedLandSize = `${naliValue.toFixed(2)} Nali`;
      } else {
        // If not a number, just use as is with Nali suffix
        formattedLandSize = `${property.landSize} Nali`;
      }
    }
  } 
  // Fall back to default
  else {
    formattedLandSize = isPlotOrLand ? '5 Nali' : '';
  }

  // Extract values from specs if available - only for appropriate property types
  const bedroomValue = isPlotOrLand ? '' : (specs.bedrooms || property.bedrooms || '');
  const bathroomValue = isPlotOrLand ? '' : (specs.bathrooms || property.bathrooms || '');
  
  return {
    id: property.id,
    title: property.title,
    price: property.price ? formatIndianPrice(property.price) : 'Price on Request',
    location: property.location,
    specs: {
      // Set bedrooms/bathrooms for appropriate property types, not for plots/land
      bedrooms: (!isPlotOrLand && bedroomValue) ? `${bedroomValue} BHK` : undefined,
      bathrooms: (!isPlotOrLand && bathroomValue) ? `${bathroomValue} Bath` : undefined,
      // For plots/land, show sq ft area (set to plotAreaDisplay for plots)
      area: isPlotOrLand ? plotAreaDisplay : areaDisplay,
      landSize: formattedLandSize // Always include landSize when available
    },
    has360Tour: false,
    imageUrl: property.images?.[0] || '/images/property-placeholder.svg',
    propertyType: property.propertyType || ''
  };
};

// Fallback properties if API fails
const mockProperties: PropertyCardData[] = [
    {
      id: '1',
    title: 'Mountain View Plot',
      price: '₹ 1,25,00,000',
      location: 'Nainital, Uttarakhand',
      specs: {
        area: '2500 sq.ft',
      landSize: '10'
      },
      has360Tour: true,
    imageUrl: '/images/property-1.svg',
    propertyType: 'plot'
    },
    {
      id: '2',
    title: 'Lakeside Land',
      price: '₹ 95,00,000',
      location: 'Bhimtal, Uttarakhand',
      specs: {
        area: '1800 sq.ft',
      landSize: '7'
      },
      has360Tour: true,
    imageUrl: '/images/property-placeholder.svg',
    propertyType: 'land'
    },
    {
      id: '3',
    title: 'Valley View Plot',
      price: '₹ 1,35,00,000',
      location: 'Almora, Uttarakhand',
      specs: {
        area: '2800 sq.ft',
      landSize: '12'
      },
      has360Tour: true,
    imageUrl: '/images/property-placeholder.svg',
    propertyType: 'plot'
  }
];

// Define a type for search filters
type SearchFilters = {
  category?: string | null;
  location?: string | null;
  propertyType?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  propertySize?: string | null;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial page load
  const [properties, setProperties] = useState<Property[]>([]);
  const [homeContent, setHomeContent] = useState<HomePageContent | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<PropertyCardData[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('/images/uttarakhand-bg.svg');
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  
  // Preload the hero image
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    const preloadHeroImage = () => {
      // Create a new image object
      const img = new window.Image();
      
      // Set up the onload callback
      img.onload = () => {
        console.log('Hero image loaded successfully');
        setHeroImageLoaded(true);
      };
      
      // Set up the onerror callback
      img.onerror = () => {
        console.error('Failed to load hero image:', heroImageUrl);
        setHeroImageLoaded(true); // Still set to true to show fallback gradient
      };
      
      // Start loading the image
      img.src = heroImageUrl;
      
      // If the image is already cached, the onload event might not fire
      if (img.complete) {
        console.log('Hero image loaded from cache');
        setHeroImageLoaded(true);
      }
    };
    
    // Start preloading immediately
    preloadHeroImage();
    
    // Clean up function not needed for image preloading
  }, [heroImageUrl]);
  
  // Fallback hero image if main one fails to load
  useEffect(() => {
    // If hero image doesn't load within 3 seconds, show the fallback
    const timeoutId = setTimeout(() => {
      if (!heroImageLoaded) {
        console.log('Forcing hero image loaded state after timeout');
        setHeroImageLoaded(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [heroImageLoaded]);
  
  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        console.log('Using base URL for API calls:', baseUrl);
        
        const [propertiesResponse, homeContentResponse, settingsResponse] = await Promise.all([
          fetch(`${baseUrl}/api/properties`),
          fetch(`${baseUrl}/api/home-content`),
          fetch(`${baseUrl}/api/settings`)
        ]);

        // Process all response data
        const propertiesData = propertiesResponse.ok ? await propertiesResponse.json() : [];
        const homeContentData = homeContentResponse.ok ? await homeContentResponse.json() : null;
        const settings = settingsResponse.ok ? await settingsResponse.json() : null;
        
        setProperties(propertiesData);
        setHomeContent(homeContentData);
        
        // Get hero image URL
        if (homeContentData?.mainImage) {
          setHeroImageUrl(homeContentData.mainImage);
        }
        
        // Set featured properties from API data with proper format conversion
        let featured = [];
        if (propertiesData.length > 0) {
          // Get properties with featured flag
          const featuredItems = propertiesData
            .filter((property: Property) => property.featured)
            .map(convertToCardFormat);
          
          // Sort featured properties by the featuredOrder property
          if (featuredItems.length > 0) {
            featured = [...featuredItems].sort((a, b) => {
              // Get the original property to access featuredOrder
              const propA = propertiesData.find((p: Property) => p.id === a.id);
              const propB = propertiesData.find((p: Property) => p.id === b.id);
              
              // Default to max value if featuredOrder is not set
              const orderA = propA?.featuredOrder || Number.MAX_SAFE_INTEGER;
              const orderB = propB?.featuredOrder || Number.MAX_SAFE_INTEGER;
              
              // Sort by featuredOrder (ascending)
              return orderA - orderB;
            });
          } else {
            // Show up to 6 properties if no featured ones are available
            // Sort by creation date descending (newest first)
            const sortedData = [...propertiesData].sort((a, b) => {
              if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }
              return 0;
            });
            
            featured = sortedData.slice(0, 6).map(convertToCardFormat);
          }
        }
        
        if (featured.length > 0) {
          setFeaturedProperties(featured);
          setLoading(false);
          // Only mark as fully loaded when we have real data
          setInitialLoading(false);
        } else {
          // Don't immediately set mock properties - wait a bit to avoid flash
          const timer = setTimeout(() => {
            console.log('No featured properties found after timeout, using fallbacks');
            setFeaturedProperties(mockProperties);
            setLoading(false);
            setInitialLoading(false); // Finally stop showing initial loader
          }, 2000); // Wait 2 seconds before showing mock properties
          
          // Clear the timeout if component unmounts
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use fallback data on error, but with a delay
        setTimeout(() => {
          setFeaturedProperties(mockProperties);
          setLoading(false);
          setInitialLoading(false); // Finally stop showing initial loader
        }, 2000);
      }
    }
    
    fetchData();
  }, []);

  // Handle search function
  const handleSearch = (filters: SearchFilters) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.set('category', filters.category);
    
    if (filters.location) {
      const locationValue = filters.location.toString().trim();
      queryParams.set('location', locationValue);
    }
    
    if (filters.propertyType) {
      const propertyTypeValue = filters.propertyType.toString().trim();
      queryParams.set('propertyType', propertyTypeValue);
    }
    
    if (filters.minPrice) {
      const priceMin = filters.minPrice.toString().trim();
      if (priceMin && !isNaN(Number(priceMin))) {
        queryParams.set('priceMin', priceMin);
      }
    }
    
    if (filters.maxPrice) {
      const priceMax = filters.maxPrice.toString().trim();
      if (priceMax && !isNaN(Number(priceMax))) {
        queryParams.set('priceMax', priceMax);
      }
    }
    
    if (filters.propertySize) queryParams.set('propertySize', filters.propertySize);
    
    // Add timestamp to prevent caching
    queryParams.set('t', Date.now().toString());
    
    // Navigate to properties page with search parameters
    router.push(`/properties?${queryParams.toString()}`);
  };

  // Show full-page loader until everything is ready
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="flex flex-col items-center">
          <div className="mt-4 text-white text-xl">Loading your experience...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />
      
      <main>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
        <div className="absolute inset-0">
          {homeContent?.heroBackgroundImage ? (
            <Image
              src={homeContent.heroBackgroundImage}
              alt="Himalayan Properties"
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-blue-600"></div>
          )}
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
              Search Your Real Estate Requirement
          </h1>
            <p className="text-base sm:text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
              Find luxury properties in Uttarakhand with stunning Himalaya views
            </p>
            
            {/* Search Bar - Inside hero section */}
            <div className="bg-white rounded-lg shadow-xl p-4 mt-0 max-w-5xl mx-auto">
              <SearchFilter onSearch={handleSearch} className="home-search" />
            </div>
          </div>
        </div>
      </section>
      </main>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 mt-12">
          <div className="flex justify-center items-center mb-8">
            <h2 className="text-3xl font-bold text-navy-800 text-center">
              {homeContent?.featuredSectionTitle || 'Featured Properties'}
            </h2>
          </div>
          {loading ? (
            <div className="flex flex-col space-y-6">
              {/* Skeleton loader for featured properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden h-96 animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="flex space-x-2 pt-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ease-in-out opacity-100">
              {featuredProperties.map((property) => (
              <PropertyCard 
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                specs={property.specs}
                has360Tour={property.has360Tour}
                imageUrl={property.imageUrl}
                  propertyType={property.propertyType}
              />
            ))}
          </div>
          )}
        </div>

        {/* Full-width border */}
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] border-t border-navy-200 my-8"></div>

        <div className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold text-navy-800 mb-4">
              {homeContent?.whyChooseUsTitle || 'Why Choose Our Properties?'}
            </h2>
            <p className="text-navy-600">Experience the difference with our premium Uttarakhand properties.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {homeContent?.whyChooseUsFeatures && homeContent.whyChooseUsFeatures.length > 0 ? (
              // Add virtual tour option if not already present
              [...homeContent.whyChooseUsFeatures, 
               ...(!homeContent.whyChooseUsFeatures.some((f: { icon: string }) => f.icon === 'tour') ? [{
                  title: 'Virtual Tours',
                  description: 'Experience our properties from anywhere with 360° virtual tours',
                  icon: 'tour'
                }] : [])
              ].map((feature, index) => (
                <div key={index} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border-l-4 border-navy-600 hover:bg-white transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 mb-4 text-navy-600 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-navy-600 group-hover:text-white transition-colors duration-300">
                      {/* Dynamic icon based on feature.icon */}
                      {feature.icon === 'location' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : feature.icon === 'price' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : feature.icon === 'verify' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : feature.icon === 'tour' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-navy-700 group-hover:text-navy-800">{feature.title}</h3>
                    <p className="text-navy-600 text-sm">{feature.description}</p>
                  </div>
            </div>
              ))
            ) : (
              // Default static features if content is not available
              <>
                <div className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border-l-4 border-navy-600 hover:bg-white transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 mb-4 text-navy-600 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-navy-600 group-hover:text-white transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
            </div>
                    <h3 className="text-lg font-semibold mb-2 text-navy-700 group-hover:text-navy-800">Prime Locations</h3>
                    <p className="text-navy-600 text-sm">All our properties are situated in the most scenic and convenient locations for your dream home.</p>
            </div>
          </div>
                <div className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border-l-4 border-navy-600 hover:bg-white transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 mb-4 text-navy-600 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-navy-600 group-hover:text-white transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
        </div>
                    <h3 className="text-lg font-semibold mb-2 text-navy-700 group-hover:text-navy-800">Competitive Pricing</h3>
                    <p className="text-navy-600 text-sm">We offer the best value for your investment with transparent pricing and no hidden fees.</p>
              </div>
            </div>
                <div className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border-l-4 border-navy-600 hover:bg-white transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 mb-4 text-navy-600 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-navy-600 group-hover:text-white transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
              </div>
                    <h3 className="text-lg font-semibold mb-2 text-navy-700 group-hover:text-navy-800">Verified Properties</h3>
                    <p className="text-navy-600 text-sm">Every listing is thoroughly verified for authenticity and legal compliance.</p>
            </div>
              </div>
                <div className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border-l-4 border-navy-600 hover:bg-white transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 mb-4 text-navy-600 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-navy-600 group-hover:text-white transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
            </div>
                    <h3 className="text-lg font-semibold mb-2 text-navy-700 group-hover:text-navy-800">Virtual Tours</h3>
                    <p className="text-navy-600 text-sm">Experience our properties from anywhere with 360° virtual tours</p>
              </div>
            </div>
              </>
            )}
          </div>
        </div>

        {/* Custom Sections */}
        {homeContent?.customSections && homeContent.customSections.length > 0 && (
          homeContent.customSections
            .filter((section: { enabled: boolean }) => section.enabled)
            .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
            .map((section: { id: string; bgColor?: string; textColor?: string; type: string; title: string; subtitle?: string; content: string; imageUrl?: string; enabled: boolean; order: number }) => (
              <div 
                key={section.id} 
                className={`mb-16 ${section.bgColor || 'bg-white'}`}
                style={{ 
                  backgroundColor: section.bgColor?.startsWith('#') ? section.bgColor : undefined,
                  color: section.textColor?.startsWith('#') ? section.textColor : undefined, 
                }}
              >
                {/* Text Section */}
                {section.type === 'text' && (
                  <div className="bg-white rounded-xl p-8 shadow-md">
                    <div className="max-w-4xl mx-auto">
                      <h2 className={`text-3xl font-bold mb-4 ${section.textColor || 'text-navy-800'}`}>
                        {section.title}
                      </h2>
                      {section.subtitle && (
                        <p className="text-xl mb-6">{section.subtitle}</p>
                      )}
                      <div className="prose max-w-none">
                        {section.content}
                      </div>
                </div>
              </div>
                )}

                {/* Image with Text Section */}
                {section.type === 'image-text' && (
                  <div className="bg-white rounded-xl overflow-hidden shadow-md">
                    <div className="md:flex">
                      {section.imageUrl && (
                        <div className="md:w-1/2 relative h-72 md:h-auto">
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${section.imageUrl}")` }}
                          ></div>
            </div>
                      )}
                      <div className={`p-8 ${section.imageUrl ? 'md:w-1/2' : 'w-full'}`}>
                        <h2 className={`text-3xl font-bold mb-4 ${section.textColor || 'text-navy-800'}`}>
                          {section.title}
                        </h2>
                        {section.subtitle && (
                          <p className="text-xl mb-4">{section.subtitle}</p>
                        )}
                        <div className="prose max-w-none">
                          {section.content}
                </div>
              </div>
            </div>
                </div>
                )}

                {/* Additional section types... */}
              </div>
            ))
        )}
        </div>
      
      <Footer />
    </div>
  );
}
