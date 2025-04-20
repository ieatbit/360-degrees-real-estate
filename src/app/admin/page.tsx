'use client'

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Properties</h2>
          <p className="text-gray-600 mb-4">Manage your property listings</p>
          <Link 
            href="/admin/properties" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Manage Properties →
          </Link>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Home Content</h2>
          <p className="text-gray-600 mb-4">Update your homepage content</p>
          <Link 
            href="/admin/home-content" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Edit Home Content →
          </Link>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Settings</h2>
          <p className="text-gray-600 mb-4">Configure site settings</p>
          <Link 
            href="/admin/settings" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Manage Settings →
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Admin Help</h2>
        <p className="text-blue-700 mb-3">
          Use the admin panel to manage your real estate website content. 
          Navigate using the menu on the left to access different sections.
        </p>
        <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
          <li>Add and edit property listings</li>
          <li>Update homepage content and featured properties</li>
          <li>Configure site settings like contact information</li>
          <li>Manage the about page content</li>
        </ul>
      </div>
    </div>
  );
} 