'use client'

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';

export default function AlmoraPage() {
  // Mock properties data for Almora
  const properties = [
    {
      id: 'a1',
      title: 'Heritage Cottage with Mountain Views',
      location: 'Kasar Devi, Almora',
      price: '1,20,00,000',
      bedrooms: 3,
      bathrooms: 2,
      area: '1800 sq ft',
      description: 'Beautiful heritage cottage with traditional Kumaoni architecture and spectacular views of the Himalayas.',
      image: '/property-1.jpg',
      featured: true
    },
    {
      id: 'a2',
      title: 'Modern Villa in Almora Town',
      location: 'Mall Road, Almora',
      price: '85,00,000',
      bedrooms: 3,
      bathrooms: 2,
      area: '1500 sq ft',
      description: 'Contemporary villa with all modern amenities, located in the heart of Almora town with easy access to all facilities.',
      image: '/property-2.jpg',
      featured: false
    },
    {
      id: 'a3',
      title: 'Mountain Retreat with Orchard',
      location: 'Simtola, Almora',
      price: '1,50,00,000',
      bedrooms: 4,
      bathrooms: 3,
      area: '2200 sq ft',
      description: 'Spacious mountain retreat surrounded by pine forests and featuring its own apple and plum orchard.',
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
            Almora
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Discover the cultural capital of Kumaon
          </p>
        </div>
      </section>
      
      {/* About the Region */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold mb-6">About Almora</h2>
              <p className="mb-4">
                Almora is a cantonment town in the Kumaon region of Uttarakhand, known for its cultural heritage, panoramic views of the Himalayas, and rich colonial history. The town is spread across a 5 km ridge and offers a perfect blend of natural beauty and cultural experiences.
              </p>
              <p className="mb-4">
                With a history dating back to the Chand dynasty of the 16th century, Almora is considered the cultural heart of the Kumaon region. Its moderate climate, lower tourist density compared to Nainital, and authentic mountain lifestyle make it an attractive destination for property buyers seeking tranquility and cultural immersion.
              </p>
              <p className="mb-6">
                The town is surrounded by thick pine and deodar forests, creating a serene environment with clean air and stunning vistas of the Himalayan peaks.
              </p>
              
              <h3 className="text-xl font-bold mb-3">Key Attractions</h3>
              <ul className="list-disc pl-5 mb-6">
                <li className="mb-1">Bright End Corner - Spectacular sunrise and sunset views</li>
                <li className="mb-1">Kasar Devi Temple - Spiritual significance and panoramic views</li>
                <li className="mb-1">Chitai Temple - Famous Golu Devta temple known for wish fulfillment</li>
                <li className="mb-1">Simtola - Beautiful eco park with pine forests</li>
                <li className="mb-1">Binsar Wildlife Sanctuary - Rich biodiversity and Himalayan views</li>
                <li className="mb-1">Almora Bazaar - Traditional crafts and Kumaoni cuisine</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Climate</h3>
              <p className="mb-6">
                Almora enjoys a pleasant climate with warm summers (15-25°C) and cold winters (0-10°C). The monsoon season (July-September) brings moderate rainfall, transforming the landscape into lush green terraced fields and forests.
              </p>
              
              <h3 className="text-xl font-bold mb-3">Property Investment</h3>
              <p>
                Almora offers more affordable property options compared to Nainital, with excellent potential for long-term appreciation. The peaceful environment makes it ideal for retirement homes or vacation properties, while its growing popularity among writers, artists, and spiritual seekers ensures a steady rental market.
              </p>
            </div>
            
            <div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Quick Facts</h3>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Elevation</h4>
                  <p>1,638 meters above sea level</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Population</h4>
                  <p>Approximately 35,000</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Distance</h4>
                  <p>370 km from Delhi</p>
                  <p>80 km from Nainital</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Best Time to Visit</h4>
                  <p>March to June and September to November</p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-primary">Average Property Rates</h4>
                  <p>₹8,000 - ₹15,000 per sq ft</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary">Nearby Locations</h4>
                  <p>Ranikhet (50 km), Kausani (54 km), Bageshwar (75 km), Nainital (80 km)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container">
          <h2 className="text-3xl font-bold mb-2 text-center">Properties in Almora</h2>
          <p className="text-center mb-8 max-w-3xl mx-auto">
            Explore our exclusive selection of properties in Almora
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/buy?location=almora" className="btn bg-primary text-white hover:bg-[#0c4b7a] px-8 py-3 rounded-md">
              View All Almora Properties
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
              <h3 className="text-xl font-bold mb-3">Cultural Heritage</h3>
              <p className="mb-6">
                Almora has a rich cultural heritage with its own distinct traditions, festivals, and cuisine. The town has been home to many renowned artists, writers, and philosophers, creating a vibrant cultural atmosphere that attracts creative individuals seeking inspiration.
              </p>
              
              <h3 className="text-xl font-bold mb-3">Sustainable Living</h3>
              <p>
                Many property owners in Almora are embracing sustainable living practices, including organic farming, rainwater harvesting, and solar energy. This eco-friendly approach aligns with the region's natural beauty and appeals to environmentally conscious buyers.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-3">Investment Tips</h3>
              <ul className="list-disc pl-5 mb-6">
                <li className="mb-2">Areas like Kasar Devi and Bright End Corner offer the best views and investment potential</li>
                <li className="mb-2">Properties with good road access remain valuable year-round</li>
                <li className="mb-2">Land with water sources (natural springs or wells) commands a premium</li>
                <li className="mb-2">Consider the orientation for maximum sunlight, especially important during winter</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Future Development</h3>
              <p>
                Almora is seeing increased infrastructure development with improved road connectivity, telecommunications, and healthcare facilities. The town's growing popularity among digital nomads and remote workers is creating new opportunities for property owners to offer long-term rentals.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#FFD700]">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#0A3D62]">Interested in Almora Properties?</h2>
          <p className="text-xl mb-8 text-[#0A3D62] max-w-3xl mx-auto">
            Contact us today to arrange a viewing or get more information about investing in Almora.
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