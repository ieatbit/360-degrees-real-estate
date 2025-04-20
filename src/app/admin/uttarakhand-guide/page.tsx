"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// Simple notification component to replace react-hot-toast
const Notification = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <div className="flex items-center">
        <div className="mr-3">
          {type === 'success' ? (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <p>{message}</p>
        <button onClick={onClose} className="ml-auto">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface UttarakhandGuideContent {
  title: string;
  subtitle: string;
  content: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
}

export default function UttarakhandGuidePage() {
  const [content, setContent] = useState<UttarakhandGuideContent>({
    title: 'Uttarakhand Guide',
    subtitle: 'Discover the beauty and opportunities in Uttarakhand',
    content: '',
    heroImage: '/images/uttarakhand-mountains.svg',
    metaTitle: 'Uttarakhand Guide - 360° Real Estate',
    metaDescription: 'Everything you need to know about Uttarakhand - tourism, property investment, local attractions, and more.',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'} | null>(null);
  
  // Simple toast function to replace react-hot-toast
  const toast = {
    success: (message: string) => {
      setNotification({ show: true, message, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    },
    error: (message: string) => {
      setNotification({ show: true, message, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };
  
  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/uttarakhand-guide');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Failed to fetch Uttarakhand guide content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);
  
  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Handle image upload if selected
      let heroImagePath = content.heroImage;
      
      if (selectedImage) {
        // Check file size before uploading
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (selectedImage.size > MAX_SIZE) {
          toast.error('Image size exceeds 5MB limit. Please choose a smaller image.');
          setIsSaving(false);
          return;
        }
        
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('type', 'uttarakhand-guide');
        
        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || `Upload failed with status: ${uploadResponse.status}`);
          }
          
          const uploadData = await uploadResponse.json();
          
          if (!uploadData.success) {
            throw new Error(uploadData.error || 'Unknown upload error');
          }
          
          heroImagePath = uploadData.filePath;
          console.log('File uploaded successfully:', uploadData);
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          toast.error(`Failed to upload image: ${uploadError.message || 'Unknown error'}`);
          setIsSaving(false);
          return;
        }
      }
      
      // Save content
      const saveResponse = await fetch('/api/uttarakhand-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...content,
          heroImage: heroImagePath,
        }),
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || `Save failed with status: ${saveResponse.status}`);
      }
      
      toast.success('Uttarakhand Guide content saved successfully');
      // Update content with the saved data
      const updatedData = await saveResponse.json();
      setContent(updatedData);
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (error: any) {
      console.error('Error saving Uttarakhand Guide content:', error);
      toast.error(`Failed to save content: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {notification && notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <h1 className="text-2xl font-bold mb-6">Uttarakhand Guide Content</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Title
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({...content, title: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => setContent({...content, subtitle: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title (for SEO)
            </label>
            <input
              type="text"
              value={content.metaTitle}
              onChange={(e) => setContent({...content, metaTitle: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (for SEO)
            </label>
            <textarea
              value={content.metaDescription}
              onChange={(e) => setContent({...content, metaDescription: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative h-40 w-64 bg-gray-100 rounded-md overflow-hidden">
                {(previewImage || content.heroImage) && (
                  <Image 
                    src={previewImage || content.heroImage}
                    alt="Hero image preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <div className="mt-1 text-xs text-gray-500">
                  <p>Recommended size: 1600 x 600 pixels</p>
                  <p className="mt-1 font-medium">Maximum file size: 5MB</p>
                  <p className="mt-1">For better performance, compress your images before uploading.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Content (HTML)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, etc.)
            </p>
            <textarea
              value={content.content}
              onChange={(e) => setContent({...content, content: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md font-mono"
              rows={15}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-[#0F2C5A] text-white rounded-md hover:bg-[#183E7D] disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 