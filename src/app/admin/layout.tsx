'use client'

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

// Simple direct auth approach - no middleware needed
const ADMIN_PASSWORD = 'admin360'; // You can change this to your preferred password

// Error boundary component
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Admin panel error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading the admin panel. Please try refreshing the page.</p>
          <details className="text-sm text-gray-700 bg-white p-2 rounded border">
            <summary>Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.error && (this.state.error.toString())}
            </pre>
          </details>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Force a logout on first mount
  useEffect(() => {
    const init = async () => {
      try {
        // Clear any existing credentials on mount - this forces login on refresh
        localStorage.removeItem('adminLoggedIn');
        setIsAuthorized(false);
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing admin:", err);
        setError("Failed to initialize admin panel. Please try again.");
        setIsLoading(false);
      }
    };
    
    init();
  }, []);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        setIsAuthorized(true);
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to log in. Please try again.");
    }
  };
  
  const handleLogout = () => {
    try {
      localStorage.removeItem('adminLoggedIn');
      setIsAuthorized(false);
    } catch (err) {
      console.error("Logout error:", err);
      // Force reload as a fallback
      window.location.href = '/';
    }
  };
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading Admin Panel...</h2>
          <div className="mt-4 h-2 w-32 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-[#0A2E1C] animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show login form if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0A2E1C]">Admin Access</h1>
            <p className="text-gray-600 mt-2">Enter password to access the admin area</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2E1C]"
                placeholder="Enter admin password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#0A2E1C] text-white py-2 px-4 rounded-md hover:bg-[#0F3D27] transition-colors"
            >
              Log In
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Hint: A full rotation plus the area code for Denver</p>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Back to <a href="/" className="text-[#0A2E1C] hover:underline">Website</a></p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show admin UI if authorized
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#0A2E1C] text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold">
            Property Admin
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">
              View Website ↗
            </Link>
            <button 
              onClick={handleLogout}
              className="hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg mb-4 text-gray-700">Admin Menu</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/admin" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin') && !isActive('/admin/properties') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/properties" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/properties') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/inquiries" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/inquiries') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Inquiries
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/home-content" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/home-content') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Home Content
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/about-page" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/about-page') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    About Page
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/uttarakhand-guide" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/uttarakhand-guide') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Uttarakhand Guide
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/contact-page" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/contact-page') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Contact Page
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/settings" 
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      isActive('/admin/settings') 
                        ? 'bg-[#0A2E1C] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 