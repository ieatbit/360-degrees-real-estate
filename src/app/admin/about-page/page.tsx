'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/app/admin/layout';
import ActionButton from '@/components/ActionButton';
import Alert from '@/components/Alert';
import { Spinner } from '@/components/LoadingSpinner';
import ImageUploader from '@/components/ImageUploader';

interface AboutPageContent {
  title: string;
  subtitle: string;
  mainContent: string;
  mission: string;
  vision: string;
  bannerImage: string;
  ceoSection: {
    name: string;
    position: string;
    bio: string;
    imageUrl: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  teamSection: {
    title: string;
    subtitle: string;
    members: TeamMember[];
  };
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  imageUrl: string;
}

// Default CEO section
const defaultCeoSection = {
  name: 'John Doe',
  position: 'Chief Executive Officer',
  bio: 'With over 15 years of experience in the real estate industry, our CEO has a deep understanding of the Uttarakhand property market.',
  imageUrl: '',
  socialLinks: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: ''
  }
};

// Default content structure with safe defaults
const defaultContent: AboutPageContent = {
  title: 'About Us',
  subtitle: 'Learn more about our real estate company',
  mainContent: '',
  mission: '',
  vision: '',
  bannerImage: '',
  ceoSection: defaultCeoSection,
  teamSection: {
    title: 'Our Team',
    subtitle: 'Meet the people who make it all happen',
    members: []
  },
  updatedAt: new Date().toISOString()
};

// Create a specialized version of ImageUploader for the About page
const AboutImageUploader = (props: any) => {
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
      
      // Use the About page upload endpoint
      const response = await fetch('/api/about/upload', {
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

export default function AboutPageEditor() {
  const [content, setContent] = useState<AboutPageContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, []);

  // Helper function to load content
  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/about');
      if (!response.ok) {
        if (response.status === 404) {
          // If about page content doesn't exist yet, use the default
          setContent(defaultContent);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch about page content');
      }
      const data = await response.json();
      
      // Ensure ceoSection and its required properties exist
      const processedData = {
        ...data,
        ceoSection: {
          ...defaultCeoSection,
          ...(data.ceoSection || {}),
          socialLinks: {
            ...defaultCeoSection.socialLinks,
            ...(data.ceoSection?.socialLinks || {})
          }
        },
        teamSection: {
          title: data.teamSection?.title || 'Our Team',
          subtitle: data.teamSection?.subtitle || 'Meet the people who make it all happen',
          members: Array.isArray(data.teamSection?.members) ? data.teamSection.members : []
        }
      };
      
      setContent(processedData);
    } catch (error) {
      console.error('Error loading about page content:', error);
      setAlert({
        message: 'Failed to load about page content. Using default content.',
        type: 'error'
      });
      // Set default content on error
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...content,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save about page content');
      }

      setAlert({
        message: 'About page content saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving about page content:', error);
      setAlert({
        message: error instanceof Error ? error.message : 'Failed to save about page content',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('teamSection.')) {
      const teamField = name.split('.')[1];
      setContent(prev => ({
        ...prev,
        teamSection: {
          ...prev.teamSection,
          [teamField]: value
        }
      }));
    } else {
      setContent(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle team member input changes
  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setContent(prev => {
      const updatedMembers = [...prev.teamSection.members];
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value
      };
      
      return {
        ...prev,
        teamSection: {
          ...prev.teamSection,
          members: updatedMembers
        }
      };
    });
  };

  // Add a new team member
  const handleAddTeamMember = () => {
    setContent(prev => ({
      ...prev,
      teamSection: {
        ...prev.teamSection,
        members: [
          ...prev.teamSection.members,
          {
            id: Date.now().toString(),
            name: '',
            position: '',
            bio: '',
            imageUrl: ''
          }
        ]
      }
    }));
  };

  // Remove a team member
  const handleRemoveTeamMember = (index: number) => {
    setContent(prev => {
      const updatedMembers = [...prev.teamSection.members];
      updatedMembers.splice(index, 1);
      
      return {
        ...prev,
        teamSection: {
          ...prev.teamSection,
          members: updatedMembers
        }
      };
    });
  };

  // Update the CEO change handler to handle social link changes
  const handleCeoChange = (field: string, value: string) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1];
      setContent(prev => ({
        ...prev,
        ceoSection: {
          ...prev.ceoSection,
          socialLinks: {
            ...(prev.ceoSection?.socialLinks || {}),
            [socialField]: value
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        ceoSection: {
          ...prev.ceoSection,
          [field]: value
        }
      }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  // Safety check to ensure required objects exist
  const safeContent = {
    ...defaultContent,
    ...content,
    ceoSection: {
      ...defaultCeoSection,
      ...(content.ceoSection || {}),
      socialLinks: {
        ...defaultCeoSection.socialLinks,
        ...(content.ceoSection?.socialLinks || {})
      }
    },
    teamSection: {
      title: content.teamSection?.title || 'Our Team',
      subtitle: content.teamSection?.subtitle || 'Meet the people who make it all happen',
      members: Array.isArray(content.teamSection?.members) ? content.teamSection.members : []
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit About Page</h1>
          <p className="text-gray-600">Customize the content of your About Us page</p>
        </div>

        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
            className="mb-6"
          />
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Main Section */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Main Section</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={safeContent.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={safeContent.subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image
                </label>
                <AboutImageUploader
                  currentImageUrl={safeContent.bannerImage}
                  onImageUploaded={(url: string) => setContent({...safeContent, bannerImage: url})}
                  sectionId="about-banner"
                  label="Banner Image"
                />
              </div>
              
              <div>
                <label htmlFor="mainContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Main Content
                </label>
                <textarea
                  id="mainContent"
                  name="mainContent"
                  value={safeContent.mainContent}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={6}
                  required
                />
              </div>
            </div>
          </section>
          
          {/* Mission & Vision */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Mission & Vision</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-1">
                  Our Mission
                </label>
                <textarea
                  id="mission"
                  name="mission"
                  value={safeContent.mission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-1">
                  Our Vision
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  value={safeContent.vision}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
          </section>
          
          {/* CEO Section */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">CEO Section</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ceoName" className="block text-sm font-medium text-gray-700 mb-1">
                    CEO Name
                  </label>
                  <input
                    type="text"
                    id="ceoName"
                    value={safeContent.ceoSection.name}
                    onChange={(e) => handleCeoChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="ceoPosition" className="block text-sm font-medium text-gray-700 mb-1">
                    Position/Title
                  </label>
                  <input
                    type="text"
                    id="ceoPosition"
                    value={safeContent.ceoSection.position}
                    onChange={(e) => handleCeoChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="ceoBio" className="block text-sm font-medium text-gray-700 mb-1">
                  CEO Bio
                </label>
                <textarea
                  id="ceoBio"
                  value={safeContent.ceoSection.bio}
                  onChange={(e) => handleCeoChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEO Profile Image
                </label>
                <AboutImageUploader
                  currentImageUrl={safeContent.ceoSection.imageUrl}
                  onImageUploaded={(url: string) => handleCeoChange('imageUrl', url)}
                  sectionId="ceo-profile"
                  label="CEO Image"
                />
              </div>
              
              {/* Social Media Links */}
              <div>
                <h3 className="text-md font-medium mb-3">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      id="facebook"
                      value={safeContent.ceoSection.socialLinks?.facebook || ''}
                      onChange={(e) => handleCeoChange('socialLinks.facebook', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      value={safeContent.ceoSection.socialLinks?.instagram || ''}
                      onChange={(e) => handleCeoChange('socialLinks.instagram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      id="linkedin"
                      value={safeContent.ceoSection.socialLinks?.linkedin || ''}
                      onChange={(e) => handleCeoChange('socialLinks.linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      value={safeContent.ceoSection.socialLinks?.twitter || ''}
                      onChange={(e) => handleCeoChange('socialLinks.twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Team Section */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Team Section</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="teamSectionTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    id="teamSectionTitle"
                    name="teamSection.title"
                    value={safeContent.teamSection.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="teamSectionSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    id="teamSectionSubtitle"
                    name="teamSection.subtitle"
                    value={safeContent.teamSection.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <ActionButton 
                    onClick={handleAddTeamMember} 
                    variant="primary"
                    icon={<span>+</span>}
                    label="Add Team Member"
                  />
                </div>
                
                {safeContent.teamSection.members.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No team members added yet</p>
                    <ActionButton 
                      onClick={handleAddTeamMember} 
                      variant="primary"
                      icon={<span>+</span>}
                      label="Add Your First Team Member"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {safeContent.teamSection.members.map((member, index) => (
                      <div key={member.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Team Member #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Position
                            </label>
                            <input
                              type="text"
                              value={member.position || ''}
                              onChange={(e) => handleTeamMemberChange(index, 'position', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          <textarea
                            value={member.bio || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Image
                          </label>
                          <AboutImageUploader
                            currentImageUrl={member.imageUrl || ''}
                            onImageUploaded={(url: string) => handleTeamMemberChange(index, 'imageUrl', url)}
                            sectionId={`team-member-${index}`}
                            label="Profile Image"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          
          <div className="flex justify-end">
            <ActionButton
              onClick={() => {
                if (saving) return;
                if (formRef.current) {
                  formRef.current.requestSubmit();
                }
              }}
              variant="primary"
              className={`px-6 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              icon={saving ? <Spinner size="sm" /> : <span>💾</span>}
              label="Save Changes"
            />
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 