'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spinner } from '@/components/LoadingSpinner';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaQuoteLeft, FaMountain, FaRegLightbulb, FaUsers, FaHandshake, FaLinkedin } from 'react-icons/fa';

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
  teamSection: {
    title: string;
    subtitle: string;
    members: TeamMember[];
  };
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
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
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden flex items-center justify-center">
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
        <div className="absolute inset-0 bg-black/40" />
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">{content.title}</h1>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">{content.subtitle}</p>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-10 text-center">
            <FaQuoteLeft className="text-gray-200 text-6xl absolute -top-8 left-0 md:left-10 opacity-50" />
            <p className="text-2xl md:text-3xl text-gray-700 font-light italic leading-relaxed relative z-10 px-8 md:px-16">
              "Discovering the perfect home is more than a transaction—it's finding where your story unfolds."
            </p>
          </div>
          
          <div className="prose prose-lg mx-auto mt-16">
            {content.mainContent.split('\n').map((paragraph, index) => (
              <p key={index} className={index === 0 ? "text-xl leading-relaxed" : ""}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>

      {/* Founder/CEO Section */}
      <div className="bg-white py-20">
        <Container>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#0F2C5A] mb-3">Meet Our Founder</h2>
                <div className="w-16 h-1 bg-[#D4AF37] mb-6"></div>
                <h3 className="text-xl text-[#0F2C5A] font-medium mb-4">Rahul Sharma</h3>
                <p className="text-sm text-[#D4AF37] uppercase font-semibold tracking-wider mb-6">Founder & CEO</p>
              </div>
              
              <div className="prose prose-lg">
                <p>
                  With over 20 years of experience in the Uttarakhand real estate market, Rahul brings unparalleled expertise and passion to the company. His deep connection to the Himalayan region and commitment to sustainable development have shaped our core values.
                </p>
                <p>
                  After graduating from Delhi University with a degree in Business Administration, Rahul worked with leading property developers before founding our company in 2003 with a vision to showcase the natural beauty and investment potential of Uttarakhand.
                </p>
                <p>
                  Under his leadership, we have grown from a small regional agency to the premier luxury real estate firm in Uttarakhand, with a reputation for integrity, personalized service, and exceptional properties.
                </p>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-[#0F2C5A] hover:text-[#D4AF37] transition-colors">
                  <FaLinkedin size={24} />
                </a>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="relative overflow-hidden rounded-lg shadow-xl h-[500px] transform hover:scale-[1.02] transition-transform duration-300">
                <Image
                  src="/images/ceo.jpg"
                  alt="Rahul Sharma - Founder & CEO"
                  fill
                  className="object-cover object-center"
                  style={{ objectPosition: '50% 30%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-xs font-light uppercase tracking-wider opacity-75">Established 2003</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Our Values */}
      <div className="bg-[#0F2C5A] text-white py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1A3E73] p-8 rounded-lg text-center hover:transform hover:scale-105 transition-transform duration-300">
              <div className="bg-[#D4AF37] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMountain className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-gray-200">We strive for excellence in every interaction, offering unparalleled service and attention to detail.</p>
            </div>
            
            <div className="bg-[#1A3E73] p-8 rounded-lg text-center hover:transform hover:scale-105 transition-transform duration-300">
              <div className="bg-[#D4AF37] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRegLightbulb className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-200">We embrace innovative solutions and technologies to enhance the property discovery experience.</p>
            </div>
            
            <div className="bg-[#1A3E73] p-8 rounded-lg text-center hover:transform hover:scale-105 transition-transform duration-300">
              <div className="bg-[#D4AF37] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Integrity</h3>
              <p className="text-gray-200">We conduct our business with unwavering integrity, transparency, and honesty in every transaction.</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Mission & Vision */}
      {(content.mission || content.vision) && (
        <div className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50 z-0"></div>
          <div className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-blue-50 z-0"></div>
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-green-50 z-0"></div>
          
          <Container className="relative z-10">
            <div className="grid md:grid-cols-2 gap-16">
              {content.mission && (
                <div className="bg-white p-10 rounded-lg border border-gray-100 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center mb-6">
                    <div className="bg-[#0F2C5A] h-12 w-2 rounded-full mr-4"></div>
                    <h2 className="text-3xl font-bold text-[#0F2C5A]">Our Mission</h2>
                  </div>
                  <div className="prose prose-lg">
                    {content.mission.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {content.vision && (
                <div className="bg-white p-10 rounded-lg border border-gray-100 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center mb-6">
                    <div className="bg-[#0A2E1C] h-12 w-2 rounded-full mr-4"></div>
                    <h2 className="text-3xl font-bold text-[#0A2E1C]">Our Vision</h2>
                  </div>
                  <div className="prose prose-lg">
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

      {/* Team Section */}
      {content.teamSection.members.length > 0 && (
        <div className="py-20 bg-gray-50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#0F2C5A] mb-4">{content.teamSection.title}</h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{content.teamSection.subtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {content.teamSection.members.map((member) => (
                <div 
                  key={member.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="aspect-w-4 aspect-h-3 relative h-64">
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <FaUsers className="text-gray-400 text-5xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-1 text-[#0F2C5A]">{member.name}</h3>
                    <p className="text-[#D4AF37] font-semibold mb-4 text-sm uppercase tracking-wider">{member.position}</p>
                    <div className="w-12 h-0.5 bg-gray-200 mb-4"></div>
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
        </div>
      )}
      
      {/* Himalayan Expertise */}
      <div className="bg-[#0A2E1C] text-white py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Himalayan Expertise</h2>
            <p className="text-lg md:text-xl mb-10 text-gray-200">
              With deep roots in Uttarakhand, we bring unparalleled local knowledge and insights to every property transaction. Our team's intimate understanding of the region's geography, climate, and culture ensures you find the perfect property that aligns with your lifestyle and investment goals.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">25+</div>
                <p className="uppercase tracking-wider">Years Experience</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">100+</div>
                <p className="uppercase tracking-wider">Happy Clients</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">15+</div>
                <p className="uppercase tracking-wider">Prime Locations</p>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Call to Action */}
      <div className="bg-[#D4AF37] py-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Find Your Dream Property?</h2>
            <p className="text-lg md:text-xl mb-10 text-white/80">
              Let us guide you through the journey of discovering exceptional properties in the breathtaking Himalayan landscapes.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-[#0F2C5A] font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-[#0F2C5A] hover:text-white transition-colors duration-300"
            >
              Contact Us Today
            </a>
          </div>
        </Container>
      </div>
      
      <Footer />
    </main>
  );
}