'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchFilterProps {
  onSearch?: (criteria: any) => void;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, className }) => {
  const [category, setCategory] = useState('buy');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Add useSearchParams hook to get URL parameters
  const searchParams = useSearchParams();
  
  // Initialize form values based on URL parameters
  useEffect(() => {
    // Get values from URL if available
    const urlCategory = searchParams?.get('category');
    const urlLocation = searchParams?.get('location');
    const urlPropertyType = searchParams?.get('propertyType');
    const urlPriceMin = searchParams?.get('priceMin');
    const urlPriceMax = searchParams?.get('priceMax');
    
    // Set form values from URL parameters
    if (urlCategory) setCategory(urlCategory);
    if (urlLocation) setLocation(urlLocation);
    if (urlPropertyType) setPropertyType(urlPropertyType);
    if (urlPriceMin) setMinPrice(urlPriceMin);
    if (urlPriceMax) setMaxPrice(urlPriceMax);
  }, [searchParams]);

  useEffect(() => {
    // Fetch locations and property types on component mount
    const fetchPropertyOptions = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        console.log('SearchFilter using base URL:', baseUrl);
        
        const response = await fetch(`${baseUrl}/api/properties/options`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if locations and propertyTypes are valid arrays and not empty
          if (Array.isArray(data.locations) && data.locations.length > 0) {
            setLocations(data.locations);
            console.log('Fetched locations:', data.locations);
          } else {
            console.error('Invalid or empty locations array:', data.locations);
            // Set default locations if API returns empty
            setLocations(['Uttarakhand', 'Dehradun', 'Nainital', 'Mussoorie']);
          }
          
          if (Array.isArray(data.propertyTypes) && data.propertyTypes.length > 0) {
            setPropertyTypes(data.propertyTypes);
            console.log('Fetched property types:', data.propertyTypes);
          } else {
            console.error('Invalid or empty propertyTypes array:', data.propertyTypes);
            // Set default property types if API returns empty
            setPropertyTypes(['house', 'apartment', 'plot', 'land']);
          }
        } else {
          console.error('Failed to fetch property options, response status:', response.status);
          // Set fallback values if API fails
          setLocations(['Uttarakhand', 'Dehradun', 'Nainital', 'Mussoorie']);
          setPropertyTypes(['house', 'apartment', 'plot', 'land']);
        }
      } catch (error) {
        console.error('Error fetching property options:', error);
        // Set fallback values if API fails
        setLocations(['Uttarakhand', 'Dehradun', 'Nainital', 'Mussoorie']);
        setPropertyTypes(['house', 'apartment', 'plot', 'land']);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyOptions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build filter criteria - only include non-empty values
    const searchCriteria: any = {
      category // Always include category
    };
    
    // Only add filters that have actual values
    if (location && location !== '') {
      // Don't trim location - use it exactly as selected from the dropdown
      console.log(`Setting location filter: "${location}"`);
      searchCriteria.location = location;
    }
    
    if (propertyType && propertyType.trim() !== '') searchCriteria.propertyType = propertyType.trim();
    if (minPrice && minPrice.trim() !== '') searchCriteria.minPrice = minPrice.trim();
    if (maxPrice && maxPrice.trim() !== '') searchCriteria.maxPrice = maxPrice.trim();
    
    console.log('Search form submitted with values:', searchCriteria);
    
    if (onSearch) {
      onSearch(searchCriteria);
    }
  };

  return (
    <div className={`${className || ''}`}>
      <form onSubmit={handleSearch} className="search-form">
        <div className={`grid grid-cols-1 ${className === 'home-search' || className === 'properties-search' ? 'md:grid-cols-5' : 'md:grid-cols-4 lg:grid-cols-5'} gap-4 items-end`}>
          <div className="lg:col-span-1">
            <div className="flex rounded-md overflow-hidden">
              <button 
                type="button"
                className={`py-2.5 px-4 font-medium transition-colors flex-1 ${
                  category === 'buy' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCategory('buy')}
              >
                Buy
              </button>
              <button 
                type="button"
                className={`py-2.5 px-4 font-medium transition-colors flex-1 ${
                  category === 'lease' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCategory('lease')}
              >
                Lease
              </button>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <select 
              id="location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 text-navy-800 appearance-none bg-select-arrow bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundSize: "1.2em", backgroundPosition: "calc(100% - 0.8em) center" }}
              aria-label="Location"
              disabled={loading}
            >
              <option value="">Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-1">
            <select 
              id="property-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 text-navy-800 appearance-none bg-select-arrow bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundSize: "1.2em", backgroundPosition: "calc(100% - 0.8em) center" }}
              aria-label="Property"
              disabled={loading}
            >
              <option value="">Property</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        
          <div className="md:col-span-1">
            <select 
              id="price-range"
              value={`${minPrice}-${maxPrice}`}
              onChange={(e) => {
                const value = e.target.value;
                const [min, max] = value.split('-');
                
                // Set both min and max prices from the selection
                setMinPrice(min);
                setMaxPrice(max);
                
                console.log(`Price range selected: ${min} to ${max}`);
              }}
              className="w-full py-2.5 px-4 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 text-navy-800 appearance-none bg-select-arrow bg-no-repeat bg-right"
              style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundSize: "1.2em", backgroundPosition: "calc(100% - 0.8em) center" }}
              aria-label="Price Range"
            >
              <option value="-">Price</option>
              <option value="1000000-5000000">₹10L - ₹50L</option>
              <option value="5000000-10000000">₹50L - ₹1Cr</option>
              <option value="10000000-20000000">₹1Cr - ₹2Cr</option>
              <option value="20000000-50000000">₹2Cr - ₹5Cr</option>
              <option value="50000000-">₹5Cr+</option>
            </select>
          </div>
          
          <div className="md:col-span-1">
            <button 
              type="submit"
              className="w-full bg-navy-700 text-white font-semibold py-3 px-6 rounded-md hover:bg-navy-900 transition-all flex items-center justify-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;
