"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTrash, FaArrowLeft, FaArrowRight, FaExpand, FaPlay, FaGripVertical } from 'react-icons/fa';

export interface ImageItem {
  url: string;
  caption?: string;
  file?: File;
  preview?: string;
}

// New interface for video items
export interface VideoItem {
  url: string;
  caption?: string;
  file?: File;
  preview?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  videoUrls?: string[];        // Changed to array of video URLs
  videoItems?: VideoItem[];    // Added support for video items with metadata
  onImagesChange?: (images: ImageItem[]) => void;
  onVideoChange?: (videoFile: File | null) => void;
  onVideosChange?: (videos: VideoItem[]) => void; // New prop for handling multiple videos
  editable?: boolean;
  height?: string | number;
  aspectRatio?: string;
  title?: string;
  showCaption?: boolean;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  videoUrls = [],           // Default to empty array
  videoItems = [],          // Default to empty array
  onImagesChange,
  onVideoChange,
  onVideosChange,
  editable = false,
  height = 400,
  aspectRatio = 'aspect-[4/3]',
  title = 'Image Gallery',
  showCaption = true,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0); // Track active video index
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<File[]>([]); // Changed to array
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  
  // Log props for debugging
  useEffect(() => {
    console.log('ImageGallery props:', {
      imageCount: images?.length || 0,
      videoUrlsCount: videoUrls?.length || 0,
      videoItemsCount: videoItems?.length || 0
    });
  }, [images, videoUrls, videoItems]);
  
  // Get all videos from props and state
  const allVideos: VideoItem[] = [
    ...videoItems,
    ...videoUrls.map(url => ({ url })),
    ...uploadedVideos.map(file => ({ file, url: '', preview: URL.createObjectURL(file) }))
  ];
  
  // Check if there are any videos available
  const hasVideos = allVideos.length > 0;
  
  // Total items = images + videos
  const totalItems = images.length + allVideos.length;
  
  // Log for debugging
  useEffect(() => {
    console.log('Gallery state:', {
      images: images.length,
      videos: allVideos.length,
      showVideo,
      activeIndex,
      activeVideoIndex,
      totalItems
    });
  }, [images.length, allVideos.length, showVideo, activeIndex, activeVideoIndex, totalItems]);

  // Add debugging for props
  useEffect(() => {
    console.log('ImageGallery props:', {
      imageCount: images?.length || 0,
      videoUrlsCount: videoUrls?.length || 0,
      videoUrlsContent: videoUrls,
      videoItemsCount: videoItems?.length || 0
    });
  }, [images, videoUrls, videoItems]);

  // Automatically show video when there are only videos
  useEffect(() => {
    if (hasVideos && !images.length) {
      setShowVideo(true);
    }
  }, [hasVideos, images.length]);

  // Reset indices when data changes
  useEffect(() => {
    if (activeIndex >= images.length && images.length > 0) {
      setActiveIndex(0);
    }
    if (activeVideoIndex >= allVideos.length && allVideos.length > 0) {
      setActiveVideoIndex(0);
    }
  }, [images.length, allVideos.length, activeIndex, activeVideoIndex]);
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up any created object URLs
      allVideos.forEach(video => {
        if (video.preview && video.preview.startsWith('blob:')) {
          URL.revokeObjectURL(video.preview);
        }
      });
    };
  }, [allVideos]);
  
  // Handle navigation with proper cycling between images and videos
  const handlePrev = () => {
    if (totalItems <= 1) return;
    
    if (showVideo) {
      // If showing videos
      if (activeVideoIndex > 0) {
        // Go to previous video
        setActiveVideoIndex(activeVideoIndex - 1);
      } else if (images.length > 0) {
        // Go to the last image if at first video
        setShowVideo(false);
        setActiveIndex(images.length - 1);
      } else {
        // Cycle to last video if no images
        setActiveVideoIndex(allVideos.length - 1);
      }
    } else {
      // If showing images
      if (activeIndex > 0) {
        // Go to previous image
        setActiveIndex(activeIndex - 1);
      } else if (hasVideos) {
        // Go to videos if at first image
        setShowVideo(true);
        setActiveVideoIndex(allVideos.length - 1);
      } else {
        // Cycle to last image if no videos
        setActiveIndex(images.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (totalItems <= 1) return;
    
    console.log('handleNext called with:', {
      showVideo,
      activeIndex,
      activeVideoIndex,
      imagesLength: images.length,
      videosLength: allVideos.length
    });
    
    if (showVideo) {
      // If showing videos
      if (activeVideoIndex < allVideos.length - 1) {
        // Go to next video
        setActiveVideoIndex(activeVideoIndex + 1);
      } else if (images.length > 0) {
        // Go to the first image if at last video
        setShowVideo(false);
        setActiveIndex(0);
      } else {
        // Cycle to first video if no images
        setActiveVideoIndex(0);
      }
    } else {
      // If showing images
      if (activeIndex < images.length - 1) {
        // Go to next image
        setActiveIndex(activeIndex + 1);
      } else if (hasVideos) {
        // Go to videos if at last image
        setShowVideo(true);
        setActiveVideoIndex(0);
      } else {
        // Cycle to first image if no videos
        setActiveIndex(0);
      }
    }
  };

  const handleThumbnailClick = (index: number) => {
    setShowVideo(false);
    setActiveIndex(index);
  };
  
  const handleVideoThumbnailClick = (index: number) => {
    console.log(`Video thumbnail ${index} clicked`);
    setShowVideo(true);
    setActiveVideoIndex(index);
  };
  
  const toggleLightbox = () => {
    setLightboxOpen(!lightboxOpen);
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    if (onImagesChange) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
      
      // Adjust active index if needed
      if (index <= activeIndex && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  // Handle drag and drop operations
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!editable || !onImagesChange) return;
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      console.log(`Processing ${files.length} dropped image files`);
      
      // Create new image items from dropped files
      const newImages = files.map(file => ({
        url: '',
        preview: URL.createObjectURL(file),
        file
      }));
      
      // Add new images to existing images
      onImagesChange([...images, ...newImages]);
    }
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (!editable || !onImagesChange || !e.target.files) return;
    
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const newImages = files.map(file => ({
        url: '',
        preview: URL.createObjectURL(file),
        file
      }));
      
      onImagesChange([...images, ...newImages]);
      e.target.value = ''; // Reset file input
    }
  };

  // Add these video handling functions
  
  // Handle video drag events
  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setVideoDragActive(true);
    } else if (e.type === "dragleave") {
      setVideoDragActive(false);
    }
  };

  // Handle video drop
  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);
    
    if (!editable || !onVideoChange) {
      console.error('Video drop conditions not met:', {
        editable,
        hasOnVideoChange: !!onVideoChange
      });
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files.length, files.map(f => ({
      name: f.name,
      type: f.type || 'unknown',
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      lastModified: new Date(f.lastModified).toISOString()
    })));
    
    if (files.length === 0) {
      console.error('No files dropped');
      return;
    }
    
    // Simply use the first file dropped
    const file = files[0];
    console.log('Processing first dropped file as video:', file.name);
    
    // Basic size check - 100MB limit
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB. Max size is 100 MB.`);
      alert(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum size is 100 MB.`);
      return;
    }
    
    // Process the file
    handleVideoFile(file);
  };

  // Handle video file input
  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (!editable || !onVideoChange) {
      console.error('Video input conditions not met:', {
        editable,
        hasOnVideoChange: !!onVideoChange
      });
      return;
    }
    
    if (!e.target.files || e.target.files.length === 0) {
      console.error('No files selected in video input');
      return;
    }
    
    const file = e.target.files[0]; // Just use the first file
    console.log('Video file selected:', {
      name: file.name,
      type: file.type || 'unknown',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // Much more permissive approach - accept any file
    console.log('Processing file as video regardless of type');
    
    // Process the file
    handleVideoFile(file);
    e.target.value = ''; // Reset file input
  };

  // Process video file
  const handleVideoFile = (file: File) => {
    console.log('Processing video file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });
    
    // Additional validation for video files
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const acceptedVideoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', '3gp'];
    const acceptedMimeTypes = ['video/mp4', 'video/quicktime', 'video/avi', 'video/webm', 'video/x-matroska'];
    
    let isValidVideo = false;
    
    // Check MIME type first
    if (file.type.startsWith('video/')) {
      console.log('Valid video MIME type detected:', file.type);
      isValidVideo = true;
    } 
    // Then check extension
    else if (fileExtension && acceptedVideoExtensions.includes(fileExtension)) {
      console.log('Valid video extension detected:', fileExtension);
      isValidVideo = true;
    }
    // Last resort - check for large binary files that might be videos
    else if (file.size > 1024 * 1024) { // > 1MB
      console.log('Large file without clear video type - treating as potential video');
      isValidVideo = true;
    }
    
    if (!isValidVideo) {
      console.warn('File may not be a valid video. Proceeding with caution.');
    }
    
    // Create object URL for preview
    try {
      const objectUrl = URL.createObjectURL(file);
      console.log('Created object URL for video preview:', objectUrl);
      
      // Set uploaded video
      setUploadedVideos([...uploadedVideos, file]);
      
      // Call onVideoChange callback
      if (onVideoChange) {
        console.log('Calling onVideoChange with file');
        onVideoChange(file);
      } else {
        console.error('onVideoChange callback not provided');
      }
    } catch (error) {
      console.error('Error creating object URL for video:', error);
      alert('Error processing video file. Please try again.');
    }
  };
  
  // Make sure we can safely navigate when the video is showing
  useEffect(() => {
    // If we're showing the video but there's no video, switch to images
    if (showVideo && !hasVideos && images.length > 0) {
      console.log('Video showing but no video available - switching to images');
      setShowVideo(false);
      setActiveIndex(0);
    }
    
    // If we're not showing the video but there are no images, switch to video if available
    if (!showVideo && images.length === 0 && hasVideos) {
      console.log('No images available - switching to video');
      setShowVideo(true);
    }
  }, [showVideo, hasVideos, images.length]);

  // Handle image reordering with drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    // Make the ghost image semi-transparent
    if (e.dataTransfer.setDragImage && e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editable || !onImagesChange || draggedImageIndex === null) return;
    
    // Prevent dropping on itself
    if (draggedImageIndex === dropIndex) return;
    
    const newImages = [...images];
    const draggedItem = newImages[draggedImageIndex];
    
    // Remove the dragged item
    newImages.splice(draggedImageIndex, 1);
    
    // Insert at the drop position
    newImages.splice(dropIndex, 0, draggedItem);
    
    // Update the active index if needed
    if (activeIndex === draggedImageIndex) {
      setActiveIndex(dropIndex);
    } else if (activeIndex > draggedImageIndex && activeIndex <= dropIndex) {
      setActiveIndex(activeIndex - 1);
    } else if (activeIndex < draggedImageIndex && activeIndex >= dropIndex) {
      setActiveIndex(activeIndex + 1);
    }
    
    // Update the image order through callback
    onImagesChange(newImages);
    setDraggedImageIndex(null);
  };

  // Display placeholder if no images
  if (!images || images.length === 0) {
    return (
      <div 
        className={`w-full ${typeof height === 'number' ? 'h-[' + height + 'px]' : height} bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 ${editable ? 'cursor-pointer' : ''}`}
        onDragEnter={editable ? handleDrag : undefined}
        onDragLeave={editable ? handleDrag : undefined}
        onDragOver={editable ? handleDrag : undefined}
        onDrop={editable ? handleDrop : undefined}
      >
        {editable ? (
          <>
            <input
              type="file"
              id="gallery-image-upload"
              name="gallery-image-upload"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="gallery-image-upload"
              className="cursor-pointer flex flex-col items-center p-6 text-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">Drag and drop images here or click to upload</p>
            </label>
          </>
        ) : (
          <p className="text-gray-500">No images available</p>
        )}
      </div>
    );
  }

  // Add timestamp to prevent caching
  const addTimestamp = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url; // Don't add timestamp to blob URLs
    
    // Only add timestamp if it doesn't already have one
    if (url.includes('t=')) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  // Get current image URL or preview with fallback
  const getCurrentImageUrl = () => {
    if (!images || images.length === 0 || activeIndex >= images.length || activeIndex < 0) {
      return '/images/placeholder-image.jpg'; // Fallback image
    }
    
    const image = images[activeIndex];
    if (!image) {
      return '/images/placeholder-image.jpg'; // Fallback for unexpected cases
    }
    
    const imageUrl = image.preview || image.url;
    
    if (!imageUrl || imageUrl === '') {
      return '/images/placeholder-image.jpg'; // Fallback image
    }
    
    return addTimestamp(imageUrl);
  };

  /* Video player - more robust with error handling */
  const VideoPlayer = () => {
    const [videoError, setVideoError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 2;
    
    console.log('VideoPlayer rendering with:', {
      hasVideos,
      activeVideoIndex,
      allVideosLength: allVideos.length,
      retryCount,
      videoSources: allVideos.map(v => ({
        url: v.url ? v.url.substring(0, 50) + (v.url.length > 50 ? '...' : '') : 'none',
        hasPreview: !!v.preview,
        hasFile: !!v.file
      }))
    });
    
    // Fallback component
    const VideoFallback = () => (
      <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-4 rounded-full bg-navy-600/80 flex items-center justify-center">
          <FaPlay size={36} className="text-white" />
        </div>
        <p className="text-white font-medium">Video Available</p>
        <p className="text-gray-300 text-sm mt-1">Click to play</p>
        {videoError && retryCount < maxRetries && (
          <button 
            onClick={() => {
              setVideoError(false);
              setRetryCount(prev => prev + 1);
              setIsLoading(true);
            }}
            className="mt-4 px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-md"
          >
            Retry ({retryCount + 1}/{maxRetries})
          </button>
        )}
      </div>
    );
    
    if (!hasVideos || activeVideoIndex >= allVideos.length) {
      console.log('Video unavailable due to missing video data');
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <p>Video unavailable</p>
        </div>
      );
    }

    const currentVideo = allVideos[activeVideoIndex];
    // Extract video URL or preview, with safety checks
    const videoSrc = (currentVideo && (currentVideo.preview || currentVideo.url)) || '';
    
    // Validate the URL
    let isValidUrl = false;
    try {
      if (videoSrc && typeof videoSrc === 'string' && videoSrc.trim() !== '') {
        // Check if it's a valid URL format or a valid path
        if (videoSrc.startsWith('http') || videoSrc.startsWith('/')) {
          isValidUrl = true;
        }
      }
    } catch (err) {
      console.error('Error validating video URL:', err);
    }
    
    if (!isValidUrl) {
      console.log('Invalid video URL format');
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <p>Invalid video format</p>
        </div>
      );
    }

    // Always add a fresh timestamp to the URL to avoid cache issues
    const timestampedVideoSrc = videoSrc ? addTimestamp(videoSrc) : '';

    console.log('Video source to be used:', {
      preview: currentVideo.preview ? (currentVideo.preview.substring(0, 50) + (currentVideo.preview.length > 50 ? '...' : '')) : 'none',
      url: currentVideo.url ? (currentVideo.url.substring(0, 50) + (currentVideo.url.length > 50 ? '...' : '')) : 'none',
      finalSrc: videoSrc ? (videoSrc.substring(0, 50) + (videoSrc.length > 50 ? '...' : '')) : 'none',
      timestampedUrl: timestampedVideoSrc ? (timestampedVideoSrc.substring(0, 50) + (timestampedVideoSrc.length > 50 ? '...' : '')) : 'none',
      retryCount,
    });
    
    if (!videoSrc) {
      console.log('Video source is missing or empty');
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <p>Video source missing</p>
        </div>
      );
    }
    
    // Handle video error case
    if (videoError) {
      return (
        <div 
          className="w-full h-full cursor-pointer" 
          onClick={() => {
            if (retryCount < maxRetries) {
              setVideoError(false);
              setRetryCount(prev => prev + 1);
              setIsLoading(true);
            }
          }}
        >
          <VideoFallback />
        </div>
      );
    }
    
    // Show loading state when video is first loading
    if (isLoading) {
      return (
        <div className="w-full h-full relative">
          <VideoFallback />
          <video
            key={`video-preload-${activeVideoIndex}-${retryCount}-${Date.now()}`}
            src={timestampedVideoSrc}
            className="hidden"
            onLoadStart={() => {
              console.log(`Video preload started (retry ${retryCount}/${maxRetries})`);
              setIsLoading(true);
            }}
            onCanPlay={() => {
              console.log(`Video preload can play now (retry ${retryCount}/${maxRetries})`);
              setIsLoading(false);
            }}
            onError={(e) => {
              console.error(`Video preload error (retry ${retryCount}/${maxRetries}):`, e);
              setVideoError(true);
              setIsLoading(false);
            }}
            playsInline
            muted
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <video
          key={`video-${activeVideoIndex}-${retryCount}-${Date.now()}`}
          src={timestampedVideoSrc}
          controls
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          onLoadStart={() => console.log(`Video load started (retry ${retryCount}/${maxRetries})`)}
          onCanPlay={() => console.log(`Video can play now (retry ${retryCount}/${maxRetries})`)}
          onError={(e) => {
            console.error(`Video error (retry ${retryCount}/${maxRetries}):`, e);
            console.error('Error details:', (e.target as HTMLVideoElement).error);
            console.error('Failed video source:', timestampedVideoSrc);
            setVideoError(true);
          }}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm bg-black/50 p-1 rounded">
          {currentVideo.file ? currentVideo.file.name : 'Property Video'}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      {/* Main display area */}
      <div 
        className={`relative ${aspectRatio} mb-2`} 
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {/* Display a placeholder with loading indicator if no images and no videos */}
        {images.length === 0 && !hasVideos ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500 text-sm">No media available</p>
            </div>
          </div>
        ) : showVideo ? (
          <div className="absolute inset-0 bg-black">
            <VideoPlayer />
            {/* Video controls */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="Close video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="absolute inset-0">
            <Image
              src={getCurrentImageUrl()}
              alt={images[activeIndex]?.caption || title}
              fill
              priority
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Image count indicator */}
            {images.length > 0 && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {activeIndex + 1} / {images.length}
              </div>
            )}
            
            {/* Full screen button */}
            <button
              onClick={toggleLightbox}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="View full screen"
            >
              <FaExpand size={14} />
            </button>
            
            {/* Show video button if videos exist */}
            {hasVideos && (
              <button
                onClick={() => {
                  setShowVideo(true);
                  setActiveVideoIndex(0);
                }}
                className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                aria-label="Show video"
              >
                <FaPlay size={14} />
              </button>
            )}
          </div>
        )}
        
        {/* Navigation controls */}
        {totalItems > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="Previous image"
            >
              <FaArrowLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="Next image"
            >
              <FaArrowRight size={14} />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      <div className="flex overflow-x-auto gap-2 pt-2 pb-1 justify-center border-t border-gray-100">
        {/* Image thumbnails */}
        {images.map((image, index) => (
          <div 
            key={`image-${index}`}
            className={`relative cursor-pointer ${
              !showVideo && activeIndex === index ? 'ring-2 ring-primary' : ''
            } ${draggedImageIndex === index ? 'opacity-50' : ''} ${
              editable ? 'hover:ring-1 hover:ring-primary' : ''
            }`}
            onClick={() => handleThumbnailClick(index)}
            draggable={editable}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleImageDrop(e, index)}
          >
            <div className="relative w-16 h-16 overflow-hidden">
              <Image
                src={image.url || image.preview || '/placeholder.svg'}
                alt={image.caption || `Image ${index + 1}`}
                fill
                className="object-cover rounded-sm"
                sizes="64px"
              />
              {editable && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                  {/* Add drag handle indicator */}
                  <div className="absolute top-0 left-0 p-1 text-white bg-black bg-opacity-50">
                    <FaGripVertical size={12} />
                  </div>
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-bl"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Video thumbnails */}
        {allVideos.map((video, index) => (
          <div
            key={`video-${index}`}
            className={`relative cursor-pointer ${
              showVideo && activeVideoIndex === index ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleVideoThumbnailClick(index)}
          >
            <div className="relative w-16 h-16 overflow-hidden bg-gray-200 rounded-sm">
              {/* Video preview thumbnail */}
              {video.preview ? (
                <Image
                  src={video.preview}
                  alt={video.caption || `Video ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <FaPlay className="text-white" size={18} />
                </div>
              )}
              
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <FaPlay className="text-white" size={16} />
              </div>
              
              {/* Remove button for editable mode */}
              {editable && (
                <button
                  type="button"
                  className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-bl"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onVideosChange) {
                      const newVideos = [...allVideos];
                      newVideos.splice(index, 1);
                      onVideosChange(newVideos);
                    }
                  }}
                >
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={toggleLightbox}>
          <div className="relative max-w-5xl max-h-screen p-4">
            <Image
              src={getCurrentImageUrl()}
              alt={images[activeIndex]?.caption || "Image"}
              className="max-h-[90vh] w-auto object-contain"
              width={1200}
              height={800}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={toggleLightbox}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 