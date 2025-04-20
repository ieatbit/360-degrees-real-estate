'use client';

import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({
  src = '/images/default-avatar.jpg',
  alt = 'User avatar',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} relative rounded-full overflow-hidden bg-gray-200`}>
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover"
          onError={(e) => {
            // Handle image loading error
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-avatar.jpg';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-navy-200 text-navy-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Avatar; 