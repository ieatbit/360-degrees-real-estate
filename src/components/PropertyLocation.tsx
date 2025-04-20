import React from 'react';
import { BiMap, BiCloudSnow, BiTrendingUp } from 'react-icons/bi';
import { MdDirectionsCar } from 'react-icons/md';

interface PropertyLocationProps {
  location: {
    address: string;
    altitude: string;
    climate: string;
    accessibility: string[];
  };
}

const PropertyLocation: React.FC<PropertyLocationProps> = ({ location }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Location Details</h2>
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex items-start">
          <BiMap className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Address</h3>
            <p className="text-gray-700">{location.address}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiTrendingUp className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Altitude</h3>
            <p className="text-gray-700">{location.altitude}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiCloudSnow className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Climate</h3>
            <p className="text-gray-700">{location.climate}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <MdDirectionsCar className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Accessibility</h3>
            <ul className="list-disc list-inside text-gray-700 pl-1">
              {location.accessibility.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocation; 