import React from 'react';
import { formatAreaDisplay } from '@/utils/areaConversion';

interface Specifications {
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  landSize?: number;
  naliSize?: string;
  yearBuilt?: number;
  garages?: number;
  propertyType?: string;
  dimensions?: string;
  facing?: string;
  waterSource?: string;
  roadAccess?: string;
  electricity?: string;
  view?: string;
}

interface PropertySpecsProps {
  specifications: Specifications;
  showPrice?: boolean;
}

// Helper function to convert sq ft to Nali (using approximate conversion rate)
const sqftToNali = (sqft: number): number => {
  // 1 Nali ≈ 2160 sq ft (this conversion may vary by region)
  return sqft / 2160;
};

const PropertySpecs: React.FC<PropertySpecsProps> = ({ specifications, showPrice = true }) => {
  const {
    bedrooms,
    bathrooms,
    area,
    landSize,
    naliSize,
    yearBuilt,
    garages,
    propertyType,
    dimensions,
    facing,
    waterSource,
    roadAccess,
    electricity,
    view
  } = specifications;

  const isPlot = propertyType?.toLowerCase() === 'plot' || propertyType?.toLowerCase() === 'land';
  
  // Use naliSize directly if available, otherwise format the area display
  let areaDisplay;
  if (naliSize) {
    // Ensure the naliSize includes "Nali"
    areaDisplay = naliSize.includes('Nali') ? naliSize : `${naliSize} Nali`;
  } else if (isPlot && landSize) {
    // For plot/land with landSize, convert to Nali
    const naliValue = sqftToNali(landSize);
    areaDisplay = `${Math.floor(naliValue)} Nali`;
  } else {
    // Use the default formatting utility for other cases
    areaDisplay = formatAreaDisplay(area, propertyType);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-1/2">
          <div className="text-navy-500">Property Type</div>
          <div className="text-xl">{propertyType}</div>
        </div>
        
        <div className="w-1/2">
          <div className="text-navy-500">Plot Area</div>
          <div className="text-xl">{areaDisplay}</div>
        </div>
      </div>
    </div>
  );
};

export default PropertySpecs; 