'use client'

import React, { useState, useEffect } from 'react';
import { HomePageContent, ContentSection } from '@/types';
import { FaImage, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import ImageUploader from '@/components/ImageUploader';

// Content section type options
const SECTION_TYPES = [
  { id: 'text', name: 'Text Section' },
  { id: 'image-text', name: 'Image with Text' },
  { id: 'gallery', name: 'Image Gallery' },
  { id: 'cards', name: 'Card Grid' },
  { id: 'cta', name: 'Call to Action' },
  { id: 'testimonials', name: 'Testimonials' },
  { id: 'stats', name: 'Statistics' }
];

export default function HomeContentPage() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Fetch current home content on load
  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/home-content');
      
      if (response.ok) {
        const data = await response.json();
        // Ensure customSections array exists
        if (!data.customSections) {
          data.customSections = [];
        }
        setContent(data);
      } else {
        throw new Error('Failed to fetch home content');
      }
    } catch (error) {
      console.error('Error fetching home content:', error);
      setMessage({
        text: 'Error loading home content. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) return;
    
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/home-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });
      
      if (response.ok) {
        const updatedContent = await response.json();
        setContent(updatedContent);
        setMessage({
          text: 'Home page content updated successfully!',
          type: 'success'
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update home content');
      }
    } catch (error) {
      console.error('Error saving home content:', error);
      setMessage({
        text: 'Error saving changes. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
      
      // Clear success message after 3 seconds
      if (message?.type === 'success') {
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContent(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Add a feature to the Why Choose Us section
  const addFeature = () => {
    if (!content) return;
    
    const newFeature = {
      title: 'New Feature',
      description: 'Description of the new feature',
      icon: 'feature'
    };
    
    setContent({
      ...content,
      whyChooseUsFeatures: [...content.whyChooseUsFeatures, newFeature]
    });
  };

  // Remove a feature from the Why Choose Us section
  const removeFeature = (index: number) => {
    if (!content) return;
    
    const newFeatures = [...content.whyChooseUsFeatures];
    newFeatures.splice(index, 1);
    
    setContent({
      ...content,
      whyChooseUsFeatures: newFeatures
    });
  };

  // Update a feature in the Why Choose Us section
  const updateFeature = (index: number, field: string, value: string) => {
    if (!content) return;
    
    const newFeatures = [...content.whyChooseUsFeatures];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    
    setContent({
      ...content,
      whyChooseUsFeatures: newFeatures
    });
  };

  // Add a new custom section
  const addCustomSection = () => {
    if (!content) return;
    
    const newSection: ContentSection = {
      id: uuidv4(),
      type: 'text',
      title: 'New Section',
      subtitle: 'Section subtitle',
      content: 'This is a new content section. Edit to add your content.',
      order: (content.customSections?.length || 0) + 1,
      enabled: true,
      items: []
    };
    
    setContent({
      ...content,
      customSections: [...(content.customSections || []), newSection]
    });
    
    // Set this as the active section
    setActiveSectionId(newSection.id);
  };

  // Remove a custom section
  const removeCustomSection = (id: string) => {
    if (!content || !content.customSections) return;
    
    const newSections = content.customSections.filter(section => section.id !== id);
    
    setContent({
      ...content,
      customSections: newSections
    });
    
    // Clear active section if it was removed
    if (activeSectionId === id) {
      setActiveSectionId(null);
    }
  };

  // Update a custom section
  const updateCustomSection = (id: string, field: string, value: any) => {
    if (!content || !content.customSections) return;
    
    const newSections = content.customSections.map(section => {
      if (section.id === id) {
        return {
          ...section,
          [field]: value
        };
      }
      return section;
    });
    
    setContent({
      ...content,
      customSections: newSections
    });
  };

  // Move section up or down
  const moveSection = (id: string, direction: 'up' | 'down') => {
    if (!content || !content.customSections) return;
    
    const sections = [...content.customSections];
    const index = sections.findIndex(section => section.id === id);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const temp = sections[index];
      sections[index] = sections[index - 1];
      sections[index - 1] = temp;
    } else if (direction === 'down' && index < sections.length - 1) {
      const temp = sections[index];
      sections[index] = sections[index + 1];
      sections[index + 1] = temp;
    }
    
    // Update order properties
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      order: idx + 1
    }));
    
    setContent({
      ...content,
      customSections: updatedSections
    });
  };

  // Add an item to a section
  const addSectionItem = (sectionId: string) => {
    if (!content || !content.customSections) return;
    
    const newSections = content.customSections.map(section => {
      if (section.id === sectionId) {
        const newItem = {
          id: uuidv4(),
          title: 'New Item',
          description: 'Item description',
          imageUrl: '',
          icon: 'star'
        };
        
        return {
          ...section,
          items: [...(section.items || []), newItem]
        };
      }
      return section;
    });
    
    setContent({
      ...content,
      customSections: newSections
    });
  };

  // Remove an item from a section
  const removeSectionItem = (sectionId: string, itemId: string) => {
    if (!content || !content.customSections) return;
    
    const newSections = content.customSections.map(section => {
      if (section.id === sectionId && section.items) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    });
    
    setContent({
      ...content,
      customSections: newSections
    });
  };

  // Update a section item
  const updateSectionItem = (sectionId: string, itemId: string, field: string, value: any) => {
    if (!content || !content.customSections) return;
    
    const newSections = content.customSections.map(section => {
      if (section.id === sectionId && section.items) {
        const newItems = section.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              [field]: value
            };
          }
          return item;
        });
        
        return {
          ...section,
          items: newItems
        };
      }
      return section;
    });
    
    setContent({
      ...content,
      customSections: newSections
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A2E1C]"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p>Error loading home page content. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Home Page Content</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Hero Title
              </label>
              <input
                type="text"
                id="heroTitle"
                name="heroTitle"
                value={content.heroTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-1">
                Hero Subtitle
              </label>
              <input
                type="text"
                id="heroSubtitle"
                name="heroSubtitle"
                value={content.heroSubtitle || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="heroBackgroundImage" className="block text-sm font-medium text-gray-700 mb-1">
                Background Image
              </label>
              <ImageUploader
                currentImageUrl={content.heroBackgroundImage || ''}
                onImageUploaded={(url) => {
                  setContent({
                    ...content,
                    heroBackgroundImage: url
                  });
                }}
                sectionId="hero"
                label="Hero Background Image"
              />
            </div>
          </div>
        </section>

        {/* Featured Properties Section */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Featured Properties Section</h2>
          
          <div>
            <label htmlFor="featuredSectionTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              id="featuredSectionTitle"
              name="featuredSectionTitle"
              value={content.featuredSectionTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Why Choose Us Section</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="whyChooseUsTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Section Title
              </label>
              <input
                type="text"
                id="whyChooseUsTitle"
                name="whyChooseUsTitle"
                value={content.whyChooseUsTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Features</h3>
              
              {content.whyChooseUsFeatures.map((feature, index) => (
                <div key={index} className="mb-4 p-4 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Feature {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`feature-${index}-title`} className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id={`feature-${index}-title`}
                        value={feature.title}
                        onChange={e => updateFeature(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`feature-${index}-description`} className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`feature-${index}-description`}
                        value={feature.description}
                        onChange={e => updateFeature(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`feature-${index}-icon`} className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        id={`feature-${index}-icon`}
                        value={feature.icon}
                        onChange={e => updateFeature(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="location">Location</option>
                        <option value="price">Price</option>
                        <option value="verify">Verify</option>
                        <option value="tour">Virtual Tour</option>
                        <option value="feature">Feature</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700"
              >
                <FaPlus className="mr-2" /> Add Feature
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">About Section</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="aboutSectionTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Section Title
              </label>
              <input
                type="text"
                id="aboutSectionTitle"
                name="aboutSectionTitle"
                value={content.aboutSectionTitle || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="aboutSectionContent" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="aboutSectionContent"
                name="aboutSectionContent"
                value={content.aboutSectionContent || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
            
            <div>
              <label htmlFor="aboutSectionImage" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <ImageUploader
                currentImageUrl={content.aboutSectionImage || ''}
                onImageUploaded={(url) => {
                  setContent({
                    ...content,
                    aboutSectionImage: url
                  });
                }}
                sectionId="about"
                label="About Section Image"
              />
            </div>
          </div>
        </section>

        {/* Custom Sections */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Custom Sections</h2>
            <button
              type="button"
              onClick={addCustomSection}
              className="inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700"
            >
              <FaPlus className="mr-2" /> Add Section
            </button>
          </div>
          
          {content.customSections && content.customSections.length > 0 ? (
            <div className="space-y-4">
              {content.customSections.map((section) => (
                <div 
                  key={section.id} 
                  className={`p-4 rounded-md border ${activeSectionId === section.id ? 'border-navy-500 bg-navy-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{section.title || 'Untitled Section'}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {SECTION_TYPES.find(t => t.id === section.type)?.name || section.type}
                      </span>
                      {!section.enabled && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 'up')}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-25"
                        disabled={section.order <= 1}
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, 'down')}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-25"
                        disabled={section.order >= (content.customSections?.length || 0)}
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                        className="text-navy-500 hover:text-navy-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomSection(section.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {activeSectionId === section.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section Type
                          </label>
                          <select
                            value={section.type}
                            onChange={(e) => updateCustomSection(section.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            {SECTION_TYPES.map((type) => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => updateCustomSection(section.id, 'subtitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={section.content || ''}
                          onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color
                          </label>
                          <input
                            type="text"
                            value={section.bgColor || ''}
                            onChange={(e) => updateCustomSection(section.id, 'bgColor', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="#ffffff or bg-gray-100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Text Color
                          </label>
                          <input
                            type="text"
                            value={section.textColor || ''}
                            onChange={(e) => updateCustomSection(section.id, 'textColor', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="#000000 or text-gray-900"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL
                        </label>
                        <ImageUploader
                          currentImageUrl={section.imageUrl || ''}
                          onImageUploaded={(url) => updateCustomSection(section.id, 'imageUrl', url)}
                          sectionId={`custom-${section.id}`}
                          label="Section Image"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`section-${section.id}-enabled`}
                          checked={section.enabled}
                          onChange={(e) => updateCustomSection(section.id, 'enabled', e.target.checked)}
                          className="h-4 w-4 text-navy-600 rounded border-gray-300"
                        />
                        <label htmlFor={`section-${section.id}-enabled`} className="ml-2 text-sm font-medium text-gray-700">
                          Section Enabled
                        </label>
                      </div>
                      
                      {/* Section Items (for types that need them) */}
                      {(['cards', 'gallery', 'testimonials'].includes(section.type)) && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Items</h4>
                            <button
                              type="button"
                              onClick={() => addSectionItem(section.id)}
                              className="text-xs bg-navy-600 text-white px-2 py-1 rounded hover:bg-navy-700"
                            >
                              <FaPlus className="inline mr-1" /> Add Item
                            </button>
                          </div>
                          
                          {section.items && section.items.length > 0 ? (
                            <div className="space-y-3">
                              {section.items.map((item) => (
                                <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-sm font-medium">{item.title || 'Untitled Item'}</h5>
                                    <button
                                      type="button"
                                      onClick={() => removeSectionItem(section.id, item.id)}
                                      className="text-xs text-red-500 hover:text-red-700"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Title
                                      </label>
                                      <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => updateSectionItem(section.id, item.id, 'title', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Image
                                      </label>
                                      <ImageUploader
                                        currentImageUrl={item.imageUrl || ''}
                                        onImageUploaded={(url) => updateSectionItem(section.id, item.id, 'imageUrl', url)}
                                        sectionId={`item-${section.id}-${item.id}`}
                                        label="Item Image"
                                        className="text-xs"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Description
                                    </label>
                                    <textarea
                                      value={item.description || ''}
                                      onChange={(e) => updateSectionItem(section.id, item.id, 'description', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No items added yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-md border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">No custom sections added yet.</p>
              <button
                type="button"
                onClick={addCustomSection}
                className="inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700"
              >
                <FaPlus className="mr-2" /> Add Your First Section
              </button>
            </div>
          )}
        </section>

        {/* SEO Settings */}
        <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                id="seoTitle"
                name="seoTitle"
                value={content.seoTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Title tag for the home page (50-60 characters recommended)
              </p>
            </div>
            
            <div>
              <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                value={content.seoDescription}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Meta description for the home page (150-160 characters recommended)
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 