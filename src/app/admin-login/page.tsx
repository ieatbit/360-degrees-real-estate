'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

const DEFAULT_ADMIN = 'admin';
const DEFAULT_PASSWORD = 'admin360';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error parameter in URL
    const errorParam = searchParams.get('error');
    if (errorParam === 'invalid_credentials') {
      setError('Invalid username or password');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugInfo('');

    try {
      // Basic validation
      if (!username || !password) {
        setError('Username and password are required');
        setIsLoading(false);
        return;
      }

      console.log('Attempting login with:', { username });
      setDebugInfo('Sending authentication request...');
      
      // Fallback to direct verification if middleware doesn't work
      if (username === DEFAULT_ADMIN && password === DEFAULT_PASSWORD) {
        console.log('Direct authentication successful');
        setDebugInfo('Direct authentication successful');
        
        // Create a base64 encoded Basic auth token
        const base64Credentials = btoa(`${username}:${password}`);
        
        // Store credentials in sessionStorage 
        sessionStorage.setItem('adminCredentials', base64Credentials);
        
        // Check if there's a redirect parameter
        const redirectPath = searchParams.get('redirect');
        
        // Delay redirect slightly to allow for state updates
        setTimeout(() => {
          if (redirectPath) {
            router.push(redirectPath);
          } else {
            router.push('/admin');
          }
        }, 500);
        
        return;
      }
      
      // Create a base64 encoded Basic auth token
      const base64Credentials = btoa(`${username}:${password}`);
      
      // Make a test request to the admin area with the credentials
      const response = await fetch('/admin', {
        headers: {
          'Authorization': `Basic ${base64Credentials}`
        }
      });
      
      console.log('Auth response status:', response.status);
      setDebugInfo(`Response status: ${response.status}`);
      
      if (response.ok) {
        // If successful, store credentials in sessionStorage and redirect
        sessionStorage.setItem('adminCredentials', base64Credentials);
        console.log('Authentication successful, redirecting...');
        setDebugInfo('Authentication successful, redirecting...');
        
        // Check if there's a redirect parameter
        const redirectPath = searchParams.get('redirect');
        
        // Delay redirect slightly to allow for state updates
        setTimeout(() => {
          if (redirectPath) {
            router.push(redirectPath);
          } else {
            router.push('/admin');
          }
        }, 500);
      } else {
        // If unauthorized, show error
        console.log('Authentication failed');
        setDebugInfo('Authentication failed - invalid credentials');
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleDefaultValues = () => {
    setUsername(DEFAULT_ADMIN);
    setPassword(DEFAULT_PASSWORD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A2E1C]">Admin Login</h1>
          <p className="text-gray-600 mt-2">Enter your credentials to access the admin area</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2E1C]"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2E1C]"
                placeholder="Enter your password"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <span className="text-gray-500">🙈</span>
                ) : (
                  <span className="text-gray-500">👁️</span>
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0A2E1C] text-white py-2 px-4 rounded-md hover:bg-[#0F3D27] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A2E1C] focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 text-gray-700 text-xs rounded">
            <p>Debug: {debugInfo}</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <button 
            onClick={handleDefaultValues}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Use default credentials
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Back to <a href="/" className="text-[#0A2E1C] hover:underline">Website</a></p>
        </div>
      </div>
    </div>
  );
} 