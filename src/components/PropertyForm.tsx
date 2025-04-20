'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageGallery, { ImageItem } from '@/components/ImageGallery';
import { sqftToNali, naliToSqft } from '@/utils/areaConversion';
import { FaPlay, FaTrash } from 'react-icons/fa';

// Define property type
export interface PropertyFormData {
  id?: string;
  title: string;
  price: string;
  location: string;
  description: string;
  propertyType: string;
  category: 'buy' | 'lease';
  features: string[];
  amenities: string[];
  specs: {
    bedrooms: string;
    bathrooms: string;
    area: string;
    landSize: string;
    plotSize?: string;
    plotDimensions?: string;
    plotType?: string;
    hasBedrooms: boolean;
    hasBathrooms: boolean;
    naliSize?: string;
  };
  images: string[];
  tourUrl?: string;
  videoUrl?: string;
  videoUrls?: string[];
  videoFiles?: File[];
  imageFiles?: File[];
  featured?: boolean;
  featuredOrder?: number;
}

interface PropertyFormProps {
  initialData?: PropertyFormData;
  isEditing?: boolean;
}

// Default initial form state
const defaultFormData: PropertyFormData = {
  title: '',
  price: '',
  location: '',
  description: '',
  propertyType: 'villa',
  category: 'buy',
  features: [''],
  amenities: [''],
  specs: {
    bedrooms: '',
    bathrooms: '',
    area: '',
    landSize: '',
    plotSize: '',
    plotDimensions: '',
    hasBedrooms: false,
    hasBathrooms: false,
  },
  images: [''],
  tourUrl: '',
  videoUrls: [],
  imageFiles: [],
  featured: false,
};

const propertyTypes = [
  { id: 'villa', name: 'Villa' },
  { id: 'cottage', name: 'Cottage' },
  { id: 'bungalow', name: 'Bungalow' },
  { id: 'apartment', name: 'Apartment' },
  { id: 'resort', name: 'Resort' },
  { id: 'flats', name: 'Flats' },
  { id: 'plot', name: 'Plot/Land' },
  { id: 'commercial', name: 'Commercial Space' },
];

export default function PropertyForm({ initialData, isEditing = false }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>(() => {
    if (initialData) {
      return {
        ...defaultFormData, // Start with defaults to ensure all fields exist
        ...initialData,
        specs: {
          ...defaultFormData.specs, // Start with defaults for nested objects too
          ...initialData.specs,
          hasBedrooms: initialData.specs.hasBedrooms ?? !!initialData.specs.bedrooms,
          hasBathrooms: initialData.specs.hasBathrooms ?? !!initialData.specs.bathrooms,
        },
        // Ensure arrays are initialized properly
        features: initialData.features?.length ? initialData.features : [''],
        amenities: initialData.amenities?.length ? initialData.amenities : [''],
        images: initialData.images?.length ? initialData.images : [''],
        // Ensure optional fields are never undefined
        tourUrl: initialData.tourUrl || '',
        videoUrls: Array.isArray(initialData.videoUrls) && initialData.videoUrls.length 
          ? initialData.videoUrls 
          : initialData.videoUrl 
            ? [initialData.videoUrl] 
            : [],
        featured: initialData.featured ?? false,
        featuredOrder: initialData.featuredOrder,
      };
    }
    return defaultFormData;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<{ file: File; preview: string }[]>([]);
  const [showVirtualTour, setShowVirtualTour] = useState(!!initialData?.tourUrl);
  const [existingVideos, setExistingVideos] = useState<string[]>(
    Array.isArray(initialData?.videoUrls) && initialData?.videoUrls.length > 0
      ? initialData.videoUrls 
      : initialData?.videoUrl && initialData.videoUrl.trim() !== ''
        ? [initialData.videoUrl] 
        : []
  );
  const router = useRouter();

  // Check if property type is plot/land
  const isPlotType = formData.propertyType === 'plot';

  // Helper to convert between Nali and sq ft
  const [areaNaliValue, setAreaNaliValue] = useState<string>('150');
  
  // Calculate Nali from sq ft value
  useEffect(() => {
    if (isPlotType && formData.specs.area) {
      const sqft = parseFloat(formData.specs.area);
      if (!isNaN(sqft)) {
        const nali = sqftToNali(sqft);
        setAreaNaliValue(nali.toFixed(0));
      }
    }
  }, [isPlotType, formData.specs.area]);

  // Update sq ft when Nali value changes
  const handleNaliChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const naliValue = e.target.value;
    setAreaNaliValue(naliValue);
    
    const sqft = naliToSqft(parseFloat(naliValue) || 0);
    handleNestedChange('specs', 'area', sqft.toString());
  };

  // Handle property type change
  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const isNewTypePlot = newType === 'plot';
    
    // Save previous values in case we need to switch back
    const prevBedrooms = formData.specs.bedrooms;
    const prevBathrooms = formData.specs.bathrooms;
    const prevArea = formData.specs.area;
    const prevPlotSize = formData.specs.plotSize;
    const prevPlotDimensions = formData.specs.plotDimensions;
    const prevPlotType = formData.specs.plotType;
    
    setFormData(prev => ({
      ...prev,
      propertyType: newType,
      specs: {
        ...prev.specs,
        // If switching to plot type, clear bedroom/bathroom fields
        bedrooms: isNewTypePlot ? '' : prevBedrooms,
        bathrooms: isNewTypePlot ? '' : prevBathrooms,
        // If switching to plot type, clear built-up area
        area: isNewTypePlot ? '' : prevArea,
        // If switching to regular property, preserve plot fields in case we switch back
        plotSize: isNewTypePlot ? (prevPlotSize || '') : prevPlotSize,
        plotDimensions: isNewTypePlot ? (prevPlotDimensions || '') : prevPlotDimensions,
        plotType: isNewTypePlot ? (prevPlotType || '') : prevPlotType,
        // Reset checkbox values based on type
        hasBedrooms: !isNewTypePlot,
        hasBathrooms: !isNewTypePlot,
      }
    }));
  };
  
  // Handle changes in nested objects like specs
  const handleNestedChange = (parentKey: string, childKey: string, value: string) => {
    if (parentKey === 'specs') {
      // Handle specs object directly since we know its structure
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [childKey]: value
        }
      }));
    } else {
      // For other potential nested objects (not currently used)
      console.warn(`Nested change for '${parentKey}' not specifically handled.`);
      // Fall back to direct assignment without spreading
      setFormData(prev => {
        const newState = { ...prev };
        const target = prev[parentKey as keyof PropertyFormData];
        
        if (target && typeof target === 'object') {
          // Create a new object rather than mutating
          const updatedValue = { ...target as Record<string, any> };
          updatedValue[childKey] = value;
          // Now assign back to the newState with a safer cast
          (newState[parentKey as keyof PropertyFormData] as Record<string, unknown>) = updatedValue;
        }
        return newState;
      });
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle image drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    handleImageFiles(files);
  };

  // Handle image file input
  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      handleImageFiles(files);
    }
  };

  // Process image files
  const handleImageFiles = (files: File[]) => {
    // Validate files
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size > 0 && file.size < 15 * 1024 * 1024
    );
    
    if (validFiles.length !== files.length) {
      console.warn(`${files.length - validFiles.length} files were skipped due to invalid type or size`);
    }
    
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    console.log(`Adding ${newImages.length} new images to form state`);
    setUploadedImages(prev => [...prev, ...newImages]);
  };

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
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('video/')
    );
    
    if (files.length > 0) {
      // Process all dropped video files
      files.forEach(file => handleVideoFile(file));
    }
  };

  // Handle video file input
  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      // Process all selected video files, not just the first one
      const files = Array.from(e.target.files);
      console.log(`${files.length} video files selected`);
      
      // Process each video file
      files.forEach(file => handleVideoFile(file));
      
      // Reset file input after processing all files
      e.target.value = '';
    }
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
      console.warn('File may not be a valid video:', file.name);
      alert(`${file.name} may not be a valid video file. Please check the file and try again.`);
      return;
    }
    
    // Check file size
    const maxSizeMB = 100;
    if (file.size > maxSizeMB * 1024 * 1024) {
      console.warn(`Video file too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB (max: ${maxSizeMB} MB)`);
      alert(`${file.name} is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum size is ${maxSizeMB} MB.`);
      return;
    }

    // Create object URL for preview
    try {
      const objectUrl = URL.createObjectURL(file);
      console.log('Created object URL for video preview:', objectUrl);
      
      // Add to uploaded videos array
      setUploadedVideos(prev => [...prev, { file, preview: objectUrl }]);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        videoFiles: [...(prev.videoFiles || []), file]
      }));
      
      console.log(`Video "${file.name}" added successfully - total videos: ${uploadedVideos.length + 1}`);
    } catch (error) {
      console.error('Error creating object URL for video:', error);
      alert(`Error processing video file ${file.name}. Please try again.`);
    }
  };

  // Handle removing a video
  const handleRemoveVideo = (index: number) => {
    console.log(`Removing video at index ${index}`);
    
    // Remove from preview list
    setUploadedVideos(prev => {
      const updated = [...prev];
      
      // Revoke object URL to prevent memory leaks
      if (updated[index]?.preview && updated[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(updated[index].preview);
      }
      
      updated.splice(index, 1);
      return updated;
    });
    
    // Update form data
    setFormData(prev => {
      const updatedVideoFiles = [...(prev.videoFiles || [])];
      updatedVideoFiles.splice(index, 1);
      return {
        ...prev,
        videoFiles: updatedVideoFiles
      };
    });

    console.log(`Video removed - ${uploadedVideos.length - 1} videos remaining`);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => URL.revokeObjectURL(image.preview));
      uploadedVideos.forEach(video => URL.revokeObjectURL(video.preview));
    };
  }, [uploadedImages, uploadedVideos]);

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const field = name.split('.')[1]; // gets 'hasBedrooms' or 'hasBathrooms'
    const correspondingField = field === 'hasBedrooms' ? 'bedrooms' : 'bathrooms';

    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: checked,
        [correspondingField]: checked ? prev.specs[correspondingField] : ''
      }
    }));
  };

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'propertyType') {
      handlePropertyTypeChange(e as React.ChangeEvent<HTMLSelectElement>);
      return;
    }
    
    if (name.includes('.')) {
      // Handle nested fields (specs)
      const [parent, child] = name.split('.');
      if (parent === 'specs') {
        setFormData(prev => ({
          ...prev,
          specs: {
            ...prev.specs,
            [child]: value,
          },
        }));
      } else {
        // For other potential nested objects - using a safer approach
        setFormData(prev => {
          const newState = { ...prev };
          const parentObj = prev[parent as keyof PropertyFormData];
          
          if (parentObj && typeof parentObj === 'object') {
            // Create a new copy and update it
            const newParentObj = { ...(parentObj as Record<string, any>) };
            newParentObj[child] = value;
            
            // Type assertion to make TypeScript happy
            (newState as any)[parent] = newParentObj;
          }
          
          return newState;
        });
      }
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle array field changes (features, amenities, images)
  const handleArrayFieldChange = (index: number, value: string, fieldName: 'features' | 'amenities' | 'images') => {
    setFormData(prev => {
      const newArray = [...prev[fieldName]];
      newArray[index] = value;
      return {
        ...prev,
        [fieldName]: newArray,
      };
    });
  };

  // Add new item to array fields
  const handleAddArrayItem = (fieldName: 'features' | 'amenities' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ''],
    }));
  };

  // Remove item from array fields
  const handleRemoveArrayItem = (index: number, fieldName: 'features' | 'amenities' | 'images') => {
    setFormData(prev => {
      const newArray = [...prev[fieldName]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [fieldName]: newArray.length ? newArray : [''], // Always keep at least one empty item
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      const requiredFields = ['title', 'price', 'location', 'description', 'propertyType', 'category'];
      for (const field of requiredFields) {
        if (!formData[field as keyof PropertyFormData]) {
          // Format the field name for a more user-friendly error message
          const fieldName = typeof field === 'string' 
            ? field.replace(/([A-Z])/g, ' $1').toLowerCase() 
            : String(field);
          throw new Error(`Please fill in the ${fieldName} field`);
        }
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Filter and safely handle arrays first
      const safeFeatures = (formData.features || []).filter(f => f && typeof f === 'string' && f.trim());
      const safeAmenities = (formData.amenities || []).filter(a => a && typeof a === 'string' && a.trim());
      
      // Maintain existing images
      const existingImages = (formData.images || []).filter(img => 
        img && typeof img === 'string' && img.trim() && !img.startsWith('blob:')
      );
      
      // Handle video URLs - Use all existing videos plus newly uploaded ones
      const finalVideoUrls = [...existingVideos];  // Start with existing videos
      
      // Add videoUrls to the propertyDataObj
      const propertyDataObj = {
        title: formData.title,
        price: formData.price,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        propertyType: formData.propertyType,
        specs: formData.specs,
        features: safeFeatures,
        amenities: safeAmenities,
        images: existingImages, 
        videoUrl: finalVideoUrls.length > 0 ? finalVideoUrls[0] : '',
        videoUrls: finalVideoUrls, // Explicitly include videoUrls array to handle deletions
        tourUrl: formData.tourUrl || '',
        id: formData.id
      };
      
      // Add the stringified property data - this is what the API expects
      formDataToSend.append('propertyData', JSON.stringify(propertyDataObj));
      
      console.log('Preparing to upload files');
      
      // Add image files directly with unique keys
      if (uploadedImages && uploadedImages.length > 0) {
        console.log(`Adding ${uploadedImages.length} image files to form data`);
        
        // Log each image for debugging
        uploadedImages.forEach((img, idx) => {
          if (img && img.file && img.file.size > 0) {
            console.log(`Adding image ${idx}: ${img.file.name} (${img.file.size} bytes), type: ${img.file.type}`);
            formDataToSend.append(`image-${idx}`, img.file);
          } else {
            console.warn(`Skipping invalid image at index ${idx}`);
          }
        });
      }
      
      // Handle video file submission - Send all videos instead of just the last one
      if (uploadedVideos && uploadedVideos.length > 0) {
        console.log(`Processing ${uploadedVideos.length} video files for upload`);
        
        // Add all valid video files to form data with unique keys
        uploadedVideos.forEach((videoItem, index) => {
          if (videoItem && videoItem.file && videoItem.file.size > 0) {
            const videoFile = videoItem.file;
            console.log(`  Adding video ${index}: ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB), type: ${videoFile.type}`);
            
            // Use unique keys for each video: video-0, video-1, etc.
            formDataToSend.append(`video-${index}`, videoFile);
          } else {
            console.warn(`  Skipping invalid video at index ${index}`);
          }
        });
        
        // Add metadata about the videos
        formDataToSend.append('hasVideos', 'true');
        formDataToSend.append('videoCount', uploadedVideos.length.toString());
      } else if (existingVideos && existingVideos.length > 0) {
        // If using existing video URLs 
        console.log(`Using ${existingVideos.length} existing video URLs`);
        formDataToSend.append('hasVideos', 'true');
        formDataToSend.append('videoCount', existingVideos.length.toString());
      } else {
        console.log('No video files or URLs provided');
        formDataToSend.append('hasVideos', 'false');
        formDataToSend.append('videoCount', '0');
      }
      
      // Verify what's in the form data before sending
      console.log('[handleSubmit] Verifying FormData keys before sending:');
      const keys = Array.from(formDataToSend.keys());
      console.log('  Keys found:', keys.join(', '));
      
      // Check for video files with both old and new format keys
      const videoKeys = keys.filter(key => key === 'video' || key.startsWith('video-'));
      if (videoKeys.length > 0) {
        console.log(`  CONFIRMED: Found ${videoKeys.length} video files with keys: ${videoKeys.join(', ')}`);
        videoKeys.forEach(key => {
          const videoEntry = formDataToSend.get(key);
          if (videoEntry instanceof File) {
            console.log(`    - ${key}: ${videoEntry.name} (${(videoEntry.size / (1024 * 1024)).toFixed(2)} MB)`);
          }
        });
      } else if (formDataToSend.get('hasVideos') === 'true') {
        console.log('  Video metadata found but no actual video files in FormData. This may be using existing videos.');
      } else {
        console.log('  No video files included in this submission.');
      }
      
      // Determine endpoint and method
      const endpoint = isEditing 
        ? `/api/properties/${formData.id}` 
        : '/api/properties';
      const method = isEditing ? 'PUT' : 'POST';
      
      console.log(`Submitting form data to ${endpoint} with method ${method}`);
      
      // Use a longer timeout for larger uploads
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      // Submit the form with fetch
      try {
        const response = await fetch(endpoint, {
          method,
          body: formDataToSend,
          signal: controller.signal,
          // Don't set content-type header - let the browser set it with proper boundary
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Try to get error details from response
          let errorDetail;
          try {
            const errorData = await response.json();
            errorDetail = errorData.error || errorData.message || `Server responded with status ${response.status}`;
          } catch (e) {
            errorDetail = `Server responded with status ${response.status}`;
          }
          
          throw new Error(`Failed to save property: ${errorDetail}`);
        }
        
        const result = await response.json();
        console.log('Form submitted successfully:', result);
        
        // Try to get the updated property data to refresh the video list
        try {
          if (formData.id) {
            const updatedPropertyResponse = await fetch(`/api/properties/${formData.id}`);
            if (updatedPropertyResponse.ok) {
              const updatedProperty = await updatedPropertyResponse.json();
              
              // Update the list of existing videos
              if (updatedProperty.videoUrls && updatedProperty.videoUrls.length > 0) {
                console.log(`Refreshing video list with ${updatedProperty.videoUrls.length} videos from the server`);
                setExistingVideos(updatedProperty.videoUrls);
              } else if (updatedProperty.videoUrl) {
                console.log(`Refreshing video list with single videoUrl from the server`);
                setExistingVideos([updatedProperty.videoUrl]);
              }
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing video list:', refreshError);
        }
        
        // Clear uploaded videos since they're now saved
        setUploadedVideos([]);
        
        // Reset form state
        setLoading(false);
        setError(null);
        
        // Redirect to property list on success
        router.push('/admin/properties');
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('The request took too long and was aborted. This might be due to a large file upload or network issues.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert video URLs to embeddable format
  function getEmbedUrl(url: string): string {
    if (!url) return '';
    
    try {
      // YouTube URL conversion
      if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
        const videoId = url.includes('youtube.com/watch') 
          ? new URL(url).searchParams.get('v')
          : url.split('/').pop()?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Vimeo URL conversion
      if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        return `https://player.vimeo.com/video/${videoId}`;
      }
      
      // Return original URL if not recognized
      return url;
    } catch (e) {
      // Return original URL if parsing fails
      return url;
    }
  }

  // Add a function to handle nested updates properly
  const handleNestedUpdate = <T extends Record<string, any>>(
    prevState: T, 
    key: keyof T, 
    value: any
  ): T => {
    return {
      ...prevState,
      [key]: value
    };
  };

  // Handle image reordering
  const handleImagesReorder = (reorderedImages: ImageItem[]) => {
    console.log('Images reordered:', reorderedImages);
    
    // Extract URLs from the reordered images
    const imageUrls = reorderedImages
      .filter(img => img.url || img.preview)
      .map(img => img.url || '');
      
    // Update formData with the new image order
    setFormData(prev => ({
      ...prev,
      images: imageUrls
    }));
    
    // Update the uploaded images preview order to match
    if (uploadedImages.length > 0) {
      const newUploadedImages = [...uploadedImages];
      // Sort uploaded images to match the new order where possible
      setUploadedImages(
        reorderedImages
          .filter(img => img.file)
          .map(img => {
            const match = newUploadedImages.find(
              uploaded => uploaded.file === img.file || 
                          uploaded.preview === img.preview
            );
            return match || { file: img.file as File, preview: img.preview as string };
          })
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-navy-800">
        {isEditing ? 'Edit Property' : 'Add New Property'}
      </h1>
      
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Property Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price*
              </label>
              <input
                type="text"
                id="price"
                name="price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="₹ 1,25,00,000 or ₹ 45,000/month"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location*
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nainital, Uttarakhand"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type*
              </label>
              <select
                id="propertyType"
                name="propertyType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.propertyType}
                onChange={handlePropertyTypeChange}
              >
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="buy">For Sale</option>
                <option value="lease">For Lease</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Property Specifications</h3>
          
          {/* Basic Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {!isPlotType && (
              <>
                <div>
                  <label htmlFor="specs.bedrooms" className="block mb-1 font-medium">
                    Bedrooms
                  </label>
                  <input
                    type="text"
                    id="specs.bedrooms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.specs.bedrooms}
                    onChange={e => handleNestedChange('specs', 'bedrooms', e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
                
                <div>
                  <label htmlFor="specs.bathrooms" className="block mb-1 font-medium">
                    Bathrooms
                  </label>
                  <input
                    type="text"
                    id="specs.bathrooms"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.specs.bathrooms}
                    onChange={e => handleNestedChange('specs', 'bathrooms', e.target.value)}
                    placeholder="e.g. 2"
                  />
                </div>
                
                <div>
                  <label htmlFor="specs.area" className="block mb-1 font-medium">
                    Built-up Area
                  </label>
                  <input
                    type="text"
                    id="specs.area"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.specs.area}
                    onChange={e => handleNestedChange('specs', 'area', e.target.value)}
                    placeholder="e.g. 2500 sq.ft"
                  />
                </div>
              </>
            )}
            
            {isPlotType ? (
              <>
                <div>
                  <label htmlFor="specs.plotSize" className="block mb-1 font-medium">
                    Plot Size
                  </label>
                  <input
                    type="text"
                    id="specs.plotSize"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.specs.plotSize || ''}
                    onChange={e => handleNestedChange('specs', 'plotSize', e.target.value)}
                    placeholder="e.g. 2 acres"
                  />
                </div>
                
                <div>
                  <label htmlFor="specs.plotDimensions" className="block mb-1 font-medium">
                    Plot Dimensions
                  </label>
                  <input
                    type="text"
                    id="specs.plotDimensions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.specs.plotDimensions || ''}
                    onChange={e => handleNestedChange('specs', 'plotDimensions', e.target.value)}
                    placeholder="e.g. 60 ft x 40 ft"
                  />
                </div>
                
                <div>
                  <label htmlFor="specs.plotType" className="block mb-1 font-medium">
                    Plot Type
                  </label>
                  <select
                    id="specs.plotType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.specs.plotType || ''}
                    onChange={e => handleNestedChange('specs', 'plotType', e.target.value)}
                  >
                    <option value="">Select Plot Type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed-use">Mixed-Use</option>
                  </select>
                </div>
              </>
            ) : null}
            
            <div>
              <label htmlFor="specs.landSize" className="block mb-1 font-medium">
                {isPlotType ? 'Total Land Area' : 'Land Size'}
              </label>
              <input
                type="text"
                id="specs.landSize"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.specs.landSize}
                onChange={e => handleNestedChange('specs', 'landSize', e.target.value)}
                placeholder={isPlotType ? "e.g. 5 acres" : "e.g. 0.5 acres"}
              />
            </div>
            
            <div>
              <label htmlFor="specs.naliSize" className="block mb-1 font-medium">
                Land Size in Nali
              </label>
              <input
                type="text"
                id="specs.naliSize"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.specs.naliSize || ''}
                onChange={e => handleNestedChange('specs', 'naliSize', e.target.value)}
                placeholder="e.g. 150 Nali"
              />
              <p className="text-xs text-gray-500 mt-1">1 Nali ≈ 2160 sq ft (local Uttarakhand measurement)</p>
            </div>
          </div>
        </div>

        {/* Property Type & Category */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="propertyType" className="block mb-1 font-medium">
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.propertyType}
                onChange={handlePropertyTypeChange}
              >
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="category" className="block mb-1 font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="buy">For Sale</option>
                <option value="lease">For Lease</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Featured Property Options */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-3">Featured Property Settings</h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={!!formData.featured}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  featured: e.target.checked,
                  // If not featured, clear the order
                  featuredOrder: e.target.checked ? (prev.featuredOrder || 1) : undefined
                }));
              }}
              className="h-4 w-4 text-navy-600 rounded border-gray-300 focus:ring-navy-500"
            />
            <label htmlFor="featured" className="ml-2 font-medium">
              Show as Featured Property
            </label>
          </div>
          
          {formData.featured && (
            <div className="ml-6">
              <label htmlFor="featuredOrder" className="block mb-1 text-sm">
                Display Order (lower numbers appear first)
              </label>
              <input
                type="number"
                id="featuredOrder"
                name="featuredOrder"
                min="1"
                max="99"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                value={formData.featuredOrder || 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    featuredOrder: isNaN(value) ? 1 : value
                  }));
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Properties with order 1 will appear first on the homepage, followed by 2, 3, etc.
              </p>
            </div>
          )}
        </div>

        {/* Image Section - keep the improved version */}
        <div className="space-y-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold border-b pb-2">Property Images</h3>
          
          {/* Current Images */}
          {(formData.images.some(img => img && img.trim() !== '') || uploadedImages.length > 0) && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Current Images</h4>
              <p className="text-sm text-gray-500 mb-2">
                Drag and drop images to reorder them. The first image will be used as the main property image.
              </p>
              <ImageGallery 
                images={[
                  ...formData.images
                    .filter(url => url && url.trim() !== '')
                    .map(url => ({ url })),
                  ...uploadedImages.map(img => ({ 
                    preview: img.preview, 
                    file: img.file 
                  }))
                ]} 
                editable={true}
                onImagesChange={handleImagesReorder}
                height={300}
              />
            </div>
          )}
          
          {/* Image Upload Zone - Separate from the gallery */}
          <div className="mt-6">
            <h4 className="text-md font-medium mb-2">Add New Images</h4>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-[#0A2E1C] bg-[#F5F8FF]' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-3">
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Drag & drop images here, or click to select files</p>
                <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WebP (Max 5MB each)</p>
                <p className="text-xs text-gray-500">Recommended size: 1600 x 800 pixels for optimal display</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageInput}
                  className="hidden"
                  id="image-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="px-4 py-2 bg-[#0A2E1C] text-white rounded-md"
                >
                  Select Images
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Section - Add back the video functionality */}
        <div className="space-y-4 p-4 mt-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold border-b pb-2">Property Videos</h3>
          
          {/* Existing Videos Display */}
          {existingVideos.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Current Videos ({existingVideos.length})</h4>
              <div className="space-y-3">
                {existingVideos.map((videoUrl, idx) => {
                  // Extract a more user-friendly name from the URL
                  const urlParts = videoUrl.split('/');
                  const filenameWithParams = urlParts[urlParts.length - 1] || '';
                  const filename = filenameWithParams.split('?')[0] || '';
                  
                  // Try to extract the original filename from the saved filename pattern
                  // Format is typically: video-0-timestamp-hash-originalfilename.ext
                  const parts = filename.split('-');
                  const originalName = parts.length > 4 
                    ? parts.slice(4).join('-') // Combine all parts after the hash
                    : filename; // Fallback to full filename
                  
                  return (
                    <div 
                      key={`existing-video-${idx}`} 
                      className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex-grow flex items-center">
                        <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center text-white mr-3">
                          <FaPlay size={14} />
                        </div>
                        <div className="truncate flex-grow">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {/* Show original name if extracted, otherwise show cleaned up filename */}
                            {originalName || `Video ${idx + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {videoUrl}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          title="Preview Video"
                          onClick={() => window.open(videoUrl, '_blank')}
                          className="text-navy-600 hover:text-navy-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Remove Video"
                          onClick={() => {
                            // Remove video from existingVideos
                            setExistingVideos(videos => videos.filter((_, i) => i !== idx));
                            
                            // Update formData to remove this video from videoUrls
                            setFormData(prev => {
                              const updatedVideoUrls = Array.isArray(prev.videoUrls) 
                                ? prev.videoUrls.filter((_, i) => i !== idx)
                                : [];
                                
                              return {
                                ...prev,
                                videoUrls: updatedVideoUrls,
                                // If we're removing the main videoUrl, update it to the first remaining video or empty
                                videoUrl: videoUrl === prev.videoUrl 
                                  ? (updatedVideoUrls.length > 0 ? updatedVideoUrls[0] : '')
                                  : prev.videoUrl
                              };
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show new uploaded videos waiting to be saved */}
          {uploadedVideos.length > 0 && (
            <div className="mt-3 mb-4">
              <h4 className="text-md font-medium mb-2">New Videos to Upload ({uploadedVideos.length})</h4>
              <div className="space-y-2">
                {uploadedVideos.map((video, index) => (
                  <div key={`video-${index}`} className="flex items-center justify-between p-3 bg-navy-50 rounded-md border border-navy-100">
                    <div className="flex items-center">
                      <FaPlay className="text-navy-600 mr-2" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{video.file.name}</span>
                        <span className="text-xs text-gray-500">
                          {video.file.type || 'Unknown type'}, {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="p-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition"
                      aria-label="Remove video"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Video Upload Area */}
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Upload New Video</h4>
            <div className="mb-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  videoDragActive ? 'border-[#0A2E1C] bg-[#F5F8FF]' : 'border-gray-300'
                }`}
                onDragEnter={handleVideoDrag}
                onDragOver={handleVideoDrag}
                onDragLeave={handleVideoDrag}
                onDrop={handleVideoDrop}
              >
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Drag & drop video here, or click to select a file</p>
                  <p className="text-xs text-gray-500">Supported formats: MP4, MOV, AVI (Max 100MB)</p>
                  <p className="text-xs text-gray-500">MP4 format recommended for best compatibility</p>
                  <input
                    type="file"
                    accept="video/*,.mp4,.mov,.avi"
                    onChange={handleVideoInput}
                    className="hidden"
                    id="video-upload"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className="px-4 py-2 bg-[#0A2E1C] text-white rounded-md"
                  >
                    Select Video
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Video URLs input */}
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Video URLs (Optional)</h4>
            <p className="text-xs text-gray-500 mb-2">Enter YouTube, Vimeo or direct video URLs if you don't want to upload a file.</p>
            
            {/* Display existing video URLs with ability to add/remove */}
            {Array.isArray(formData.videoUrls) ? formData.videoUrls.map((url, index) => (
              <div key={`videoUrl-${index}`} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...(Array.isArray(formData.videoUrls) ? formData.videoUrls : [])];
                    newUrls[index] = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      videoUrls: newUrls
                    }));
                  }}
                  placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newUrls = [...(Array.isArray(formData.videoUrls) ? formData.videoUrls : [])];
                    newUrls.splice(index, 1);
                    setFormData(prev => ({
                      ...prev,
                      videoUrls: newUrls
                    }));
                  }}
                  className="bg-red-50 text-red-500 px-3 py-2 rounded-md hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            )) : null}
            
            {/* Button to add new video URL */}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  videoUrls: [...(Array.isArray(prev.videoUrls) ? prev.videoUrls : []), '']
                }));
              }}
              className="mt-2 text-navy-600 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Video URL
            </button>
          </div>
          
          {/* 360° Virtual Tour Toggle */}
          <div className="mt-5 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="has-virtual-tour"
                checked={!!formData.tourUrl || showVirtualTour}
                onChange={(e) => {
                  setShowVirtualTour(e.target.checked);
                  if (!e.target.checked) {
                    // If unchecked, clear the tour URL
                    setFormData(prev => ({
                      ...prev,
                      tourUrl: ''
                    }));
                  }
                }}
                className="h-4 w-4 text-navy-600 rounded border-gray-300 focus:ring-navy-500"
              />
              <label htmlFor="has-virtual-tour" className="font-medium">
                Add 360° Virtual Tour
              </label>
            </div>
            
            {/* Only show the input if the checkbox is checked or if tourUrl already exists */}
            {(!!formData.tourUrl || showVirtualTour) && (
              <div className="ml-6">
                <label htmlFor="tourUrl" className="block mb-1 text-sm">
                  Virtual Tour URL
                </label>
                <input
                  type="text"
                  id="tourUrl"
                  name="tourUrl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter virtual tour URL"
                  value={formData.tourUrl}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Enter Matterport, 3DVista or other virtual tour embed URLs</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Property Features</h3>
          <p className="text-sm text-gray-500 mb-4">Add key features of the property</p>
          
          {formData.features.map((feature, index) => (
            <div key={`feature-${index}`} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                value={feature}
                onChange={(e) => handleArrayFieldChange(index, e.target.value, 'features')}
                placeholder="e.g. Panoramic mountain views"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(index, 'features')}
                className="bg-red-50 text-red-500 px-3 py-2 rounded-md hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('features')}
            className="mt-2 text-[#0A2E1C] hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Feature
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Local Amenities</h3>
          <p className="text-sm text-gray-500 mb-4">Add amenities available near the property</p>
          
          {formData.amenities.map((amenity, index) => (
            <div key={`amenity-${index}`} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                value={amenity}
                onChange={(e) => handleArrayFieldChange(index, e.target.value, 'amenities')}
                placeholder="e.g. High-speed internet connectivity"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(index, 'amenities')}
                className="bg-red-50 text-red-500 px-3 py-2 rounded-md hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleAddArrayItem('amenities')}
            className="mt-2 text-[#0A2E1C] hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Amenity
          </button>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#0A2E1C] text-white px-6 py-2 rounded-md hover:bg-[#184D30] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
} 