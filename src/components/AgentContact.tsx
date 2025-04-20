'use client'

import React from 'react';
import Image from 'next/image';
import { BiPhone, BiEnvelope } from 'react-icons/bi';

interface AgentContactProps {
  agent: {
    id: string;
    name: string;
    title: string;
    phone: string;
    email: string;
    bio: string;
    imageUrl: string;
  };
  propertyTitle: string;
}

const AgentContact: React.FC<AgentContactProps> = ({ agent, propertyTitle }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
            <Image
              src={agent.imageUrl}
              alt={agent.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <p className="text-[#0A2E1C] text-sm">{agent.title}</p>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{agent.bio}</p>
        
        <div className="space-y-2 mb-6">
          <a 
            href={`tel:${agent.phone}`} 
            className="flex items-center text-gray-700 hover:text-[#0A2E1C]"
          >
            <BiPhone className="mr-2" size={18} />
            <span>{agent.phone}</span>
          </a>
          
          <a 
            href={`mailto:${agent.email}`} 
            className="flex items-center text-gray-700 hover:text-[#0A2E1C]"
          >
            <BiEnvelope className="mr-2" size={18} />
            <span>{agent.email}</span>
          </a>
        </div>
        
        <form className="space-y-4">
          <h4 className="font-semibold">Inquire about this property</h4>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={`I'm interested in ${propertyTitle}`}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#0A2E1C] text-white py-2 px-4 rounded-md hover:bg-[#184D30] transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentContact; 