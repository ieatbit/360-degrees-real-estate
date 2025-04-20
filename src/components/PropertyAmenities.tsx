import React from 'react';
import { FaSwimmingPool, FaCarAlt, FaWifi, FaTree } from 'react-icons/fa';
import { BiDumbbell, BiCctv } from 'react-icons/bi';
import { MdSecurity, MdOutlineBalcony, MdOutlineFireplace } from 'react-icons/md';
import { GiBarbecue } from 'react-icons/gi';
import { TbAirConditioning } from 'react-icons/tb';

interface PropertyAmenitiesProps {
  amenities: string[];
}

const amenityIcons: Record<string, React.ReactElement> = {
  'Swimming Pool': <FaSwimmingPool className="text-[#0A2E1C] text-xl" />,
  'Parking': <FaCarAlt className="text-[#0A2E1C] text-xl" />,
  'Gym': <BiDumbbell className="text-[#0A2E1C] text-xl" />,
  'Security': <MdSecurity className="text-[#0A2E1C] text-xl" />,
  'Garden': <FaTree className="text-[#0A2E1C] text-xl" />,
  'Balcony': <MdOutlineBalcony className="text-[#0A2E1C] text-xl" />,
  'Air Conditioning': <TbAirConditioning className="text-[#0A2E1C] text-xl" />,
  'Wifi': <FaWifi className="text-[#0A2E1C] text-xl" />,
  'BBQ': <GiBarbecue className="text-[#0A2E1C] text-xl" />,
  'Fireplace': <MdOutlineFireplace className="text-[#0A2E1C] text-xl" />,
  'CCTV': <BiCctv className="text-[#0A2E1C] text-xl" />
};

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-[#0A2E1C]">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center p-3 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow">
            <div className="mr-3">
              {amenityIcons[amenity] || <div className="w-5 h-5 bg-[#C3A85D] rounded-full"></div>}
            </div>
            <span className="text-gray-700">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyAmenities; 