'use client'

import React from 'react';
import PropertyForm from '@/components/PropertyForm';

export default function NewPropertyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Property</h1>
      <PropertyForm />
    </div>
  );
} 