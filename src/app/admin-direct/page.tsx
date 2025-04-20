'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDirect() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Set admin credentials directly without middleware check
    const setCredentialsAndRedirect = () => {
      try {
        // Create credentials using hardcoded defaults
        const base64Credentials = btoa('admin:admin360');
        
        // Store in session storage
        sessionStorage.setItem('adminCredentials', base64Credentials);
        
        console.log('Direct admin access: credentials set');
        
        // Redirect to main admin page after a short delay
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } catch (err) {
        console.error('Error setting admin credentials:', err);
        setError('Failed to set admin credentials. Please try the regular login page.');
      } finally {
        setIsLoading(false);
      }
    };

    setCredentialsAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-[#0A2E1C] mb-4">Direct Admin Access</h1>
        
        {isLoading ? (
          <div>
            <p className="mb-4 text-gray-700">Setting admin credentials...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-[#0A2E1C] rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div>
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/admin-login" className="text-[#0A2E1C] hover:underline">
              Try regular login
            </a>
          </div>
        ) : (
          <div>
            <p className="text-green-600 mb-4">Admin credentials set successfully!</p>
            <p className="text-gray-700 text-sm mb-4">Redirecting to admin panel...</p>
            <a href="/admin" className="text-[#0A2E1C] hover:underline">
              Click here if not redirected automatically
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 