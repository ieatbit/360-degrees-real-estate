'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PropertyPageImageUploader from '../../../components/PropertyPageImageUploader';

export const dynamic = 'force-dynamic';

interface PropertyPageContent {
  heroImage: string;
  heroHeading: string;
  heroSubheading: string;
  mainContent: string;
}

export default function PropertyPageEditor() {
  const [content, setContent] = useState<PropertyPageContent>({
    heroImage: '',
    heroHeading: '',
    heroSubheading: '',
    mainContent: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      setLoading(true);
      const response = await fetch('/api/property-page');
      if (!response.ok) {
        throw new Error('Failed to load content');
      }
      const data = await response.json();
      setContent(data);
    } catch (error) {
      toast.error('Failed to load content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/property-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleImageUploaded(imageUrl: string) {
    setContent(prev => ({
      ...prev,
      heroImage: imageUrl
    }));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Property Page Editor</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image
          </label>
          <div className="mb-2">
            <PropertyPageImageUploader 
              onImageUploaded={handleImageUploaded}
              existingImage={content.heroImage} 
            />
          </div>
        </div>

        <div>
          <label htmlFor="heroHeading" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Heading
          </label>
          <input
            type="text"
            id="heroHeading"
            name="heroHeading"
            value={content.heroHeading}
            onChange={handleInputChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            required
          />
        </div>

        <div>
          <label htmlFor="heroSubheading" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subheading
          </label>
          <input
            type="text"
            id="heroSubheading"
            name="heroSubheading"
            value={content.heroSubheading}
            onChange={handleInputChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
            required
          />
        </div>

        <div>
          <label htmlFor="mainContent" className="block text-sm font-medium text-gray-700 mb-2">
            Main Content
          </label>
          <textarea
            id="mainContent"
            name="mainContent"
            rows={5}
            value={content.mainContent}
            onChange={handleInputChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
          ></textarea>
        </div>

        <div className="pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 