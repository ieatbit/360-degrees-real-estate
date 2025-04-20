import React from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';

interface PropertyFeaturesProps {
  features: string[];
}

const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({ features }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-[#0A2E1C]">Property Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-center p-2"
          >
            <BsCheckCircleFill className="text-[#C3A85D] mr-2 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyFeatures; 