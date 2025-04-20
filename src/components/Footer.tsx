'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

interface Settings {
  siteName: string;
  contactEmail: string;
  phoneNumber: string;
  mainLocation: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    siteName: '360° Real Estate',
    contactEmail: 'info@360degreesrealestate.in',
    phoneNumber: '+91 98765 43210',
    mainLocation: 'Mall Road, Nainital, Uttarakhand',
    socialLinks: {
      facebook: '#',
      instagram: '#'
    }
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    fetchSettings();
  }, []);
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4">About Us</h3>
            <p className="mb-4 text-gray-300">
              360° Real Estate specializes in premium properties across Uttarakhand, 
              offering exceptional service and expertise in the mountain real estate market.
            </p>
            <div className="flex space-x-3 mt-4">
              {/* Always show Facebook icon */}
              <a 
                href={settings.socialLinks?.facebook || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <FaFacebookF size={18} />
              </a>
              
              {/* Always show Instagram icon */}
              <a 
                href={settings.socialLinks?.instagram || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram size={18} />
              </a>
              
              {/* Always show YouTube icon */}
              <a 
                href={settings.socialLinks?.youtube || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
              >
                <span className="sr-only">YouTube</span>
                <FaYoutube size={18} />
              </a>
              
              {/* Always show WhatsApp icon */}
              <a 
                href={`https://wa.me/${settings.socialLinks?.whatsapp || "919759866333"}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
              >
                <span className="sr-only">WhatsApp</span>
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/uttarakhand-guide" className="text-gray-300 hover:text-white transition-colors">
                  Uttarakhand Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Us */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">{settings.mainLocation}</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-blue-400 mr-3 flex-shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="text-gray-300 hover:text-white transition-colors">
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-blue-400 mr-3 flex-shrink-0" />
                <a href={`tel:${settings.phoneNumber}`} className="text-gray-300 hover:text-white transition-colors">
                  {settings.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
