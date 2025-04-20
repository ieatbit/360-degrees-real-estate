'use client'

import React from 'react';
import { FaHeart, FaShare, FaMapMarkerAlt } from 'react-icons/fa';
import Badge from './Badge';
import ActionButton from './ActionButton';
import Container from './Container';

export interface PropertyHeaderProps {
  title?: string;
  location?: string;
  price?: string;
  status?: string;
  backLink?: string;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  title,
  location,
  price,
  status = 'For Sale',
  backLink
}) => {
  return (
    <div className="bg-white py-4 px-4 mb-6 rounded-lg border border-gray-300">
      <Container>
        {backLink && (
          <a href={backLink} className="text-navy-600 mb-1 inline-block hover:underline">
            &larr; Back to Properties
          </a>
        )}
        <div className="flex flex-col gap-4">
          {/* Top row with status and action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {status && <Badge label={status} variant="success" />}
            </div>
            <div className="flex items-center gap-2">
              <ActionButton 
                icon={<FaHeart size={12} />} 
                label="Save" 
                onClick={() => console.log('Property saved')} 
                compact={true}
              />
              <ActionButton 
                icon={<FaShare size={12} />} 
                label="Share" 
                onClick={() => console.log('Property shared')} 
                compact={true}
              />
            </div>
          </div>
          
          {/* Property title and price */}
          <div>
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">{title}</h1>
            )}
            {price && <p className="text-xl md:text-2xl font-semibold text-emerald-700 mt-1">{price}</p>}
          </div>
          
          {/* Location */}
          {location && (
            <div className="flex items-center text-gray-700">
              <FaMapMarkerAlt className="mr-2 text-navy-600" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default PropertyHeader; 