'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/app/admin/layout';
import ActionButton from '@/components/ActionButton';
import Alert from '@/components/Alert';
import { Spinner } from '@/components/LoadingSpinner';

interface FAQ {
  question: string;
  answer: string;
}

interface ContactPageContent {
  title: string;
  subtitle: string;
  heroImage: string;
  getInTouchText: string;
  officeLocation: {
    address: string;
    mapEmbed: string;
    showMap: boolean;
  };
  contactInfo: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  faqSection: {
    title: string;
    subtitle: string;
    faqs: FAQ[];
  };
  updatedAt: string;
}

// Default content structure for new pages
const defaultContent: ContactPageContent = {
  title: 'Contact Us',
  subtitle: "We're here to assist you with any queries about Uttarakhand properties",
  heroImage: '',
  getInTouchText: 'Whether you\'re looking to buy, sell, or lease property in Uttarakhand, our team of experts is ready to assist you. Fill out the form, and we\'ll get back to you as soon as possible.',
  officeLocation: {
    address: 'Mall Road, Almora, Uttarakhand',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27561.837268764513!2d79.63896734226673!3d29.59738209931433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a0b7328910d81f%3A0x9811d25dd87d8ed3!2sAlmora%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1710236428824!5m2!1sen!2sin',
    showMap: true
  },
  contactInfo: {
    email: 'info@360degreesrealestate.in',
    phone: '+91 98765 43210',
    whatsapp: '919759866333'
  },
  operatingHours: {
    weekdays: 'Monday - Saturday: 9 AM - 6 PM',
    weekends: 'Sunday: By Appointment Only'
  },
  faqSection: {
    title: 'Frequently Asked Questions',
    subtitle: '',
    faqs: [
      {
        question: 'How can I schedule a property visit?',
        answer: 'You can schedule a property visit by filling out our contact form, calling us directly, or sending us an email. Our team will arrange a convenient time for you to visit the property.'
      }
    ]
  },
  updatedAt: new Date().toISOString()
};

// Contact Page Image Uploader Component
const ContactImageUploader = (props: any) => {
  const { currentImageUrl, onImageUploaded, sectionId, label, className } = props;
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
      formData.append('image', file);
      formData.append('sectionId', sectionId);
      
      // Use the Contact page upload endpoint
      const response = await fetch('/api/contact-page/upload', {
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
  
  // Display image if there's a currentImageUrl or previewUrl
  const displayUrl = previewUrl || currentImageUrl;
  
  return (
    <div className={`w-full ${className || ''}`}>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      
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
              <span>🔄</span>
            </button>
          </div>
        ) : (
          // Upload placeholder
          <div 
            className="flex flex-col items-center justify-center p-6 text-center cursor-pointer h-40"
            onClick={handleButtonClick}
          >
            <span className="text-4xl mb-2">🖼️</span>
            <p className="text-gray-500">
              {isUploading ? 'Uploading...' : 'Drag and drop an image here or click to upload'}
            </p>
            {isUploading && (
              <div className="animate-spin mt-2 text-navy-600">⟳</div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {uploadError && (
        <div className="mt-1 text-red-500 text-sm flex items-center">
          <span className="mr-1">❌</span>
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
        Recommended image size: 1200 × 800 pixels, maximum 5MB
      </p>
    </div>
  );
};

export default function ContactPageEditor() {
  const [content, setContent] = useState<ContactPageContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Load content from API
  const loadContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact-page');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        console.error('Failed to load contact page content');
        setAlert({
          type: 'error',
          message: 'Failed to load content. Using default values.'
        });
        // Use default content if API fails
        setContent(defaultContent);
      }
    } catch (error) {
      console.error('Error loading contact page content:', error);
      setAlert({
        type: 'error',
        message: 'An error occurred while loading content. Using default values.'
      });
      // Use default content if API fails
      setContent(defaultContent);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load content on component mount
  useEffect(() => {
    loadContent();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAlert(null);
    
    try {
      const response = await fetch('/api/contact-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setAlert({
          type: 'success',
          message: 'Contact page content saved successfully!'
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error saving contact page content:', error);
      setAlert({
        type: 'error',
        message: (error as Error).message || 'An error occurred while saving content'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle input changes for simple text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields with dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setContent({
        ...content,
        [parent]: {
          ...content[parent as keyof ContactPageContent],
          [child]: value
        }
      });
    } else {
      setContent({
        ...content,
        [name]: value
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Handle nested fields with dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setContent({
        ...content,
        [parent]: {
          ...content[parent as keyof ContactPageContent],
          [child]: checked
        }
      });
    } else {
      setContent({
        ...content,
        [name]: checked
      });
    }
  };
  
  // Handle changes to FAQ items
  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const updatedFaqs = [...content.faqSection.faqs];
    updatedFaqs[index] = {
      ...updatedFaqs[index],
      [field]: value
    };
    
    setContent({
      ...content,
      faqSection: {
        ...content.faqSection,
        faqs: updatedFaqs
      }
    });
  };
  
  // Add a new FAQ
  const handleAddFaq = () => {
    setContent({
      ...content,
      faqSection: {
        ...content.faqSection,
        faqs: [
          ...content.faqSection.faqs,
          {
            question: '',
            answer: ''
          }
        ]
      }
    });
  };
  
  // Remove a FAQ
  const handleRemoveFaq = (index: number) => {
    const updatedFaqs = [...content.faqSection.faqs];
    updatedFaqs.splice(index, 1);
    
    setContent({
      ...content,
      faqSection: {
        ...content.faqSection,
        faqs: updatedFaqs
      }
    });
  };
  
  // Handle image upload for hero section
  const handleHeroImageUpload = (url: string) => {
    setContent({
      ...content,
      heroImage: url
    });
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Contact Page Editor</h1>
        
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message}
            onClose={() => setAlert(null)}
            className="mb-6"
          />
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Hero Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Hero Section</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={content.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subtitle" className="block text-sm font-medium mb-1">
                    Page Subtitle
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={content.subtitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <ContactImageUploader
                  currentImageUrl={content.heroImage}
                  onImageUploaded={handleHeroImageUpload}
                  sectionId="hero"
                  label="Hero Background Image"
                />
              </div>
            </div>
          </section>
          
          {/* Contact Information Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label htmlFor="getInTouchText" className="block text-sm font-medium mb-1">
                    Get In Touch Text
                  </label>
                  <textarea
                    id="getInTouchText"
                    name="getInTouchText"
                    value={content.getInTouchText}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <label htmlFor="contactInfo.email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="contactInfo.email"
                    name="contactInfo.email"
                    value={content.contactInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactInfo.phone" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="contactInfo.phone"
                    name="contactInfo.phone"
                    value={content.contactInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactInfo.whatsapp" className="block text-sm font-medium mb-1">
                    WhatsApp Number (without +)
                  </label>
                  <input
                    type="text"
                    id="contactInfo.whatsapp"
                    name="contactInfo.whatsapp"
                    value={content.contactInfo.whatsapp}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="919876543210"
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Operating Hours Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Operating Hours</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label htmlFor="operatingHours.weekdays" className="block text-sm font-medium mb-1">
                  Weekday Hours
                </label>
                <input
                  type="text"
                  id="operatingHours.weekdays"
                  name="operatingHours.weekdays"
                  value={content.operatingHours.weekdays}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Monday - Friday: 9 AM - 6 PM"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="operatingHours.weekends" className="block text-sm font-medium mb-1">
                  Weekend Hours
                </label>
                <input
                  type="text"
                  id="operatingHours.weekends"
                  name="operatingHours.weekends"
                  value={content.operatingHours.weekends}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Saturday & Sunday: 10 AM - 4 PM"
                />
              </div>
            </div>
          </section>
          
          {/* Office Location Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Office Location</h2>
            
            <div className="mb-4">
              <label htmlFor="officeLocation.address" className="block text-sm font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                id="officeLocation.address"
                name="officeLocation.address"
                value={content.officeLocation.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="officeLocation.mapEmbed" className="block text-sm font-medium mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="text"
                id="officeLocation.mapEmbed"
                name="officeLocation.mapEmbed"
                value={content.officeLocation.mapEmbed}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Get this from Google Maps by clicking "Share" and then "Embed a map", then copy the src URL from the iframe code.
              </p>
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="officeLocation.showMap"
                name="officeLocation.showMap"
                checked={content.officeLocation.showMap}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor="officeLocation.showMap" className="text-sm font-medium">
                Show Map on Contact Page
              </label>
            </div>
            
            {content.officeLocation.mapEmbed && (
              <div className="mt-4 border rounded-md overflow-hidden h-64">
                <iframe
                  src={content.officeLocation.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location Map"
                />
              </div>
            )}
          </section>
          
          {/* FAQ Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">FAQ Section</h2>
            
            <div className="mb-4">
              <label htmlFor="faqSection.title" className="block text-sm font-medium mb-1">
                FAQ Section Title
              </label>
              <input
                type="text"
                id="faqSection.title"
                name="faqSection.title"
                value={content.faqSection.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="faqSection.subtitle" className="block text-sm font-medium mb-1">
                FAQ Section Subtitle
              </label>
              <input
                type="text"
                id="faqSection.subtitle"
                name="faqSection.subtitle"
                value={content.faqSection.subtitle}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">FAQs</h3>
              
              {content.faqSection.faqs.map((faq, index) => (
                <div key={index} className="mb-6 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">FAQ #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor={`faq-${index}-question`} className="block text-sm font-medium mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      id={`faq-${index}-question`}
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required={true}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`faq-${index}-answer`} className="block text-sm font-medium mb-1">
                      Answer
                    </label>
                    <textarea
                      id={`faq-${index}-answer`}
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                      rows={3}
                      className="w-full p-2 border rounded-md"
                      required={true}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddFaq}
                className="mt-2 px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
              >
                Add FAQ
              </button>
            </div>
          </section>
          
          {/* Form Actions */}
          <div className="mt-8 flex justify-end">
            <ActionButton
              type="submit"
              color="primary"
              isLoading={isSaving}
              disabled={isSaving}
              className="px-6 py-2 rounded-md"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 