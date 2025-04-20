'use client'

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';

export default function NainitalPage() {
  // Mock properties data for Nainital
  const properties = [
    {
      id: 'n1',
      title: 'Lakefront Villa with Panoramic Views',
      location: 'Mall Road, Nainital',
      price: '1,85,00,000',
      bedrooms: 4,
      bathrooms: 3,
      area: '2400 sq ft',
      description: 'Luxurious villa with stunning views of Naini Lake. Features spacious rooms, modern amenities, and a beautiful garden.',
      image: '/property-1.jpg',
      featured: true
    },
    {
      id: 'n2',
      title: 'Charming Cottage Near Tiffin Top',
      location: 'Ayarpatta, Nainital',
      price: '95,00,000',
      bedrooms: 2,
      bathrooms: 2,
      area: '1200 sq ft',
      description: 'Cozy cottage with traditional architecture, panoramic mountain views, and modern interiors. Perfect weekend getaway.',
      image: '/property-2.jpg',
      featured: false
    },
    {
      id: 'n3',
      title: 'Modern Apartment with Lake View',
      location: 'Tallital, Nainital',
      price: '75,00,000',
      bedrooms: 3,
      bathrooms: 2,
      area: '1600 sq ft',
      description: 'Contemporary apartment with spectacular views of Naini Lake. Features modern amenities and is close to all major attractions.',
      image: '/property-3.jpg',
      featured: false
    },
  ];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <div className="absolute inset-0">
          {/* This would be replaced with an actual image */}
          <div className="w-full h-full bg-gradient-to-r from-[#0A3D62] to-[#1E5F8C]"></div>
        </div>
        <div className="container relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Nainital
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Discover properties in the beautiful lake district of Uttarakhand
          </p>
        </div>
      </section>
      
      {/* About the Region */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold mb-6">About Nainital</h2>
              <p className="mb-4">
                Nainital, the "Lake District" of India, is a popular hill station in the Kumaon region of Uttarakhand. Centered around the beautiful Naini Lake, this charming town offers breathtaking views of the Himalayan mountains.
              </p>
              <p className="mb-4">
                With its pleasant climate throughout the year, Nainital has been a favorite holiday destination since the British colonial era. The town's unique geography, surrounded by seven hills (Saptashring), creates a natural amphitheater effect, adding to its scenic beauty.
              </p>
              <p className="mb-6">
                The town is well-connected by road to major cities and offers modern amenities while preserving its natural charm, making it an excellent location for property investment.
              </p>
              
              <h3 className="text-xl font-bold mb-3">Key Attractions</h3>
              <ul className="list-disc pl-5 mb-6">
                <li className="mb-1">Naini Lake - Perfect for boating and relaxation</li>
                <li className="mb-1">Mall Road - Shopping and dining experiences</li>
                <li className="mb-1">Naina Devi Temple - Religious significance</li>
                <li className="mb-1">Tiffin Top - Panoramic views of the Himalayas</li>
                <li className="mb-1">Snow View Point - Spectacular mountain vistas</li>
                <li className="mb-1">High Altitude Zoo - Wildlife conservation</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Climate</h3>
              <p className="mb-6">
                Nainital enjoys a temperate climate with warm summers (15-30°C) and cold winters (0-15°C). The monsoon season (July-September) brings moderate rainfall, enhancing the lush greenery of the region.
              </p>
              
              <h3 className="text-xl font-bold mb-3">Property Investment</h3>
              <p>
                Nainital offers excellent investment opportunities with properties ranging from luxury villas to cozy cottages. The tourism industry ensures good rental returns, especially during peak seasons (March-June and September-November).
              </p>
            </div>
            
            <div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Elevation</h4>
                  <p>1,938 meters above sea level</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Population</h4>
                  <p>Approximately 41,000</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Distance</h4>
                  <p>290 km from Delhi</p>
                  <p>65 km from Kathgodam Railway Station</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Best Time to Visit</h4>
                  <p>March to June and September to November</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Average Property Rates</h4>
                  <p>₹15,000 - ₹25,000 per sq ft</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary">Nearby Locations</h4>
                  <p>Bhimtal (22 km), Sattal (23 km), Mukteshwar (51 km), Almora (63 km)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container">
          <h2 className="text-3xl font-bold mb-2 text-center">Properties in Nainital</h2>
          <p className="text-center mb-8 max-w-3xl mx-auto">
            Explore our exclusive selection of properties in Nainital
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/buy?location=nainital" className="btn bg-primary text-white hover:bg-[#0c4b7a] px-8 py-3 rounded-md">
              View All Nainital Properties
            </Link>
          </div>
        </div>
      </section>
      
      {/* Local Insights */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Local Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3">Growing Tourism Potential</h3>
              <p className="mb-6">
                Nainital sees over 3 million tourists annually, creating substantial rental income opportunities for property owners. The government's focus on developing tourism infrastructure is expected to further boost property values in the coming years.
              </p>
              
              <h3 className="text-xl font-bold mb-3">Infrastructure Development</h3>
              <p>
                Recent improvements in road connectivity, water supply, and internet services have enhanced the quality of life in Nainital, making it an increasingly attractive destination for both tourists and permanent residents.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-3">Investment Tips</h3>
              <ul className="list-disc pl-5 mb-6">
                <li className="mb-2">Properties with lake views command premium prices and higher rental returns</li>
                <li className="mb-2">Areas like Ayarpatta and Mallital offer good appreciation potential</li>
                <li className="mb-2">Consider properties with easy accessibility, especially during monsoon season</li>
                <li className="mb-2">Verify land records carefully as some areas have ownership restrictions</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Rental Potential</h3>
              <p>
                Properties in Nainital can generate rental yields of 5-8% annually, with higher returns during peak tourist seasons. Many property owners operate successful homestays and boutique accommodations.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#FFD700]">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#0A3D62]">Interested in Nainital Properties?</h2>
          <p className="text-xl mb-8 text-[#0A3D62] max-w-3xl mx-auto">
            Contact us today to arrange a viewing or get more information about investing in Nainital.
          </p>
          <Link href="/contact" className="btn bg-[#0A3D62] text-white hover:bg-[#0c4b7a] px-8 py-3 rounded-md">
            Contact Us Now
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 