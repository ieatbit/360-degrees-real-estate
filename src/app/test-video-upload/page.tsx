'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestVideoUploadPage() {
  const [standardFileInfo, setStandardFileInfo] = useState<string>('No file selected');
  const [acceptMp4FileInfo, setAcceptMp4FileInfo] = useState<string>('No file selected');
  const [acceptAllVideoFileInfo, setAcceptAllVideoFileInfo] = useState<string>('No file selected');
  const [noAcceptFileInfo, setNoAcceptFileInfo] = useState<string>('No file selected');
  const [urlInputValue, setUrlInputValue] = useState<string>('');
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  
  // Handle standard file change - with accept="video/*"
  const handleStandardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setStandardFileInfo(
        `Selected file: ${file.name} (${file.type || 'unknown type'}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      console.log('Standard file input selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
    } else {
      setStandardFileInfo('No file selected');
    }
  };
  
  // Handle MP4 specific file change - with accept=".mp4"
  const handleAcceptMp4FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAcceptMp4FileInfo(
        `Selected file: ${file.name} (${file.type || 'unknown type'}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      console.log('MP4 file input selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
    } else {
      setAcceptMp4FileInfo('No file selected');
    }
  };
  
  // Handle all video file change - with accept="video/mp4,video/quicktime,video/webm"
  const handleAcceptAllVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAcceptAllVideoFileInfo(
        `Selected file: ${file.name} (${file.type || 'unknown type'}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      console.log('All video file input selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
    } else {
      setAcceptAllVideoFileInfo('No file selected');
    }
  };
  
  // Handle no restrictions file change - without any accept attribute
  const handleNoAcceptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNoAcceptFileInfo(
        `Selected file: ${file.name} (${file.type || 'unknown type'}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      console.log('No restrictions file input selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });
    } else {
      setNoAcceptFileInfo('No file selected');
    }
  };
  
  // Handle URL input for external videos
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInputValue(e.target.value);
  };
  
  // Process the direct file upload - similar to what we'd do in FormProperty
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFileUploadError(null);
    
    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);
      
      // Log all form entries for debugging
      console.log('Form data entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File: ${value.name}, type: ${value.type}, size: ${value.size} bytes`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Here we would usually send to the server, but we'll just log for testing
      console.log('Form submitted successfully');
      alert('Form data logged to console - check browser developer tools');
      
    } catch (error) {
      console.error('Error handling form submission:', error);
      setFileUploadError('Error processing form: ' + String(error));
    }
  };
  
  return (
    <div className="min-h-screen bg-navy-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-navy-800">Video Upload Test Page</h1>
        
        <p className="mb-4">This page is for testing and diagnosing video upload issues. Try each of these methods to see which ones work for selecting MP4 files.</p>
        
        <form onSubmit={handleFormSubmit} className="space-y-8">
          {fileUploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {fileUploadError}
            </div>
          )}
          
          {/* Standard video/* input */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Method 1: Standard Video Upload</h2>
            <p className="text-sm mb-4">Uses the standard <code>accept="video/*"</code> attribute:</p>
            <input 
              type="file" 
              name="standardVideo"
              accept="video/*"
              onChange={handleStandardFileChange}
              className="mb-2 block w-full"
            />
            <p className="text-sm font-medium">{standardFileInfo}</p>
          </div>
          
          {/* MP4 specific input */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Method 2: MP4 Only Upload</h2>
            <p className="text-sm mb-4">Uses the specific <code>accept=".mp4"</code> attribute:</p>
            <input 
              type="file" 
              name="mp4Video"
              accept=".mp4"
              onChange={handleAcceptMp4FileChange}
              className="mb-2 block w-full"
            />
            <p className="text-sm font-medium">{acceptMp4FileInfo}</p>
          </div>
          
          {/* All video formats input */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Method 3: All Video Formats Upload</h2>
            <p className="text-sm mb-4">Uses specific MIME types <code>accept="video/mp4,video/quicktime,video/webm"</code>:</p>
            <input 
              type="file" 
              name="allFormatVideo"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleAcceptAllVideoFileChange}
              className="mb-2 block w-full"
            />
            <p className="text-sm font-medium">{acceptAllVideoFileInfo}</p>
          </div>
          
          {/* No restrictions input */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Method 4: No Restrictions Upload</h2>
            <p className="text-sm mb-4">Uses no <code>accept</code> attribute to allow all file types:</p>
            <input 
              type="file" 
              name="anyFile"
              onChange={handleNoAcceptFileChange}
              className="mb-2 block w-full"
            />
            <p className="text-sm font-medium">{noAcceptFileInfo}</p>
          </div>
          
          {/* URL Input */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Method 5: External Video URL</h2>
            <p className="text-sm mb-4">Enter a URL to an external video (YouTube, Vimeo, MP4 direct link, etc.):</p>
            <input 
              type="url" 
              name="videoUrl"
              value={urlInputValue}
              onChange={handleUrlChange}
              placeholder="https://example.com/video.mp4"
              className="mb-2 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          {/* Submit button */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <button
              type="submit"
              className="bg-navy-600 text-white px-6 py-3 rounded hover:bg-navy-700 transition"
            >
              Test Form Submission
            </button>
            <p className="text-sm mt-2">This will log form data to the console but not upload anything.</p>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
} 