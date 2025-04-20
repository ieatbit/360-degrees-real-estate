'use client'

import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { getSettings, saveSettings } from "../../../lib/services/SettingsService";
import { useToast } from "../../../components/ui/use-toast";

interface SettingsData {
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  showVirtualTours: boolean;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  smtp: {
    host: string;
    port: string;
    user: string;
    password: string;
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<SettingsData>({
    siteName: "360° Real Estate",
    siteEmail: "info@360degreesrealestate.in",
    sitePhone: "+91 9759866333",
    siteAddress: "Dehradun, Uttarakhand",
    showVirtualTours: true,
    social: {
      facebook: "",
      instagram: "",
      youtube: "",
      whatsapp: "",
    },
    seo: {
      metaTitle: "360° Real Estate - Properties in Uttarakhand",
      metaDescription: "Find your dream property in Uttarakhand with 360° Real Estate. We offer a wide range of properties including residential, commercial, and agricultural.",
    },
    smtp: {
      host: "",
      port: "",
      user: "",
      password: "",
    },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        setSettings(settings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.');
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    // Handle nested properties (social.facebook, seo.metaTitle, etc.)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      setSettings(prev => {
        // Create a safe copy of the nested object with proper type casting
        const parentObj = prev[parent as keyof typeof prev] as Record<string, any>;
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: isCheckbox ? checked : value
          }
        };
      });
    } else {
      // Handle top-level properties
      setSettings(prev => ({
        ...prev,
        [name]: isCheckbox ? checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveStatus('saving');
    setError(null);
    
    try {
      // Save settings using the SettingsService
      const success = await saveSettings(settings);
      
      if (success) {
        setSaveStatus('success');
        toast({
          title: "Success",
          description: "Settings saved successfully",
          variant: "default",
        });
        
        // Reset to idle after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setError('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setError('An unexpected error occurred while saving');
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Website Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                defaultValue={settings.siteName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="siteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="siteEmail"
                name="siteEmail"
                defaultValue={settings.siteEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="sitePhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="sitePhone"
                name="sitePhone"
                defaultValue={settings.sitePhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="siteAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Main Location
              </label>
              <input
                type="text"
                id="siteAddress"
                name="siteAddress"
                defaultValue={settings.siteAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <FaFacebookF />
              </div>
              <div className="flex-1">
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                  Facebook URL
                </label>
                <input
                  type="text"
                  id="facebook"
                  name="social.facebook"
                  value={settings.social.facebook}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white">
                <FaInstagram />
              </div>
              <div className="flex-1">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  Instagram URL
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="social.instagram"
                  value={settings.social.instagram}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                <FaYoutube />
              </div>
              <div className="flex-1">
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
                  YouTube URL
                </label>
                <input
                  type="text"
                  id="youtube"
                  name="social.youtube"
                  value={settings.social.youtube}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                <FaWhatsapp />
              </div>
              <div className="flex-1">
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="social.whatsapp"
                  value={settings.social.whatsapp}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="+911234567890"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* SEO Settings */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Default Meta Title
              </label>
              <input
                type="text"
                id="seo.metaTitle"
                name="seo.metaTitle"
                defaultValue={settings.seo.metaTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Default Meta Description
              </label>
              <textarea
                id="seo.metaDescription"
                name="seo.metaDescription"
                defaultValue={settings.seo.metaDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Email Settings */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
          <p className="text-sm text-gray-500 mb-4">Configure these settings to enable the contact form functionality.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="smtp.host" className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                id="smtp.host"
                name="smtp.host"
                placeholder="smtp.example.com"
                defaultValue={settings.smtp.host}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="smtp.port" className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="text"
                id="smtp.port"
                name="smtp.port"
                placeholder="587"
                defaultValue={settings.smtp.port}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="smtp.user" className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Username
              </label>
              <input
                type="text"
                id="smtp.user"
                name="smtp.user"
                placeholder="your@email.com"
                defaultValue={settings.smtp.user}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="smtp.password" className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Password
              </label>
              <input
                type="password"
                id="smtp.password"
                name="smtp.password"
                placeholder="••••••••"
                defaultValue={settings.smtp.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Display Settings */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showVirtualTours"
                name="showVirtualTours"
                className="h-4 w-4 text-[#0A2E1C] focus:ring-[#0A2E1C] border-gray-300 rounded"
                defaultChecked={settings.showVirtualTours}
                onChange={handleChange}
              />
              <label htmlFor="showVirtualTours" className="ml-2 block text-sm text-gray-700">
                Enable 360° Virtual Tours
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0A2E1C] text-white px-6 py-2 rounded-md hover:bg-[#184D30] transition-colors disabled:opacity-50 flex items-center"
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              'Try Again'
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 