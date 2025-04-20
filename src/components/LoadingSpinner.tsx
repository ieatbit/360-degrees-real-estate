'use client'

import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4'
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`inline-block animate-spin rounded-full border-solid border-[#0A2E1C] border-r-transparent ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-black/10 flex items-center justify-center z-50' 
    : 'flex flex-col items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <Spinner size={size} />
        {text && (
          <p className="mt-4 text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 