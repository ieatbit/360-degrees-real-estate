'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Spinner } from '@/components/LoadingSpinner';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, FaDirections } from 'react-icons/fa';

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

interface FAQ {
  question: string;
  answer: string;
}

interface ContactPageContent {
  title: string;
  subtitle: string;
  heroImage: string;
  getInTouchText: string;
  officeLocation: {
    address: string;
    mapEmbed: string;
    showMap: boolean;
  };
  contactInfo: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  faqSection: {
    title: string;
    subtitle: string;
    faqs: FAQ[];
  };
  updatedAt: string;
}

// CSS for pulse animation
const pulseAnimation = {
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
      boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)'
    },
    '70%': {
      transform: 'scale(1)',
      boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)'
    },
    '100%': {
      transform: 'scale(0.95)',
      boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)'
    }
  },
  animation: 'pulse 2s infinite'
};

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: '360° Real Estate',
    contactEmail: 'info@360degreesrealestate.in',
    phoneNumber: '+91 98765 43210',
    mainLocation: 'Mall Road, Almora, Uttarakhand',
    socialLinks: {
      facebook: '#',
      instagram: '#'
    }
  });
  
  const [pageContent, setPageContent] = useState<ContactPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Prepare data for the new contact API
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const fullName = nameInput?.value || '';
      
      const data = {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      };
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: responseData.message || 'Thank you for your message! We will get back to you soon.'
        });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
        
        // Reset form fields
        const form = document.getElementById('contactForm') as HTMLFormElement;
        if (form) form.reset();
        
      } else {
        setSubmitStatus({
          success: false,
          message: responseData.error || 'Failed to submit your message. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Fetch both settings and page content
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch settings
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }
        
        // Fetch contact page content
        const contentResponse = await fetch('/api/contact-page');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setPageContent(contentData);
        } else {
          console.error('Failed to fetch contact page content');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <main>
        <Header />
        <div className="flex justify-center items-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
        <Footer />
      </main>
    );
  }
  
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[48vh] md:h-[60vh]">
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <div className="absolute inset-0">
          {pageContent?.heroImage ? (
            <Image 
              src={pageContent.heroImage}
              alt={pageContent.title || "Contact Us"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0A3D62] to-[#1E5F8C]"></div>
          )}
        </div>
        <div className="container relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 text-white">
            {pageContent?.title || "Contact Us"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl px-4">
            {pageContent?.subtitle || "We're here to assist you with any queries about Uttarakhand properties"}
          </p>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Get in Touch</h2>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base">
                {pageContent?.getInTouchText || "Whether you're looking to buy, sell, or lease property in Uttarakhand, our team of experts is ready to assist you. Fill out the form, and we'll get back to you as soon as possible."}
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#0A3D62] rounded-full p-2 mr-4 text-white shrink-0">
                    <FaMapMarkerAlt className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Visit Us</h3>
                    <p className="text-sm sm:text-base">{pageContent?.officeLocation.address || settings.mainLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#0A3D62] rounded-full p-2 mr-4 text-white shrink-0">
                    <FaPhone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Call Us</h3>
                    <p className="text-sm sm:text-base">{pageContent?.contactInfo.phone || settings.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#0A3D62] rounded-full p-2 mr-4 text-white shrink-0">
                    <FaEnvelope className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Email Us</h3>
                    <p className="text-sm sm:text-base">{pageContent?.contactInfo.email || settings.contactEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#0A3D62] rounded-full p-2 mr-4 text-white shrink-0">
                    <FaClock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">Operating Hours</h3>
                    <p className="text-sm sm:text-base">{pageContent?.operatingHours.weekdays || "Monday - Saturday: 9 AM - 6 PM"}</p>
                    <p className="text-sm sm:text-base">{pageContent?.operatingHours.weekends || "Sunday: By Appointment Only"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 sm:mt-12">
                <h3 className="font-bold text-base sm:text-lg mb-4">Connect with Us</h3>
                <div className="flex space-x-3">
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
                    href={`https://wa.me/${pageContent?.contactInfo.whatsapp || settings.socialLinks?.whatsapp || "919759866333"}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                  >
                    <span className="sr-only">WhatsApp</span>
                    <FaWhatsapp size={18} />
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-[#F5F5F5] p-4 sm:p-8 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6">Send Us a Message</h3>
                
                {/* Status message */}
                {submitStatus && (
                  <div className={`mb-4 sm:mb-6 p-3 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {submitStatus.message}
                  </div>
                )}
                
                <form id="contactForm" onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Your email"
                      onChange={handleInputChange}
                      value={formData.email}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Your phone number"
                      onChange={handleInputChange}
                      value={formData.phone}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                    <select 
                      id="subject" 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      onChange={handleInputChange}
                      value={formData.subject}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="property-inquiry">Property Inquiry</option>
                      <option value="investment-advice">Investment Advice</option>
                      <option value="site-visit">Arrange a Site Visit</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={6} 
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="Your message"
                      onChange={handleInputChange}
                      value={formData.message}
                      required
                    ></textarea>
                  </div>
                  
                  <input type="hidden" id="inquiryType" value="contact-form" />
                  
                  <button 
                    type="submit" 
                    className="w-full bg-[#0A3D62] text-white py-3 px-6 rounded-md hover:bg-[#0c4b7a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-[#F5F5F5]">
        <div className="container px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center">Find Us</h2>
          <div className="mb-4 sm:mb-6 text-center">
            <p className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Mall Road, Almora, Uttarakhand</p>
          </div>
          <div className="h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-md">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3472.8097509767097!2d79.65808075903595!3d29.60041253806943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDM2JzAxLjUiTiA3OcKwMzknMzcuOCJF!5e0!3m2!1sen!2sin!4v1714925030934!5m2!1sen!2sin"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              title="Our Office Location"
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="mt-4 flex justify-center">
            <a 
              href="https://maps.google.com/?q=29.600412,79.660601" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#0A3D62] text-white py-2 px-4 rounded-md flex items-center hover:bg-[#0c4b7a] transition-colors"
            >
              <FaDirections className="mr-2" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      {pageContent && pageContent.faqSection && pageContent.faqSection.faqs && pageContent.faqSection.faqs.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-white">
          <div className="container px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-12 text-center">
              {pageContent?.faqSection?.title || "Frequently Asked Questions"}
            </h2>
            {pageContent?.faqSection?.subtitle && (
              <p className="text-center text-base sm:text-lg text-gray-600 mb-6 sm:mb-12 max-w-3xl mx-auto">
                {pageContent?.faqSection?.subtitle}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {pageContent?.faqSection?.faqs?.map((faq, index) => (
                <div key={index} className="bg-[#F5F5F5] p-4 sm:p-6 rounded-lg">
                  <h3 className="font-bold text-base sm:text-lg mb-2">{faq.question}</h3>
                  <p className="text-sm sm:text-base">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </main>
  );
} 