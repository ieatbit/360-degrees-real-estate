'use client';

import React from 'react';

const PropertyImageFallback: React.FC = () => {
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400"
      style={{
        background: 'linear-gradient(135deg, #f0f4f9 0%, #d2dde8 100%)'
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="50" 
        height="50" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="mb-2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <div className="text-xs font-medium">No Image Available</div>
    </div>
  );
};

export default PropertyImageFallback; 