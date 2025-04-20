'use client'

import React from 'react';
import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';

interface SimilarPropertiesProps {
  properties: Property[];
  currentPropertyId: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ properties, currentPropertyId }) => {
  // Filter out the current property and limit to 3 similar properties
  const similarProperties = properties
    .filter(property => property.id !== currentPropertyId)
    .slice(0, 3);

  if (similarProperties.length === 0) {
    return null;
  }

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/properties" 
          className="inline-block px-6 py-3 bg-[#0A2E1C] text-white rounded-md hover:bg-[#184D30] transition-colors"
        >
          View All Properties
        </Link>
      </div>
    </div>
  );
};

export default SimilarProperties; 