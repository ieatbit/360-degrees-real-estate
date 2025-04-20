'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PropertyImageFallback from './PropertyImageFallback';

interface PropertyCardProps {
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
  imageUrl: string | null | undefined;
  propertyType?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  location,
  specs,
  has360Tour,
  imageUrl,
  propertyType = ""
}) => {
  // Check if the property is a plot or land based on property type or title
  const isPlotOrLand = propertyType?.toLowerCase()?.includes('plot') || 
                       propertyType?.toLowerCase()?.includes('land') || 
                       title?.toLowerCase()?.includes('plot') || 
                       title?.toLowerCase()?.includes('land');
  
  // Check if the property is a flat based on property type or title
  const isFlat = propertyType?.toLowerCase()?.includes('flat') || 
                title?.toLowerCase()?.includes('flat') || 
                title?.toLowerCase()?.includes('bhk');
                
  // Check if the bedroom value contains "Nali" - if so, don't display it as a bedroom
  const showBedrooms = specs?.bedrooms && !specs.bedrooms.includes('Nali');
  
  // Check if landSize contains "Nali" or if we should display Nali
  const hasNaliValue = specs?.landSize?.includes('Nali');

  // Check if we have a valid image URL
  const hasValidImage = Boolean(imageUrl && imageUrl.trim() !== '');

  return (
    <div className="property-card bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-navy-100 group transform h-full flex flex-col">
      <div className="relative h-60 overflow-hidden">
        {hasValidImage ? (
          <Image 
            src={imageUrl!} 
            alt={`${title} Image`}
            width={500}
            height={300}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ objectPosition: 'center' }}
            priority
          />
        ) : (
          <PropertyImageFallback />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 text-white font-medium text-sm px-3 py-1 bg-navy-700/90 rounded-md backdrop-blur-sm">
          {location}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-navy-800 mb-0 truncate flex-1">{title}</h3>
            <div className="text-lg font-bold text-secondary ml-2 whitespace-nowrap">{price}</div>
          </div>
          
          <div className="flex justify-between text-sm mb-4 text-navy-600 border-t border-navy-100 pt-4 mt-2">
            {/* First position - bedrooms for non-plot properties */}
            {(isFlat || (!isPlotOrLand && showBedrooms)) && (
              <div className="flex flex-col items-center">
                <span className="text-navy-600 text-lg mb-1">🛏️</span>
                <span>{specs.bedrooms}</span>
              </div>
            )}
            
            {/* Second position - bathrooms for non-plot properties */}
            {(isFlat || (!isPlotOrLand && specs?.bathrooms)) && (
              <div className="flex flex-col items-center">
                <span className="text-navy-600 text-lg mb-1">🚿</span>
                <span>{specs.bathrooms}</span>
              </div>
            )}
            
            {/* Left position for all properties - show area in sq ft */}
            {specs?.area && (
              <div className="flex flex-col items-center">
                <span className="text-navy-600 text-lg mb-1">📏</span>
                <span>{specs.area}</span>
              </div>
            )}
            
            {/* Right position for all properties - show Nali value with red flag */}
            {hasNaliValue && (
              <div className="flex flex-col items-center">
                <span className="text-navy-600 text-lg mb-1">🚩</span>
                <span>{specs.landSize}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-auto">
          <Link 
            href={`/property/${id}`} 
            className="bg-gradient-to-r from-navy-600 to-navy-800 hover:from-navy-700 hover:to-navy-900 text-white inline-block px-5 py-3 w-full rounded-lg font-medium transition-all duration-300 shadow-md"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
