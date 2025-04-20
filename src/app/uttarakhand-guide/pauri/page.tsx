'use client'

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ChamoliPage() {
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
            Chamoli
          </h1>
          <p className="text-xl mb-8 max-w-3xl">
            Home to the Valley of Flowers and sacred sites
          </p>
        </div>
      </section>
      
      {/* About the Region */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">About Chamoli</h2>
          <p className="mb-6">
            Chamoli is a breathtaking district in the heart of Uttarakhand, known for its stunning natural landscapes including the famous Valley of Flowers National Park and Nanda Devi National Park, both UNESCO World Heritage Sites. It's also home to important religious sites such as Badrinath and Hemkund Sahib.
          </p>
          <p className="mb-6">
            With its pristine rivers, diverse flora and fauna, and spiritual significance, Chamoli offers unique property investment opportunities for those looking for serene mountain retreats or tourism-related ventures in areas outside the protected zones.
          </p>
          
          <div className="text-center mt-12">
            <p className="text-xl mb-8">We're currently updating our information about Chamoli properties.</p>
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