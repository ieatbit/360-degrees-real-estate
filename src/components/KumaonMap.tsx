import React, { useState } from 'react';
import Link from 'next/link';

interface Region {
  id: string;
  name: string;
  path: string;
  url: string;
  description: string;
  properties: number;
}

const regions: Region[] = [
  {
    id: 'uttarkashi',
    name: 'Uttarkashi',
    path: 'M170,120 L240,100 L300,120 L320,180 L280,200 L240,190 L180,170 L170,120',
    url: '/uttarakhand-guide/uttarkashi',
    description: 'Known for religious sites and Gangotri Glacier',
    properties: 5
  },
  {
    id: 'chamoli',
    name: 'Chamoli',
    path: 'M320,180 L380,160 L430,190 L420,250 L380,270 L320,250 L280,200 L320,180',
    url: '/uttarakhand-guide/chamoli',
    description: 'Home to Valley of Flowers and religious sites',
    properties: 6
  },
  {
    id: 'rudraprayag',
    name: 'Rudraprayag',
    path: 'M280,200 L320,250 L310,290 L280,310 L250,280 L240,190 L280,200',
    url: '/uttarakhand-guide/rudraprayag',
    description: 'Confluence of Alaknanda and Mandakini rivers',
    properties: 7
  },
  {
    id: 'pithoragarh',
    name: 'Pithoragarh',
    path: 'M430,190 L500,170 L530,190 L540,250 L500,290 L450,270 L420,250 L430,190',
    url: '/uttarakhand-guide/pithoragarh',
    description: 'Gateway to Himalayan pilgrimage routes',
    properties: 7
  },
  {
    id: 'bageshwar',
    name: 'Bageshwar',
    path: 'M420,250 L450,270 L440,310 L400,330 L380,310 L380,270 L420,250',
    url: '/uttarakhand-guide/bageshwar',
    description: 'Site of ancient temples and beautiful landscapes',
    properties: 9
  },
  {
    id: 'tehri',
    name: 'Tehri Garhwal',
    path: 'M180,170 L240,190 L250,280 L210,320 L160,300 L130,230 L180,170',
    url: '/uttarakhand-guide/tehri',
    description: 'Famous for Tehri Dam and adventure activities',
    properties: 11
  },
  {
    id: 'dehradun',
    name: 'Dehradun',
    path: 'M70,170 L130,130 L180,170 L130,230 L70,220 L70,170',
    url: '/uttarakhand-guide/dehradun',
    description: 'Capital city with excellent climate',
    properties: 22
  },
  {
    id: 'pauri',
    name: 'Pauri Garhwal',
    path: 'M130,230 L160,300 L210,320 L250,350 L200,380 L150,380 L110,350 L90,290 L130,230',
    url: '/uttarakhand-guide/pauri',
    description: 'Offers magnificent views of the Himalayas',
    properties: 8
  },
  {
    id: 'haridwar',
    name: 'Haridwar',
    path: 'M70,220 L130,230 L90,290 L60,270 L70,220',
    url: '/uttarakhand-guide/haridwar',
    description: 'Sacred city on the banks of the Ganges',
    properties: 13
  },
  {
    id: 'almora',
    name: 'Almora',
    path: 'M380,270 L380,310 L400,330 L400,380 L360,400 L330,370 L330,310 L360,290 L380,270',
    url: '/uttarakhand-guide/almora',
    description: 'Cultural capital with panoramic Himalayan views',
    properties: 19
  },
  {
    id: 'nainital',
    name: 'Nainital',
    path: 'M330,310 L330,370 L360,400 L350,440 L300,450 L280,420 L290,350 L310,340 L330,310',
    url: '/uttarakhand-guide/nainital',
    description: 'Popular hill station with a beautiful lake',
    properties: 28
  },
  {
    id: 'champawat',
    name: 'Champawat',
    path: 'M400,330 L440,310 L480,330 L460,370 L430,400 L400,380 L400,330',
    url: '/uttarakhand-guide/champawat',
    description: 'Known for its temples and stunning views',
    properties: 5
  },
  {
    id: 'udhamsingh',
    name: 'Udham Singh Nagar',
    path: 'M280,420 L300,450 L350,440 L400,460 L380,500 L320,510 L270,490 L280,420',
    url: '/uttarakhand-guide/udhamsinghnagar',
    description: 'Industrial hub with agricultural importance',
    properties: 15
  }
];

const KumaonMap: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handleMouseEnter = (regionId: string, e: React.MouseEvent) => {
    setActiveRegion(regionId);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setActiveRegion(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeRegion) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleRegionClick = (region: Region, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedRegion(region);
    setShowInfo(true);
  };

  const closeInfo = () => {
    setShowInfo(false);
  };

  // Color generator based on property count
  const getRegionColor = (region: Region) => {
    const isActive = activeRegion === region.id;
    
    if (isActive) return "#FFD700"; // Gold when active
    
    // Color based on property count
    if (region.properties > 20) return "#FFCCBC"; // Light Orange
    if (region.properties > 15) return "#C8E6C9"; // Light Green
    if (region.properties > 10) return "#BBDEFB"; // Light Blue
    if (region.properties > 5) return "#E1BEE7";  // Light Purple
    return "#F5F5F5"; // Light Gray
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-300" onMouseMove={handleMouseMove}>
      <div className="absolute top-0 left-0 w-full p-2 bg-[#0A3D62] text-white text-sm flex justify-between items-center z-10">
        <span>Uttarakhand Map</span>
        <span className="text-xs bg-[#FFD700] text-[#0A3D62] px-2 py-1 rounded-full">Click on region for details</span>
      </div>
      
      <svg 
        viewBox="0 0 600 600" 
        className="w-full h-full"
        style={{ marginTop: '30px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect x="0" y="0" width="600" height="600" fill="#F8FBFF" />
        
        {/* Title */}
        <rect x="200" y="30" width="200" height="40" rx="5" fill="#800000" opacity="0.9" />
        <text x="300" y="57" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">
          UTTARAKHAND
        </text>
        
        {/* Draw each region */}
        {regions.map((region) => (
          <g key={region.id} onClick={(e) => handleRegionClick(region, e)}>
            <path
              d={region.path}
              fill={getRegionColor(region)}
              stroke="#444444"
              strokeWidth="1.5"
              onMouseEnter={(e) => handleMouseEnter(region.id, e)}
              onMouseLeave={handleMouseLeave}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.3s',
              }}
            />
            
            {/* Region name */}
            <text
              x={region.id === 'nainital' ? 320 : 
                 region.id === 'almora' ? 370 : 
                 region.id === 'pithoragarh' ? 480 :
                 region.id === 'champawat' ? 440 :
                 region.id === 'bageshwar' ? 410 :
                 region.id === 'udhamsingh' ? 330 :
                 region.id === 'chamoli' ? 370 :
                 region.id === 'tehri' ? 200 :
                 region.id === 'pauri' ? 180 :
                 region.id === 'haridwar' ? 80 :
                 region.id === 'rudraprayag' ? 290 :
                 region.id === 'dehradun' ? 100 : 220}
              y={region.id === 'nainital' ? 380 : 
                 region.id === 'almora' ? 330 : 
                 region.id === 'pithoragarh' ? 230 :
                 region.id === 'champawat' ? 360 :
                 region.id === 'bageshwar' ? 290 :
                 region.id === 'udhamsingh' ? 470 :
                 region.id === 'chamoli' ? 220 :
                 region.id === 'tehri' ? 240 :
                 region.id === 'pauri' ? 330 :
                 region.id === 'haridwar' ? 260 :
                 region.id === 'rudraprayag' ? 275 :
                 region.id === 'dehradun' ? 190 : 140}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#333333"
              style={{ 
                pointerEvents: 'none',
                textShadow: '0 0 2px white'
              }}
            >
              {region.name}
            </text>
            
            {/* Property count with circle */}
            <circle
              cx={region.id === 'nainital' ? 320 : 
                  region.id === 'almora' ? 370 : 
                  region.id === 'pithoragarh' ? 480 :
                  region.id === 'champawat' ? 440 :
                  region.id === 'bageshwar' ? 410 :
                  region.id === 'udhamsingh' ? 330 :
                  region.id === 'chamoli' ? 370 :
                  region.id === 'tehri' ? 200 :
                  region.id === 'pauri' ? 180 :
                  region.id === 'haridwar' ? 80 :
                  region.id === 'rudraprayag' ? 290 :
                  region.id === 'dehradun' ? 100 : 220}
              cy={region.id === 'nainital' ? 400 : 
                  region.id === 'almora' ? 350 : 
                  region.id === 'pithoragarh' ? 250 :
                  region.id === 'champawat' ? 380 :
                  region.id === 'bageshwar' ? 310 :
                  region.id === 'udhamsingh' ? 490 :
                  region.id === 'chamoli' ? 240 :
                  region.id === 'tehri' ? 260 :
                  region.id === 'pauri' ? 350 :
                  region.id === 'haridwar' ? 280 :
                  region.id === 'rudraprayag' ? 295 :
                  region.id === 'dehradun' ? 210 : 160}
              r="11"
              fill={activeRegion === region.id ? "#E21B1B" : "#FFD700"}
              stroke="#ffffff"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Property count */}
            <text
              x={region.id === 'nainital' ? 320 : 
                 region.id === 'almora' ? 370 : 
                 region.id === 'pithoragarh' ? 480 :
                 region.id === 'champawat' ? 440 :
                 region.id === 'bageshwar' ? 410 :
                 region.id === 'udhamsingh' ? 330 :
                 region.id === 'chamoli' ? 370 :
                 region.id === 'tehri' ? 200 :
                 region.id === 'pauri' ? 180 :
                 region.id === 'haridwar' ? 80 :
                 region.id === 'rudraprayag' ? 290 :
                 region.id === 'dehradun' ? 100 : 220}
              y={region.id === 'nainital' ? 404 : 
                 region.id === 'almora' ? 354 : 
                 region.id === 'pithoragarh' ? 254 :
                 region.id === 'champawat' ? 384 :
                 region.id === 'bageshwar' ? 314 :
                 region.id === 'udhamsingh' ? 494 :
                 region.id === 'chamoli' ? 244 :
                 region.id === 'tehri' ? 264 :
                 region.id === 'pauri' ? 354 :
                 region.id === 'haridwar' ? 284 :
                 region.id === 'rudraprayag' ? 299 :
                 region.id === 'dehradun' ? 214 : 164}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#333"
              style={{ pointerEvents: 'none' }}
            >
              {region.properties}
            </text>
          </g>
        ))}
        
        {/* Neighboring states */}
        <text x="60" y="100" fontSize="14" fill="#888888" opacity="0.7">Himachal Pradesh</text>
        <text x="520" y="200" fontSize="14" fill="#888888" opacity="0.7">Nepal</text>
        <text x="450" y="520" fontSize="14" fill="#888888" opacity="0.7">Uttar Pradesh</text>
        
        {/* Compass */}
        <g transform="translate(520, 120)">
          <circle cx="0" cy="0" r="25" fill="white" stroke="#333" strokeWidth="1" opacity="0.9" />
          <polygon points="0,-20 4,-4 0,-8 -4,-4" fill="#D00" />
          <polygon points="0,20 4,4 0,8 -4,4" fill="#333" />
          <polygon points="-20,0 -4,4 -8,0 -4,-4" fill="#333" />
          <polygon points="20,0 4,4 8,0 4,-4" fill="#333" />
          <text x="0" y="4" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#D00">N</text>
        </g>
        
        {/* Scale */}
        <g transform="translate(500, 530)">
          <rect x="0" y="0" width="80" height="15" fill="white" stroke="#333" strokeWidth="1" opacity="0.8" />
          <line x1="0" y1="7" x2="80" y2="7" stroke="#333" strokeWidth="1.5" />
          <line x1="0" y1="4" x2="0" y2="10" stroke="#333" strokeWidth="1.5" />
          <line x1="40" y1="4" x2="40" y2="10" stroke="#333" strokeWidth="1.5" />
          <line x1="80" y1="4" x2="80" y2="10" stroke="#333" strokeWidth="1.5" />
          <text x="20" y="25" textAnchor="middle" fontSize="9" fill="#333">50 km</text>
          <text x="60" y="25" textAnchor="middle" fontSize="9" fill="#333">100 km</text>
        </g>
        
        {/* Legend */}
        <g transform="translate(50, 500)">
          <rect x="0" y="0" width="140" height="80" rx="4" fill="white" stroke="#333" strokeWidth="1" opacity="0.8" />
          <text x="70" y="15" textAnchor="middle" fontSize="10" fontWeight="bold">Properties Available</text>
          
          <rect x="10" y="25" width="12" height="12" fill="#FFCCBC" stroke="#333" strokeWidth="0.5" />
          <text x="30" y="35" fontSize="9" textAnchor="start">21+ properties</text>
          
          <rect x="10" y="45" width="12" height="12" fill="#C8E6C9" stroke="#333" strokeWidth="0.5" />
          <text x="30" y="55" fontSize="9" textAnchor="start">16-20 properties</text>
          
          <rect x="10" y="65" width="12" height="12" fill="#BBDEFB" stroke="#333" strokeWidth="0.5" />
          <text x="30" y="75" fontSize="9" textAnchor="start">11-15 properties</text>
          
          <rect x="80" y="25" width="12" height="12" fill="#E1BEE7" stroke="#333" strokeWidth="0.5" />
          <text x="100" y="35" fontSize="9" textAnchor="start">6-10 properties</text>
          
          <rect x="80" y="45" width="12" height="12" fill="#F5F5F5" stroke="#333" strokeWidth="0.5" />
          <text x="100" y="55" fontSize="9" textAnchor="start">0-5 properties</text>
          
          <rect x="80" y="65" width="12" height="12" fill="#FFD700" stroke="#333" strokeWidth="0.5" />
          <text x="100" y="75" fontSize="9" textAnchor="start">Selected</text>
        </g>
      </svg>
      
      {/* Tooltip */}
      {activeRegion && (
        <div 
          className="absolute bg-white p-3 rounded shadow-lg z-10 pointer-events-none"
          style={{ 
            left: tooltipPosition.x + 10, 
            top: tooltipPosition.y - 40,
            transform: 'translateX(-50%)',
            maxWidth: '250px',
            borderLeft: '4px solid #0A3D62',
            opacity: 0.95
          }}
        >
          <p className="font-bold text-primary text-base mb-1">
            {regions.find(r => r.id === activeRegion)?.name}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {regions.find(r => r.id === activeRegion)?.description}
          </p>
          <div className="flex items-center">
            <div className="flex-shrink-0 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2">P</div>
            <p className="text-sm font-medium">
              {regions.find(r => r.id === activeRegion)?.properties} properties available
            </p>
          </div>
        </div>
      )}
      
      {/* Region Info Modal */}
      {showInfo && selectedRegion && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-primary">{selectedRegion.name}</h3>
              <button 
                onClick={closeInfo}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="mb-4">{selectedRegion.description}</p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-400">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-800">Available Properties</span>
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">{selectedRegion.properties}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Average Price</div>
                  <div className="font-semibold text-gray-800">₹ {Math.floor(Math.random() * 50 + 70)},00,000</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Elevation</div>
                  <div className="font-semibold text-gray-800">{Math.floor(Math.random() * 1000 + 1500)} m</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Climate</div>
                  <div className="font-semibold text-gray-800">Temperate</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Best Time to Visit</div>
                  <div className="font-semibold text-gray-800">Mar-Jun, Sep-Nov</div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  onClick={closeInfo}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                
                <Link 
                  href={selectedRegion.url}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#0c4b7a] transition-colors"
                >
                  View Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KumaonMap; 