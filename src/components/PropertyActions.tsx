'use client';

import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { toast } from 'sonner';

type PropertyActionsProps = {
  property: any;
  formattedPrice: string;
};

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

const PropertyActions: React.FC<PropertyActionsProps> = ({ property }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          property: property.title,
          propertyId: property.id,
        }),
      });
      
      if (response.ok) {
        toast.success('Your message has been sent. We will contact you soon!');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        toast.error('Failed to send your message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Connect with Us</h3>
      
      {/* ... existing code ... */}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#0F2C5A] text-white py-2 rounded-md hover:bg-[#1A3E73] transition-colors flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
      
      <div className="mt-6">
        <h4 className="text-lg font-medium mb-3 text-gray-800">Share This Property</h4>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            aria-label="Share on Facebook"
          >
            <FaFacebookF size={16} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full transition-colors"
            aria-label="Share on Twitter"
          >
            <FaTwitter size={16} />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-full transition-colors"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedinIn size={16} />
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PropertyActions; 