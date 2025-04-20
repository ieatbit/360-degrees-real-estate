'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { FaGripVertical, FaStar, FaPlus } from 'react-icons/fa';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  category: 'buy' | 'lease';
  propertyType: string;
  specs: {
    bedrooms: string;
    bathrooms: string;
    area: string;
    landSize: string;
  };
  featured?: boolean;
  featuredOrder?: number;
  createdAt: string;
  updatedAt: string;
  videoUrl?: string;
  videoUrls?: string[];
}

// Create a client-side only DnD component to prevent hydration errors
const ClientSideDragDropContext: React.FC<{
  children: React.ReactNode;
  onDragStart: () => void;
  onDragEnd: (result: DropResult) => Promise<void>;
  items: any[];
}> = ({ children, onDragStart, onDragEnd, items }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [renderKey, setRenderKey] = useState(Date.now());
  
  // Force remount if items change
  useEffect(() => {
    if (isMounted) {
      // Give a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setRenderKey(Date.now());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted, items]);
  
  // Only mount on client-side
  useEffect(() => {
    setIsMounted(true);
    
    // Fix for react-beautiful-dnd by disabling pointer events in the frame after a remount
    const handleNextFrame = () => {
      requestAnimationFrame(() => {
        document.body.style.pointerEvents = '';
      });
    };
    
    document.body.style.pointerEvents = 'none';
    handleNextFrame();
    
    return () => {
      document.body.style.pointerEvents = '';
    };
  }, []);
  
  if (!isMounted) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <DragDropContext key={renderKey} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'buy' | 'lease'>('all');
  const [savingOrder, setSavingOrder] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Add CSS for drag-and-drop effects
  useEffect(() => {
    // Add <style> element to head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .dragging-active .draggable-item {
        transition: transform 0.2s;
      }
      body.dragging {
        cursor: grabbing !important;
        user-select: none;
        touch-action: none;
      }
      .draggable-item.dragging {
        background-color: #f7fafc;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 999 !important;
        opacity: 0.9;
      }
      /* Prevent scrolling when dragging on touch devices */
      body.dragging {
        overflow: hidden;
      }
      /* Better visual indicator for touch devices */
      @media (pointer: coarse) {
        .draggable-item {
          position: relative;
        }
        .draggable-item:after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: transparent;
          z-index: 1;
        }
      }
      /* Custom styling for the placeholder */
      .drop-placeholder {
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        background-color: #f9fafb;
        margin-bottom: 8px;
        height: 74px;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0% {
          background-color: #f9fafb;
        }
        50% {
          background-color: #f3f4f6;
        }
        100% {
          background-color: #f9fafb;
        }
      }
      /* Improve spacing between draggable items */
      .featured-property-list > * + * {
        margin-top: 12px;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Add touch event handler to prevent scrolling during drag
    const preventScrollDuringDrag = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventScrollDuringDrag, { passive: false });
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
      document.removeEventListener('touchmove', preventScrollDuringDrag);
    };
  }, [isDragging]);
  
  useEffect(() => {
    // Set initial filters from URL query parameters
    const category = searchParams.get('category') as 'buy' | 'lease' | null;
    if (category) {
      setCategoryFilter(category);
    }
    
    // Fetch properties
    fetchProperties();
  }, [searchParams]);
  
  const fetchProperties = async () => {
    try {
      setLoading(true);
      let url = '/api/properties';
      const params = new URLSearchParams();
      
      const category = searchParams.get('category') as 'buy' | 'lease' | null;
      if (category) {
        params.append('category', category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      
      const data = await response.json();
      setProperties(data);
      
      // Separate featured properties and sort by featuredOrder
      const featured = data
        .filter((p: Property) => p.featured)
        .sort((a: Property, b: Property) => {
          // Default to maximum value if featuredOrder is not set
          const orderA = a.featuredOrder || Number.MAX_SAFE_INTEGER;
          const orderB = b.featuredOrder || Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      
      setFeaturedProperties(featured);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle drag start
  const handleDragStart = () => {
    console.log('Drag started');
    setIsDragging(true);
    // Add a class to the body to prevent scrolling during drag
    document.body.classList.add('dragging');
  };

  // Handle drag end for reordering featured properties
  const handleDragEnd = async (result: DropResult) => {
    console.log('Drag ended:', result);
    setIsDragging(false);
    document.body.classList.remove('dragging');
    
    // Drop outside droppable area
    if (!result.destination) {
      console.log('Dropped outside droppable area');
      return;
    }
    
    // No movement
    if (result.destination.index === result.source.index) {
      console.log('No movement detected');
      return;
    }
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    console.log(`Moving item from position ${sourceIndex + 1} to ${destinationIndex + 1}`);
    
    // Reorder the featured properties array
    const reorderedProperties = Array.from(featuredProperties);
    const [movedItem] = reorderedProperties.splice(sourceIndex, 1);
    reorderedProperties.splice(destinationIndex, 0, movedItem);
    
    // Update local state immediately
    setFeaturedProperties(reorderedProperties);
    
    // Update orders and save to database
    try {
      setSavingOrder(true);
      
      // Create a timeout to ensure UI updates first
      setTimeout(async () => {
        try {
          // Process each update sequentially with updated orders
          for (let index = 0; index < reorderedProperties.length; index++) {
            const property = reorderedProperties[index];
            const newOrder = index + 1; // 1-based index for display
            
            console.log(`Setting property "${property.title}" to order ${newOrder}`);
            
            const updatedProperty = {
              ...property,
              featuredOrder: newOrder
            };
            
            // Update each property individually using FormData
            const formData = new FormData();
            formData.append('propertyData', JSON.stringify(updatedProperty));
            formData.append('hasVideos', Boolean(property.videoUrl).toString());
            formData.append('videoCount', property.videoUrl ? '1' : '0');
            
            const response = await fetch(`/api/properties/${property.id}`, {
              method: 'PUT',
              body: formData,
            });
            
            if (!response.ok) {
              console.error(`Failed to update order for property ${property.id}`);
            }
          }
          
          // Success! Refresh properties list
          await fetchProperties();
        } catch (error) {
          console.error('Error updating property order:', error);
          alert('Failed to save property order. Please try again.');
        } finally {
          setSavingOrder(false);
        }
      }, 100); // Small delay to ensure UI updates first
    } catch (error) {
      console.error('Error preparing property updates:', error);
      setSavingOrder(false);
    }
  };
  
  // Toggle featured status
  const toggleFeatured = async (property: Property) => {
    try {
      const updatedProperty = { 
        ...property, 
        featured: !property.featured,
        // If featuring, add to end of list; if unfeaturing, clear order
        featuredOrder: !property.featured ? featuredProperties.length + 1 : undefined
      };
      
      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append('propertyData', JSON.stringify(updatedProperty));
      formData.append('hasVideos', Boolean(property.videoUrl).toString());
      formData.append('videoCount', property.videoUrl ? '1' : '0');
      
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        // No Content-Type header - browser sets it automatically with boundary
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update property');
      }
      
      // Refresh properties
      await fetchProperties();
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    }
  };
  
  // Filter properties based on search term and category
  const filteredProperties = properties.filter(property => {
    // Search term filter
    const matchesSearch = searchTerm.trim() === '' || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || property.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Apply category filter and update URL
  const handleCategoryFilterChange = (category: 'all' | 'buy' | 'lease') => {
    setCategoryFilter(category);
    
    if (category === 'all') {
      router.push('/admin/properties');
    } else {
      router.push(`/admin/properties?category=${category}`);
    }
  };
  
  // Handle property deletion
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete property');
      }
      
      // Remove the deleted property from the state
      setProperties(properties.filter(property => property.id !== id));
      setFeaturedProperties(featuredProperties.filter(property => property.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };
  
  // Force react-beautiful-dnd to recognize elements after hydration
  useEffect(() => {
    // Small timeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      console.log('Forced react-beautiful-dnd to update');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [featuredProperties.length]);
  
  // Render a custom placeholder component
  const renderPlaceholder = () => {
    return <div className="drop-placeholder"></div>;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link 
          href="/admin/properties/new" 
          className="bg-[#0A2E1C] text-white px-4 py-2 rounded-md hover:bg-[#184D30] transition-colors inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Property
        </Link>
      </div>
      
      {/* Featured Properties Section */}
      <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FaStar className="text-amber-500 mr-2" /> 
            Featured Properties
            {savingOrder && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-amber-600 border-r-transparent align-[-0.125em]"></div>
                <span className="ml-1">Saving order...</span>
              </span>
            )}
          </h2>
          <div className="text-sm text-gray-500 flex items-center">
            <span className="hidden md:inline">Click and drag property cards to reorder</span>
            <span className="md:hidden">Tap and hold to drag</span>
          </div>
        </div>
        
        {featuredProperties.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-2">No featured properties yet.</p>
            <p className="text-sm text-gray-400">Use the star icon in the property list to feature properties.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p><strong>How to reorder:</strong> Click (or tap and hold on mobile) any property card below and drag it to a new position.</p>
            </div>
            <ClientSideDragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} items={featuredProperties}>
              <Droppable 
                droppableId="featured-properties" 
                isDropDisabled={false} 
                isCombineEnabled={false} 
                ignoreContainerClipping={false}
              >
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`featured-property-list ${isDragging ? 'dragging-active' : ''}`}
                    style={{ minHeight: featuredProperties.length ? '150px' : 'auto' }}
                  >
                    {featuredProperties.map((property, index) => (
                      <Draggable key={property.id} draggableId={property.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              margin: '0 0 12px 0', // Ensure consistent spacing
                              ...(snapshot.isDragging ? {
                                boxShadow: '0 5px 10px rgba(0, 0, 0, 0.15)',
                                opacity: 0.9,
                                zIndex: 999,
                              } : {})
                            }}
                            className={`bg-white rounded-lg border border-gray-200 p-3 flex items-center relative ${
                              snapshot.isDragging ? 'dragging' : ''
                            } hover:bg-gray-50`}
                            data-position={index + 1}
                            aria-label={`Property ${property.title}, currently in position ${index + 1}`}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="mr-3 p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                            >
                              <FaGripVertical size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-gray-500">{property.location}</div>
                            </div>
                            <div className="flex space-x-3 items-center">
                              <div className="text-sm text-gray-500">
                                Display order: <span className="font-semibold">{index + 1}</span>
                              </div>
                              <button
                                onClick={() => toggleFeatured(property)}
                                className="p-2 text-amber-500 hover:text-red-600 bg-amber-50 rounded-md"
                                title="Remove from featured"
                              >
                                <FaStar />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {/* Extra drop zone at the bottom for better UX */}
                    {isDragging && (
                      <div className="h-16 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 opacity-50 mb-2" />
                    )}
                  </div>
                )}
              </Droppable>
            </ClientSideDragDropContext>
          </>
        )}
      </div>
      
      {/* Search and Filter Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title or location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value as 'all' | 'buy' | 'lease')}
            >
              <option value="all">All Properties</option>
              <option value="buy">For Sale</option>
              <option value="lease">For Lease</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Properties List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0A2E1C] border-r-transparent"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No properties found.</p>
          <Link 
            href="/admin/properties/new" 
            className="mt-2 inline-block text-[#0A2E1C] hover:underline"
          >
            Add a new property
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className={property.featured ? "bg-amber-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{property.title}</div>
                    <div className="text-sm text-gray-500">{property.propertyType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      property.category === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {property.category === 'buy' ? 'For Sale' : 'For Lease'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(property.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleFeatured(property)}
                        className={`${property.featured 
                          ? 'text-amber-500 hover:text-gray-600' 
                          : 'text-gray-400 hover:text-amber-500'}`}
                        title={property.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <FaStar />
                      </button>
                      <Link 
                        href={`/admin/properties/${property.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                      <Link 
                        href={`/property/${property.id}`}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 