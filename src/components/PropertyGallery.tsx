'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaArrowLeft, FaArrowRight, FaPlay, FaExpand } from 'react-icons/fa';

// Updated interface for property images
export interface PropertyImageType {
  url: string;
  caption?: string;
}

interface PropertyGalleryProps {
  images: string[] | PropertyImageType[];
  videoUrl?: string;
  title?: string;
}

/**
 * Add timestamp to URL to prevent caching
 */
function addTimestamp(url: string): string {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

/**
 * Process images to ensure consistent format
 */
function processImages(images: string[] | PropertyImageType[]): PropertyImageType[] {
  if (!images || images.length === 0) return [];
  
  return images.map(img => {
    if (typeof img === 'string') {
      return { url: img };
    }
    return img;
  });
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, videoUrl, title = 'Property' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Process images to ensure consistent format
  const processedImages = processImages(images);
  
  // Reset the gallery state when images or videoUrl changes
  useEffect(() => {
    setActiveIndex(0);
    setShowVideo(false);
    setLoading(true);
    setLightboxOpen(false);
  }, [images, videoUrl]);

  const handlePrev = () => {
    setShowVideo(false);
    setActiveIndex((prev) => (prev === 0 ? processedImages.length - 1 : prev - 1));
    setLoading(true);
  };

  const handleNext = () => {
    setShowVideo(false);
    setActiveIndex((prev) => (prev === processedImages.length - 1 ? 0 : prev + 1));
    setLoading(true);
  };

  const handleThumbnailClick = (index: number) => {
    setShowVideo(false);
    setActiveIndex(index);
    setLoading(true);
  };

  const handleVideoClick = () => {
    setShowVideo(true);
  };
  
  const toggleLightbox = () => {
    setLightboxOpen(!lightboxOpen);
  };

  if (!processedImages || processedImages.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main display area */}
      <div className="relative h-[400px] overflow-hidden rounded-lg bg-gray-100">
        {!showVideo ? (
          <>
            <Image
              src={addTimestamp(processedImages[activeIndex]?.url || '/img/property-placeholder.jpg')}
              alt={`${title} - Image ${activeIndex + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setLoading(false)}
              priority
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Expand button */}
            <button
              onClick={toggleLightbox}
              className="absolute right-4 top-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              aria-label="Expand image"
            >
              <FaExpand />
            </button>
          </>
        ) : videoUrl ? (
          <video
            src={addTimestamp(videoUrl)}
            controls
            className="w-full h-full object-contain"
            autoPlay
            onError={(e) => {
              console.error('Video playback error:', e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : null}

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          aria-label="Previous image"
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          aria-label="Next image"
        >
          <FaArrowRight />
        </button>

        {/* Video button overlay */}
        {videoUrl && !showVideo && (
          <button
            onClick={handleVideoClick}
            className="absolute right-16 top-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition flex items-center gap-2"
            aria-label="Play video"
          >
            <FaPlay />
            <span>Play Video</span>
          </button>
        )}
        
        {/* Image counter */}
        <div className="absolute left-4 bottom-4 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
          {activeIndex + 1} / {processedImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {processedImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => handleThumbnailClick(idx)}
            className={`flex-shrink-0 relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
              idx === activeIndex && !showVideo ? 'border-primary' : 'border-transparent'
            }`}
          >
            <Image
              src={addTimestamp(img.url || '/img/property-placeholder.jpg')}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
        {videoUrl && (
          <button
            onClick={handleVideoClick}
            className={`flex-shrink-0 relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
              showVideo ? 'border-primary' : 'border-transparent'
            } bg-black/80 flex items-center justify-center text-white`}
          >
            <FaPlay size={24} />
          </button>
        )}
      </div>
      
      {/* Lightbox modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button 
            onClick={toggleLightbox}
            className="absolute top-4 right-4 text-white text-2xl"
            aria-label="Close lightbox"
          >
            &times;
          </button>
          
          <div className="relative w-[90vw] h-[80vh]">
            <Image
              src={addTimestamp(processedImages[activeIndex]?.url || '/img/property-placeholder.jpg')}
              alt={`${title} - Image ${activeIndex + 1}`}
              fill
              className="object-contain"
            />
            
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
              aria-label="Previous image"
            >
              <FaArrowLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
              aria-label="Next image"
            >
              <FaArrowRight size={24} />
            </button>
            
            {processedImages[activeIndex]?.caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white p-2 rounded-md max-w-[80%] text-center">
                {processedImages[activeIndex].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;