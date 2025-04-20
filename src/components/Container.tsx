import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  fullWidth = false
}) => {
  const baseClasses = fullWidth 
    ? 'mx-auto px-4 sm:px-6 lg:px-8' 
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Container; 