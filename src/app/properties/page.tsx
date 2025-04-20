'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import SearchFilter from '@/components/SearchFilter';
import { Property } from '@/types';
import { formatIndianPrice } from '@/utils/formatPrice';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// Add this to show the loader before any client side JavaScript loads
const GlobalLoader = () => (
  <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
  </div>
);

// Define the property data structure
interface PropertyCardData {
  id: string;
  title: string;
  price: string;
  location: string;
  category: 'buy' | 'lease';
  propertyType: string;
  specs: {
    bedrooms: string;
    bathrooms: string;
    area: string;
    landSize: string;
  };
  images: string[];
  featured?: boolean;
  tourUrl?: string;
}

// Helper function to convert API property data to card format
const convertToCardFormat = (property: any): PropertyCardData => {
  // Determine if it's a plot/land property
  const propertyType = property.propertyType ? property.propertyType.toLowerCase() : '';
  const isPlotOrLand = propertyType.includes('plot') || propertyType.includes('land');
  const isFlat = propertyType.includes('flat') || propertyType.includes('apartment');
  
  // Extract specs if available
  const specs = property.specs || {};
  
  // Format area display based on property type
  const areaDisplay = property.area ? `${property.area.toLocaleString()} sq ft` : 
                     (specs.area ? `${specs.area} sq ft` : '');
                     
  // For plot/land properties, use landSize for the area display
  const plotAreaDisplay = specs.landSize || specs.plotSize || specs.plotDimensions || '0 sq ft';
  
  // Format land size properly for display using specs
  let formattedLandSize = '';
  
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

  // Extract values from specs if available - only for appropriate property types
  const bedroomValue = isPlotOrLand ? '' : (specs.bedrooms || property.bedrooms || '');
  const bathroomValue = isPlotOrLand ? '' : (specs.bathrooms || property.bathrooms || '');
  
  // Format the price using formatIndianPrice utility
  const formattedPrice = formatIndianPrice(property.price);
  
  return {
    id: property.id,
    title: property.title,
    price: formattedPrice,
    location: property.location,
    category: property.category,
    propertyType: property.propertyType,
    specs: {
      // Set bedrooms/bathrooms for appropriate property types, not for plots/land
      bedrooms: (!isPlotOrLand && bedroomValue) ? `${bedroomValue} BHK` : '',
      bathrooms: (!isPlotOrLand && bathroomValue) ? `${bathroomValue} Bath` : '',
      // For plots/land, show sq ft area (set to plotAreaDisplay for plots)
      area: isPlotOrLand ? plotAreaDisplay : areaDisplay,
      landSize: formattedLandSize // Always include landSize when available
    },
    images: Array.isArray(property.images) ? property.images : [],
    featured: property.featured || false,
    tourUrl: property.tourUrl || null
  };
};

// Rename the main component to PropertiesPageContent
function PropertiesPageContent() {
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [loadingCount, setLoadingCount] = useState(2); // Track two loading processes
  const [allProperties, setAllProperties] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [pageContent, setPageContent] = useState({
    heroImage: '',
    heroHeading: '',
    heroSubheading: '',
    mainContent: ''
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();
  // Extract search parameters
  const category = searchParams?.get('category') || null;
  const location = searchParams?.get('location') || null;
  const propType = searchParams?.get('propertyType') || null;
  const priceMin = searchParams?.get('priceMin') || null;
  const priceMax = searchParams?.get('priceMax') || null;

  // Function to track when loading completes
  const completeLoading = useCallback(() => {
    setLoadingCount(prevCount => {
      const newCount = prevCount - 1;
      if (newCount <= 0) {
        setContentReady(true);
      }
      return newCount;
    });
  }, []);

  // Fetch page content
  useEffect(() => {
    let isMounted = true;
    
    const fetchPageContent = async () => {
      try {
        setPageLoading(true);
        const response = await fetch('/api/property-page');
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          setPageContent(data);
        }
      } catch (error) {
        console.error('Error fetching property page content:', error);
      } finally {
        if (isMounted) {
          setPageLoading(false);
          completeLoading();
        }
      }
    };
    
    fetchPageContent();
    
    return () => {
      isMounted = false;
    };
  }, [completeLoading]);

  // Fetch properties on component mount or when URL parameters change
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching properties with filters:', {
          category,
          location, 
          propType,
          priceMin,
          priceMax
        });
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        console.log('Properties page using base URL:', baseUrl);
        
        // Fetch property options for the filter dropdowns
        const optionsResponse = await fetch(`${baseUrl}/api/properties/options`);
        if (!isMounted) return;
        
        if (!optionsResponse.ok) throw new Error('Failed to fetch property options');
        const optionsData = await optionsResponse.json();
        
        setPropertyTypeOptions(optionsData.propertyTypes || []);
        setLocationOptions(optionsData.locations || []);
        
        // Build query based on search params - including a timestamp to prevent caching
        const searchParams = new URLSearchParams();
        searchParams.set('t', Date.now().toString());
        
        // Add all filter parameters to the API request
        if (category) searchParams.set('category', category);
        if (location) searchParams.set('location', location);
        if (propType) searchParams.set('propertyType', propType);
        if (priceMin) searchParams.set('priceMin', priceMin);
        if (priceMax) searchParams.set('priceMax', priceMax);
        
        const queryString = searchParams.toString();
        const endpoint = `${baseUrl}/api/properties${queryString ? `?${queryString}` : ''}`;
        
        console.log('Fetching properties from endpoint:', endpoint);
        
        // Fetch filtered properties from API
        const response = await fetch(endpoint);
        if (!isMounted) return;
        
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        
        console.log(`Loaded ${data.length} properties from API`);
        
        // Convert to card format
        const formattedData = data.map(convertToCardFormat);
        
        // Additional client-side filtering for more precise results
        setProperties(formattedData);
        setFilteredProperties(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          completeLoading();
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [category, location, propType, priceMin, priceMax, searchParams, completeLoading]);

  // Handle search filter changes
  const handleSearch = (filters: any) => {
    console.log('Search filters being applied:', filters);
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.set('category', filters.category);
    
    // Preserve exact location string from dropdown
    if (filters.location) {
      console.log(`Setting location in URL: "${filters.location}"`);
      queryParams.set('location', filters.location);
    }
    
    // Preserve exact property type string from dropdown
    if (filters.propertyType) {
      console.log(`Setting propertyType in URL: "${filters.propertyType}"`);
      queryParams.set('propertyType', filters.propertyType);
    }
    
    // Handle minPrice - ensure it's a valid number
    if (filters.minPrice) {
      const priceMin = filters.minPrice.toString().trim();
      if (priceMin && !isNaN(Number(priceMin))) {
        console.log(`Setting priceMin in URL: "${priceMin}"`);
        queryParams.set('priceMin', priceMin);
      }
    }
    
    // Handle maxPrice - ensure it's a valid number
    if (filters.maxPrice) {
      const priceMax = filters.maxPrice.toString().trim();
      if (priceMax && !isNaN(Number(priceMax))) {
        console.log(`Setting priceMax in URL: "${priceMax}"`);
        queryParams.set('priceMax', priceMax);
      }
    }
    
    // Add timestamp to prevent caching
    queryParams.set('t', Date.now().toString());
    
    console.log('Updating properties search with parameters:', Object.fromEntries(queryParams.entries()));
    
    // Update URL with search parameters
    router.push(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {!contentReady ? (
        // Full page loader when content is not ready
        <div className="flex-grow flex justify-center items-center py-10">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-navy-600 border-r-transparent"></div>
        </div>
      ) : (
        <main className="flex-grow">
          {/* Hero Section - Full width without padding */}
          <div className="relative h-[307px] md:h-[461px] w-full">
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
            <div className="absolute inset-0">
              {pageLoading ? (
                <div className="w-full h-full bg-gray-300 animate-pulse"></div>
              ) : (
                <Image 
                  src={pageContent.heroImage || '/images/uttarakhand-mountains.svg'}
                  alt="Properties in Uttarakhand"
                  fill
                  priority
                  className="object-cover brightness-75"
                />
              )}
            </div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-20">
              {pageLoading ? (
                <>
                  <div className="h-10 w-3/4 max-w-lg bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-6 w-2/4 max-w-md bg-gray-200 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                    {pageContent.heroHeading}
                  </h1>
                  <p className="mt-4 text-base sm:text-lg md:text-xl text-white drop-shadow-lg max-w-2xl">
                    {pageContent.heroSubheading}
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Content area with container padding */}
          <div className="container mx-auto px-4 py-10">
            <div className="bg-white p-6 rounded-xl shadow-md mb-10">
              <h2 className="text-xl font-semibold mb-4 text-navy-700 border-b pb-2">Find Your Property</h2>
              <SearchFilter onSearch={handleSearch} className="properties-search" />
            </div>
            
            {loading ? (
              <div className="mt-12 flex justify-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-navy-600 border-r-transparent"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="mt-12 text-center bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-navy-700 mb-2">No properties found</h2>
                <p className="text-gray-600">Try adjusting your search filters or browse all available properties</p>
                <button 
                  onClick={() => router.push('/properties')}
                  className="mt-4 bg-navy-600 hover:bg-navy-700 text-white px-5 py-2 rounded-md transition-colors"
                >
                  View All Properties
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-navy-800">
                    {filteredProperties.length} Properties Found
                  </h2>
                  <div className="text-sm text-navy-600">
                    Showing {filteredProperties.length} of {properties.length} properties
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProperties
                    .filter(property => property.images && property.images.length > 0)
                    .map((property) => (
                      <PropertyCard 
                        key={property.id}
                        id={property.id}
                        title={property.title}
                        price={property.price}
                        location={property.location}
                        specs={property.specs}
                        has360Tour={Boolean(property.tourUrl)}
                        imageUrl={property.images[0]} 
                        propertyType={property.propertyType}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  );
}

// Wrap the page with Suspense to fix the build error with useSearchParams
export default function PropertiesPage() {
  // Use state to track initial page load
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to handle initial page load
  useEffect(() => {
    // Set a short timeout to ensure the loader is visible during hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show full-page loader during initial page load
  if (isLoading) {
    return <GlobalLoader />;
  }
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  );
} 