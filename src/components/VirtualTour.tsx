'use client'

import React from 'react';

interface VirtualTourProps {
  tourUrl: string;
}

const VirtualTour: React.FC<VirtualTourProps> = ({ tourUrl }) => {
  return (
    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
      <iframe
        src={tourUrl}
        allow="xr-spatial-tracking; gyroscope; accelerometer"
        allowFullScreen
        className="w-full h-full"
        title="360° Virtual Tour"
      />
    </div>
  );
};

export default VirtualTour;
