'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PropertyForm, { PropertyFormData } from '@/components/PropertyForm';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`/api/properties/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        
        const data = await response.json();
        setProperty(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0A2E1C] border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          {error || 'Property not found'}
        </div>
        <a href="/admin/properties" className="text-[#0A2E1C] hover:underline">
          Back to properties
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Property: {property.title}</h1>
      <PropertyForm initialData={property} isEditing={true} />
    </div>
  );
} 