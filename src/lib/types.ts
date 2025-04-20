// Property Types
export interface PropertySpec {
  bedrooms?: string;
  bathrooms?: string;
  area: string;
  landSize?: string;
}

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  description: string[];
  specs: PropertySpec;
  features: string[];
  has360Tour: boolean;
  tourId?: string;
  imageUrl: string;
  images?: string[];
  category: 'buy' | 'lease';
  propertyType: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyLocation {
  address: string;
  altitude: string;
  climate: string;
  accessibility: string[];
}

export interface PropertyNearby {
  tourist_attractions: string;
  education: string;
  healthcare: string;
  shopping: string;
  restaurants: string;
  recreation: string;
}

export interface PropertyDetail extends Property {
  location_details: PropertyLocation;
  nearby: PropertyNearby;
  agent: Agent;
  similar_properties: Property[];
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'agent' | 'user';
  createdAt: string;
  updatedAt: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  bio?: string;
  imageUrl?: string;
}

// Inquiry Types
export interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: 'buy' | 'sell' | 'lease' | 'investment' | 'legal' | 'other';
  propertyId?: string;
  status: 'new' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Search Filter Types
export interface SearchFilter {
  category: 'buy' | 'lease';
  location?: string;
  propertyType?: string;
  priceMin?: string;
  priceMax?: string;
  propertySize?: string;
}

// Region Types
export interface Region {
  id: string;
  name: string;
  description: string[];
  imageUrl: string;
  altitude: string;
  climate: string;
  connectivity: string;
  distanceFromDelhi: string;
  propertyHighlights: string[];
}
