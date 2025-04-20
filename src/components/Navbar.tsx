'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';

interface NavItem {
  title: string;
  path: string;
  order: number;
  visible: boolean;
}

interface Settings {
  siteName: string;
  navigation: NavItem[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: '360° Real Estate',
    navigation: [
      { title: 'Home', path: '/', order: 1, visible: true },
      { title: 'Properties', path: '/properties', order: 2, visible: true },
      { title: 'About', path: '/about', order: 4, visible: true },
      { title: 'Contact', path: '/contact', order: 5, visible: true }
    ],
    socialLinks: {
      facebook: '#',
      instagram: '#'
    }
  });
  
  const pathname = usePathname();
  
  useEffect(() => {
    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    fetchSettings();
    
    // Scroll event listener for navbar background
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when a link is clicked or when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  // Sort navigation items by order
  const sortedNavigation = [...(settings.navigation || [])].sort((a, b) => a.order - b.order);
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        isScrolled || isOpen ? 'bg-white text-gray-900 shadow-md' : 'bg-transparent text-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-lg md:text-xl">
            <Link href="/" className="hover:text-gray-200 transition-colors">
              {settings.siteName}
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {sortedNavigation.filter(item => item.visible).map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.path 
                      ? 'bg-blue-600 text-white' 
                      : (isScrolled 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'hover:bg-white/10')
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              } focus:outline-none transition-colors`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white text-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {sortedNavigation.filter(item => item.visible).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Social Media Links in Mobile Menu */}
          <div className="px-5 pt-4 pb-6 border-t border-gray-200">
            <div className="flex justify-center space-x-3 mt-4">
              {settings.socialLinks?.facebook && (
                <a 
                  href={settings.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <FaFacebookF size={16} />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a 
                  href={settings.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <FaInstagram size={16} />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a 
                  href={settings.socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                >
                  <span className="sr-only">YouTube</span>
                  <FaYoutube size={16} />
                </a>
              )}
              {settings.socialLinks?.whatsapp && (
                <a 
                  href={`https://wa.me/${settings.socialLinks.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                >
                  <span className="sr-only">WhatsApp</span>
                  <FaWhatsapp size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 