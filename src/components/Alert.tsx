'use client'

import React, { useState, useEffect } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const [visible, setVisible] = useState(true);
  
  // Auto-dismiss success and info alerts after 5 seconds
  useEffect(() => {
    if (type !== 'error' && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [type, visible, onClose]);
  
  if (!visible) return null;
  
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };
  
  return (
    <div className={`rounded-md border p-4 relative ${getAlertStyles()} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-grow">
          {message}
        </div>
        {onClose && (
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 