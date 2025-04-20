'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchFilter from '@/components/SearchFilter';
import PropertyCard from '@/components/PropertyCard';
import { formatIndianPrice } from '@/utils/formatPrice';

// Helper function to convert API property data to card format
const convertToCardFormat = (property: any) => {
  // Determine if it's a plot/land property
  const propertyType = property.propertyType ? property.propertyType.toLowerCase() : '';
  const isPlotOrLand = propertyType.includes('plot') || propertyType.includes('land');
  
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
  
  return {
    id: property.id,
    title: property.title,
    price: formatIndianPrice(property.price) + '/month',
    location: property.location,
    propertyType: property.propertyType || '',
    specs: {
      // Set bedrooms/bathrooms for appropriate property types, not for plots/land
      bedrooms: (!isPlotOrLand && bedroomValue) ? `${bedroomValue} BHK` : '',
      bathrooms: (!isPlotOrLand && bathroomValue) ? `${bathroomValue} Bath` : '',
      // For plots/land, show sq ft area (set to plotAreaDisplay for plots)
      area: isPlotOrLand ? plotAreaDisplay : areaDisplay,
      landSize: formattedLandSize // Always include landSize when available
    },
    has360Tour: Boolean(property.tourUrl),
    imageUrl: property.images?.[0] || '/images/property-placeholder.svg'
  };
};

function LeasePageContent() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch properties on component mount or when URL parameters change
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Build query params from URL
        const queryParams = new URLSearchParams();
        
        // Add timestamp to prevent caching
        queryParams.set('t', Date.now().toString());
        
        // Force lease category
        queryParams.set('category', 'lease');
        
        // Add search filters from URL parameters
        const location = searchParams.get('location');
        const propertyType = searchParams.get('propertyType');
        const priceMin = searchParams.get('priceMin');
        const priceMax = searchParams.get('priceMax');
        
        if (location) queryParams.set('location', location);
        if (propertyType) queryParams.set('propertyType', propertyType);
        if (priceMin) queryParams.set('priceMin', priceMin);
        if (priceMax) queryParams.set('priceMax', priceMax);
        
        // Make API request with all parameters
        const response = await fetch(`/api/properties?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        
        const data = await response.json();
        setProperties(data.map(convertToCardFormat));
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Set mock data if API fails
        setProperties(getMockLeaseProperties());
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [searchParams]);

  // Handle search filter changes
  const handleSearch = (filters: any) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Always set category to lease
    queryParams.set('category', 'lease');
    
    if (filters.location) queryParams.set('location', filters.location);
    if (filters.propertyType) queryParams.set('propertyType', filters.propertyType);
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
    
    // Update URL with search parameters
    router.push(`/lease?${queryParams.toString()}`);
  };

  // Mock lease properties as fallback
  const getMockLeaseProperties = () => [
    {
      id: '7',
      title: 'Luxury Villa with Pool',
      price: '₹ 75,000/month',
      location: 'Nainital, Uttarakhand',
      specs: {
        bedrooms: '4 BHK',
        bathrooms: '3 Bath',
        area: '3000 sq.ft',
        landSize: '0.5 Acres'
      },
      has360Tour: true,
      imageUrl: '/images/property-placeholder.svg'
    },
    {
      id: '8',
      title: 'Cozy Mountain Cottage',
      price: '₹ 45,000/month',
      location: 'Bhimtal, Uttarakhand',
      specs: {
        bedrooms: '2 BHK',
        bathrooms: '1 Bath',
        area: '1500 sq.ft',
        landSize: '0.2 Acres'
      },
      has360Tour: true,
      imageUrl: '/images/property-placeholder.svg'
    },
    {
      id: '9',
      title: 'Modern Apartment',
      price: '₹ 35,000/month',
      location: 'Almora, Uttarakhand',
      specs: {
        bedrooms: '3 BHK',
        bathrooms: '2 Bath',
        area: '1800 sq.ft',
        landSize: 'N/A'
      },
      has360Tour: false,
      imageUrl: '/images/property-placeholder.svg'
    }
  ];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-[#0A3D62] to-[#1E5F8C]"></div>
        </div>
        <div className="container relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Properties for Lease in Uttarakhand
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Find your perfect rental property in the beautiful Kumaon region
          </p>
        </div>
      </section>
      
      {/* Search Filter Section */}
      <section className="py-8 bg-white">
        <div className="container">
          <SearchFilter onSearch={handleSearch} initialCategory="lease" />
        </div>
      </section>
      
      {/* Properties Section */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Available Rental Properties</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(property => (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No rental properties available matching your criteria.</p>
              <p className="mt-4">Please modify your search or check back later.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Why Lease in Uttarakhand Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Lease Property in Uttarakhand?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Experience Before Buying</h3>
              <p className="mb-6">
                Leasing allows you to experience living in different areas of Uttarakhand before committing to a purchase. Explore various locations and find the perfect spot for your future home.
              </p>
              
              <h3 className="text-xl font-bold mb-4">Seasonal Options</h3>
              <p className="mb-6">
                Many of our lease properties offer flexible terms, including seasonal rentals. Enjoy the cool mountain climate during summer months or experience the magic of winter in the Himalayas.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Work From Mountains</h3>
              <p className="mb-6">
                With remote work becoming more common, leasing a property in Uttarakhand offers the perfect opportunity to work from a serene mountain environment with beautiful views and clean air.
              </p>
              
              <h3 className="text-xl font-bold mb-4">Fully Furnished Options</h3>
              <p className="mb-6">
                Many of our rental properties come fully furnished with all amenities, making your move hassle-free. Just bring your personal belongings and start enjoying the mountain lifestyle immediately.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 bg-[#FFD700]">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#0A3D62]">Ready to Find Your Perfect Rental?</h2>
          <p className="text-xl mb-8 text-[#0A3D62] max-w-3xl mx-auto">
            Contact us today to schedule a viewing or get more information about any of our rental properties.
          </p>
          <a href="/contact" className="inline-block bg-[#0A3D62] text-white hover:bg-[#0c4b7a] px-8 py-3 rounded-md">
            Contact Us Now
          </a>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

// Wrap the page with Suspense to fix the build error with useSearchParams
export default function LeasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    }>
      <LeasePageContent />
    </Suspense>
  );
}
