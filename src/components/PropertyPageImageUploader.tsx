'use client';

import React, { useState, useCallback, useRef } from 'react';
import { FaImage, FaUpload, FaSpinner, FaTimes } from 'react-icons/fa';

interface PropertyPageImageUploaderProps {
  existingImage?: string;
  onImageUploaded: (url: string) => void;
  className?: string;
}

const PropertyPageImageUploader: React.FC<PropertyPageImageUploaderProps> = ({
  existingImage,
  onImageUploaded,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);
  
  // Handle dropped files
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]; // Take only the first file
      if (file.type.startsWith('image/')) {
        handleUpload(file);
      } else {
        setUploadError('Please upload an image file (JPEG, PNG, GIF, etc.)');
      }
    }
  }, []);
  
  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleUpload(file);
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  }, []);
  
  // Open file dialog on button click
  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Upload the file to the server
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/property-page/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      onImageUploaded(data.url); // Call the callback with the uploaded image URL
      setUploadError(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError((error as Error).message || 'Failed to upload image');
      // Keep the preview so the user can see what they tried to upload
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Display image if there's a existingImage or previewUrl
  const displayUrl = previewUrl || existingImage;
  
  return (
    <div className={`w-full ${className}`}>
      <p className="text-sm font-medium text-gray-700 mb-1">Hero Image</p>
      
      <div
        className={`border-2 rounded-md overflow-hidden transition-colors ${
          isDragging 
            ? 'border-navy-500 bg-navy-50' 
            : uploadError 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Image preview */}
        {displayUrl ? (
          <div className="relative w-full h-40">
            <img 
              src={displayUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleButtonClick}
              className="absolute bottom-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-navy-700"
              title="Change image"
            >
              <FaUpload />
            </button>
          </div>
        ) : (
          // Upload placeholder
          <div 
            className="flex flex-col items-center justify-center p-6 text-center cursor-pointer h-40"
            onClick={handleButtonClick}
          >
            <FaImage className="h-12 w-12 mb-2 text-gray-400" />
            <p className="text-gray-500">
              {isUploading ? 'Uploading...' : 'Drag and drop an image here or click to upload'}
            </p>
            {isUploading && (
              <FaSpinner className="animate-spin mt-2 text-navy-600" />
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {uploadError && (
        <div className="mt-1 text-red-500 text-sm flex items-center">
          <FaTimes className="mr-1" />
          {uploadError}
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {/* Help text */}
      <p className="mt-1 text-xs text-gray-500">
        Recommended image size: 1920 × 1080 pixels, maximum 5MB
      </p>
    </div>
  );
};

export default PropertyPageImageUploader; 