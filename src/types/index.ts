export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  images: string[];
  featured?: boolean;
  featuredOrder?: number; // Order for display in featured section (lower numbers appear first)
  
  // Additional properties used in the application
  videoUrl?: string;
  videoUrls?: string[]; // Array of additional video URLs
  propertyType?: string;
  createdAt?: string | Date;
  landSize?: number;
  yearBuilt?: number;
  dimensions?: string;
  facing?: string;
  waterSource?: string;
  roadAccess?: string;
  electricity?: string;
  view?: string;
  
  // Property features and amenities
  features?: string[];
  amenities?: string[];
  nearby?: Record<string, string>;
  
  // Form data saved from admin panel
  specs?: {
    bedrooms?: string | number;
    bathrooms?: string | number;
    area?: string;
    landSize?: string;
    naliSize?: string;
    plotSize?: string;
    plotDimensions?: string;
    hasBedrooms?: boolean;
    hasBathrooms?: boolean;
    plotType?: string;
  };
  
  agent?: {
    id?: string;
    name: string;
    title?: string;
    phone: string;
    email: string;
    bio?: string;
    image?: string;
    imageUrl?: string;
  };
  
  location_details?: {
    address: string;
    altitude?: string;
    climate?: string;
    accessibility?: string[];
  };
}

// Generic section interface for flexible content sections
export interface ContentSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  bgColor?: string;
  textColor?: string;
  order: number;
  enabled: boolean;
  items?: {
    id: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    icon?: string;
    link?: string;
  }[];
  settings?: Record<string, any>;
}

export interface HomePageContent {
  id?: string;
  // Standard sections
  heroTitle: string;
  heroSubtitle?: string;
  heroBackgroundImage?: string;
  featuredSectionTitle: string;
  whyChooseUsTitle: string;
  whyChooseUsFeatures: {
    title: string;
    description: string;
    icon: string;
  }[];
  aboutSectionTitle?: string;
  aboutSectionContent?: string;
  aboutSectionImage?: string;
  seoTitle: string;
  seoDescription: string;
  
  // Custom sections support
  customSections?: ContentSection[];
  
  // Metadata
  updatedAt?: string;
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
} 