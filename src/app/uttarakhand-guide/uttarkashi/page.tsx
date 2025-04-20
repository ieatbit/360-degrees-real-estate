'use client'

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function UttarkashiPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-[#0A3D62] to-[#1E5F8C]"></div>
        </div>
        <div className="container relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Uttarkashi
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Gateway to the sacred Himalayan pilgrimage routes
          </p>
        </div>
      </section>
      
      {/* About the Region */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">About Uttarkashi</h2>
          <p className="mb-6">
            Uttarkashi, known as the "Northern Kashi," is a sacred town and important pilgrimage site located in the Uttarakhand Himalayas. Situated on the banks of the Bhagirathi River, it serves as a gateway to some of the holiest sites in Hinduism including Gangotri and Yamunotri.
          </p>
          <p className="mb-6">
            With its rich spiritual heritage, stunning mountain landscapes, and proximity to major pilgrimage routes, Uttarkashi offers unique property investment opportunities, especially for those interested in spiritual tourism and retreat centers.
          </p>
          
          <div className="text-center mt-12">
            <p className="text-xl mb-8">We're currently updating our information about Uttarkashi properties.</p>
            <Link href="/contact" className="btn bg-primary text-white hover:bg-[#0c4b7a] px-8 py-3 rounded-md">
              Contact Us for More Information
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 