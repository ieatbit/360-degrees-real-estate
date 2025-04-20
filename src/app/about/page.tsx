'use client'

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spinner } from '@/components/LoadingSpinner';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  imageUrl: string;
}

interface AboutPageContent {
  title: string;
  subtitle: string;
  mainContent: string;
  mission: string;
  vision: string;
  bannerImage: string;
  ceoSection: {
    name: string;
    position: string;
    bio: string;
    imageUrl: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  teamSection: {
    title: string;
    subtitle: string;
    members: TeamMember[];
  };
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Predefined content for about page (fallback content)
  const predefinedContent = {
    mainContent: "",
    mission: "To connect discerning buyers with exceptional properties in Uttarakhand, offering a seamless experience rooted in trust, transparency, and a deep love for the Himalayas.",
    vision: "To be the leading name in luxury mountain real estate, crafting timeless living experiences where nature, elegance, and serenity come together."
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          
          // Override API content with predefined content if needed
          data.mainContent = predefinedContent.mainContent;
          data.mission = predefinedContent.mission;
          data.vision = predefinedContent.vision;
          
          setContent(data);
        } else {
          console.error('Failed to fetch about page content');
        }
      } catch (error) {
        console.error('Error fetching about page content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Failed to load About page content.</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-[48vh] md:h-[60vh] overflow-hidden flex items-center justify-center">
        {content.bannerImage ? (
          <Image 
            src={content.bannerImage} 
            alt={content.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A3E73] to-[#0A2E1C]" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">{content.subtitle}</p>
        </Container>
      </div>
      
      {/* Main Content - only render if content exists */}
      {content.mainContent && content.mainContent.trim() !== '' && (
        <Container className="py-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              {content.mainContent.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* Mission & Vision */}
      {(content.mission || content.vision) && (
        <div className="bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0F2C5A] mb-3">Our Philosophy</h2>
              <div className="h-1 w-20 bg-[#0F2C5A] mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {content.mission && (
                <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-md transform transition-transform hover:translate-y-[-5px]">
                  <h2 className="text-2xl font-bold text-[#0F2C5A] mb-4 border-l-4 border-[#0F2C5A] pl-3">Our Mission</h2>
                  <div className="prose">
                    {content.mission.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {content.vision && (
                <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-md transform transition-transform hover:translate-y-[-5px]">
                  <h2 className="text-2xl font-bold text-[#0F2C5A] mb-4 border-l-4 border-[#0F2C5A] pl-3">Our Vision</h2>
                  <div className="prose">
                    {content.vision.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
      
      {/* Leadership Section */}
      {content.ceoSection && (
        <div className="bg-gradient-to-br from-[#0A3D62]/95 to-[#1E5F8C]/95 py-20 text-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Our Leadership</h2>
              <div className="h-1 w-20 bg-yellow-400 mx-auto"></div>
              <p className="text-xl mt-4 opacity-90 max-w-2xl mx-auto">
                Meet the visionary behind 360° Real Estate
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-xl max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2">
                {/* Image Column */}
                <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                  <Image
                    src={content.ceoSection.imageUrl || "/images/ceo.jpg"}
                    alt={content.ceoSection.name}
                    fill
                    className="object-contain md:object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:bg-gradient-to-l"></div>
                </div>
                
                {/* Content Column */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold">{content.ceoSection.name}</h3>
                    <p className="text-yellow-300 font-medium text-lg mt-1">{content.ceoSection.position}</p>
                  </div>
                  
                  <div className="prose prose-invert prose-lg max-w-none mb-6">
                    {content.ceoSection.bio.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-white/80">{paragraph}</p>
                    ))}
                  </div>
                  
                  {/* Social Links - Updated to use data from API */}
                  <div className="flex gap-4 mt-auto">
                    {content.ceoSection.socialLinks?.linkedin && (
                      <a 
                        href={content.ceoSection.socialLinks.linkedin}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    {content.ceoSection.socialLinks?.facebook && (
                      <a 
                        href={content.ceoSection.socialLinks.facebook}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {content.ceoSection.socialLinks?.instagram && (
                      <a 
                        href={content.ceoSection.socialLinks.instagram}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {content.ceoSection.socialLinks?.twitter && (
                      <a 
                        href={content.ceoSection.socialLinks.twitter}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    <a 
                      href="mailto:contact@360degreesrealestate.in" 
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-16">
              <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-white font-medium">Available for property consultations</span>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Team Section */}
      {content.teamSection.members.length > 0 && (
        <Container className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F2C5A] mb-3 border-b-2 border-[#0F2C5A]/20 inline-block pb-2">{content.teamSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">{content.teamSection.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.teamSection.members.map((member) => (
              <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transform transition-transform hover:translate-y-[-5px]">
                <div className="aspect-w-3 aspect-h-2 relative h-64">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-4xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-[#0F2C5A] font-medium mb-4">{member.position}</p>
                  <div className="prose">
                    {member.bio.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-600">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      )}
      
      <Footer />
    </main>
  );
}
