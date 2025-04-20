'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// @ts-ignore
import Header from '@/components/Header';
// @ts-ignore
import Footer from '@/components/Footer';
// @ts-ignore
import { Spinner } from '@/components/LoadingSpinner';

interface UttarakhandGuideData {
  title: string;
  subtitle: string;
  content: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
}

export default function UttarakhandGuidePage() {
  const [data, setData] = useState<UttarakhandGuideData>({
    title: 'Uttarakhand Guide',
    subtitle: 'Discover the beauty and opportunities in Uttarakhand',
    content: '<p>Content is currently being updated. Please check back soon.</p>',
    heroImage: '/images/uttarakhand-mountains.svg',
    metaTitle: 'Uttarakhand Guide - 360° Real Estate',
    metaDescription: 'Everything you need to know about Uttarakhand.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/uttarakhand-guide`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        }
      } catch (error) {
        console.error('Error fetching Uttarakhand guide:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Use SVG fallback if the image path is for a JPG that might not exist
  const imagePath = data.heroImage || '/images/uttarakhand-mountains.svg';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero section */}
      <div className="relative h-[307px] md:h-[461px]">
        <Image
          src={imagePath}
          alt={data.title}
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="brightness-75"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            {data.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white drop-shadow-lg max-w-2xl">
            {data.subtitle}
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Introduction Section with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 items-stretch">
          <div className="lg:col-span-2 flex flex-col h-full">
            {/* Real Estate Paradise Section */}
            <div className="w-full bg-green-50 rounded-lg shadow-md overflow-hidden border border-green-100 h-full">
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">Uttarakhand: A Real Estate Paradise</h2>
                
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">Welcome to our Uttarakhand Guide</h3>
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                  Uttarakhand, known as the "Land of Gods", is a state in northern India that's known for its natural beauty, 
                  temples, and as a destination for yoga and hiking.
                </p>
                
                <div className="mb-6">
                  <div 
                    className="prose prose-sm sm:prose-base max-w-none"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-3">Why Invest in Uttarakhand?</h3>
                  <ul className="text-gray-700 space-y-2 pl-5 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Growing tourism industry</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Developing infrastructure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Attractive property prices compared to metropolitan cities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Beautiful natural surroundings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Potential for excellent rental returns from vacation homes</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-3">Popular Investment Areas</h3>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">Some of the popular areas for real estate investment in Uttarakhand include:</p>
                  <ul className="text-gray-700 space-y-2 pl-5 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>Dehradun</strong> - The capital city with growing infrastructure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>Mussoorie</strong> - Famous hill station with luxury properties</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>Nainital</strong> - Tourist hotspot with lakeside properties</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>Haridwar</strong> - Religious city with steady demand</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>Rishikesh</strong> - Yoga capital with growing international interest</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>Almora</strong> - Peaceful destination with growing demand</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-3">Contact Us</h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    If you're interested in exploring real estate opportunities in Uttarakhand, our team of experts can help you 
                    find the perfect property that meets your needs and budget.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Uttarakhand at a Glance Sidebar */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Uttarakhand at a Glance</h3>
            
            <div className="space-y-4 flex-grow">
              <div>
                <h4 className="font-semibold text-gray-700">Capital</h4>
                <p>Dehradun (Winter), Gairsain (Summer)</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Area</h4>
                <p>53,483 sq km</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Population</h4>
                <p>Approx. 10.1 million</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Major Cities</h4>
                <p>Dehradun, Haridwar, Nainital, Mussoorie</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Climate</h4>
                <p>Varies by altitude - subtropical to alpine</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Languages</h4>
                <p>Hindi, Garhwali, Kumaoni, English</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Connectivity</h4>
                <p>Jolly Grant Airport (Dehradun), Railway stations, NH-58</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Tourist Arrivals</h4>
                <p>35+ million annually (pre-pandemic)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Regions Section */}
        <div className="mb-8 sm:mb-16 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8 text-center">Key Regions of Uttarakhand</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Garhwal Region */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border-t-4 border-blue-700">
              <div className="p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3">Garhwal Region</h3>
                
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                  The western part of Uttarakhand, known for its spiritual significance, 
                  adventure tourism, and scenic beauty. Major districts include Dehradun, 
                  Tehri, Uttarkashi, Chamoli, Rudraprayag, Pauri, and Haridwar.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-5 text-sm sm:text-base">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Property Types</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Spiritual retreat centers</li>
                      <li>• Adventure tourism resorts</li>
                      <li>• Luxury villas</li>
                      <li>• Urban apartments</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Price Range</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Urban: ₹4,500-7,500/sq ft</li>
                      <li>• Hill Stations: ₹3,000-12,000/sq ft</li>
                      <li>• Land: ₹15-80 lakh per nali*</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-800 text-white text-sm rounded-full">Dehradun</span>
                  <span className="px-3 py-1 bg-blue-800 text-white text-sm rounded-full">Haridwar</span>
                  <span className="px-3 py-1 bg-blue-800 text-white text-sm rounded-full">Tehri Garhwal</span>
                  <span className="px-3 py-1 bg-blue-800 text-white text-sm rounded-full">Chamoli</span>
                  <span className="px-3 py-1 bg-blue-800 text-white text-sm rounded-full">Uttarkashi</span>
                </div>
              </div>
            </div>
            
            {/* Kumaon Region */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border-t-4 border-yellow-500">
              <div className="p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-700 mb-3">Kumaon Region</h3>
                
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                  The eastern part of Uttarakhand, famous for its picturesque hill stations, 
                  colonial heritage, and cultural richness. Key districts include Nainital, 
                  Almora, Pithoragarh, Bageshwar, Champawat, and Udham Singh Nagar.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-yellow-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-5 text-sm sm:text-base">
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Property Types</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Colonial cottages</li>
                      <li>• Lakefront properties</li>
                      <li>• Mountain retreats</li>
                      <li>• Orchard estates</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Price Range</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Nainital: ₹8,000-25,000/sq ft</li>
                      <li>• Other areas: ₹3,500-15,000/sq ft</li>
                      <li>• Land: ₹10-60 lakh per nali*</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-500 text-gray-800 text-sm rounded-full">Nainital</span>
                  <span className="px-3 py-1 bg-yellow-500 text-gray-800 text-sm rounded-full">Almora</span>
                  <span className="px-3 py-1 bg-yellow-500 text-gray-800 text-sm rounded-full">Pithoragarh</span>
                  <span className="px-3 py-1 bg-yellow-500 text-gray-800 text-sm rounded-full">Bageshwar</span>
                  <span className="px-3 py-1 bg-yellow-500 text-gray-800 text-sm rounded-full">Champawat</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 italic">* 1 nali = approximately 2,160 sq ft in Uttarakhand</p>
        </div>
        
        {/* CTA section */}
        <div className="max-w-4xl mx-auto bg-blue-50 rounded-lg shadow-md overflow-hidden border border-blue-100 mt-8 sm:mt-12">
          <div className="p-4 sm:p-6 md:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">
              Interested in properties in Uttarakhand?
            </h3>
            <p className="text-gray-700 sm:text-blue-700 mb-4 sm:mb-6 text-sm sm:text-base">
              Whether you're looking for a vacation home, investment property, or permanent residence, 
              we can help you find the perfect property in Uttarakhand. Our experts understand the local 
              market dynamics and can guide you through the entire process.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link 
                href="/properties?location=Uttarakhand" 
                className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center sm:text-left"
              >
                Browse Uttarakhand Properties
              </Link>
              <Link 
                href="/contact" 
                className="px-4 sm:px-5 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-center sm:text-left"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
