import React from 'react';
import { 
  BiMapAlt, 
  BiBookAlt, 
  BiFirstAid, 
  BiShoppingBag, 
  BiRestaurant, 
  BiFootball 
} from 'react-icons/bi';

interface PropertyNearbyProps {
  nearby: {
    tourist_attractions: string;
    education: string;
    healthcare: string;
    shopping: string;
    restaurants: string;
    recreation: string;
  };
}

const PropertyNearby: React.FC<PropertyNearbyProps> = ({ nearby }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Nearby Places</h2>
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="flex items-start">
          <BiMapAlt className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Tourist Attractions</h3>
            <p className="text-gray-700">{nearby.tourist_attractions}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiBookAlt className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Education</h3>
            <p className="text-gray-700">{nearby.education}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiFirstAid className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Healthcare</h3>
            <p className="text-gray-700">{nearby.healthcare}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiShoppingBag className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Shopping</h3>
            <p className="text-gray-700">{nearby.shopping}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiRestaurant className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Restaurants</h3>
            <p className="text-gray-700">{nearby.restaurants}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <BiFootball className="text-[#0A2E1C] mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium">Recreation</h3>
            <p className="text-gray-700">{nearby.recreation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyNearby; 