"use client";

import React from 'react';
import AgentContact from './AgentContact';

interface AgentContactWrapperProps {
  agent: {
    id?: string;
    name: string;
    title?: string;
    phone: string;
    email: string;
    bio?: string;
    imageUrl?: string;
  };
  propertyTitle: string;
}

export default function AgentContactWrapper({ agent, propertyTitle }: AgentContactWrapperProps) {
  return (
    <div className="agent-contact-wrapper agent-contact-form bg-white rounded-lg border border-gray-200 p-4">
      <style jsx global>{`
        /* Target ALL background colors anywhere in the form hierarchy */
        .agent-contact-wrapper,
        .agent-contact-wrapper * {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        
        /* Only leave the background of the outermost container */
        .agent-contact-wrapper {
          background-color: white !important;
        }
        
        /* Make sure inputs and textareas still have white background */
        .agent-contact-form input,
        .agent-contact-form textarea {
          background-color: white !important;
          border: 1px solid rgba(209, 213, 219, 0.8) !important;
        }
        
        /* Target any inner cards or panels directly */
        .agent-contact-wrapper .card,
        .agent-contact-wrapper [class*="card"],
        .agent-contact-wrapper [class*="panel"],
        .agent-contact-wrapper [class*="box"],
        .agent-contact-wrapper [class*="container"] {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
      <AgentContact 
        agent={agent}
        propertyTitle={propertyTitle}
      />
    </div>
  );
} 