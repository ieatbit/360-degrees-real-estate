import { D1Database } from '@cloudflare/workers-types';
import { Property, PropertyDetail, Agent, Inquiry, Region } from './types';

// Property Service
export class PropertyService {
  constructor(private db: D1Database) {}

  // Get all properties with optional filtering
  async getProperties(filters?: {
    category?: 'buy' | 'lease';
    location?: string;
    propertyType?: string;
    priceMin?: string;
    priceMax?: string;
    propertySize?: string;
  }): Promise<Property[]> {
    let query = 'SELECT * FROM properties';
    const params: any[] = [];
    
    if (filters) {
      const conditions: string[] = [];
      
      if (filters.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }
      
      if (filters.location) {
        conditions.push('location LIKE ?');
        params.push(`%${filters.location}%`);
      }
      
      if (filters.propertyType) {
        conditions.push('property_type = ?');
        params.push(filters.propertyType);
      }
      
      // Add price range filtering
      if (filters.priceMin) {
        conditions.push('CAST(REPLACE(REPLACE(price, "₹", ""), ",", "") AS INTEGER) >= ?');
        params.push(parseInt(filters.priceMin));
      }
      
      if (filters.priceMax) {
        conditions.push('CAST(REPLACE(REPLACE(price, "₹", ""), ",", "") AS INTEGER) <= ?');
        params.push(parseInt(filters.priceMax));
      }
      
      // Add property size filtering (would need to parse area field)
      if (filters.propertySize) {
        // This is a simplified approach - in a real implementation, 
        // you'd need more sophisticated parsing of the area field
        if (filters.propertySize === 'small') {
          conditions.push('specs LIKE ?');
          params.push('%"area":"<1000 sq.ft"%');
        } else if (filters.propertySize === 'medium') {
          conditions.push('specs LIKE ?');
          params.push('%"area":"1000-2000 sq.ft"%');
        } else if (filters.propertySize === 'large') {
          conditions.push('specs LIKE ?');
          params.push('%"area":"2000-4000 sq.ft"%');
        } else if (filters.propertySize === 'xlarge') {
          conditions.push('specs LIKE ?');
          params.push('%"area":">4000 sq.ft"%');
        }
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.prepare(query).bind(...params).all();
    
    if (!result.success) {
      throw new Error('Failed to fetch properties');
    }
    
    return result.results.map(this.mapRowToProperty);
  }
  
  // Get property by ID with full details
  async getPropertyById(id: string): Promise<PropertyDetail | null> {
    // Get basic property info
    const propertyResult = await this.db
      .prepare('SELECT * FROM properties WHERE id = ?')
      .bind(id)
      .first();
    
    if (!propertyResult) {
      return null;
    }
    
    // Get property details
    const detailsResult = await this.db
      .prepare('SELECT * FROM property_details WHERE property_id = ?')
      .bind(id)
      .first();
    
    if (!detailsResult) {
      return null;
    }
    
    // Get agent info
    const agentResult = await this.db
      .prepare('SELECT * FROM agents WHERE id = ?')
      .bind(detailsResult.agent_id)
      .first();
    
    if (!agentResult) {
      return null;
    }
    
    // Get similar properties (simplified approach)
    const similarPropertiesResult = await this.db
      .prepare('SELECT * FROM properties WHERE id != ? AND property_type = ? LIMIT 3')
      .bind(id, propertyResult.property_type)
      .all();
    
    const similarProperties = similarPropertiesResult.success 
      ? similarPropertiesResult.results.map(this.mapRowToProperty)
      : [];
    
    // Construct full property detail
    const property = this.mapRowToProperty(propertyResult);
    const locationDetails = JSON.parse(detailsResult.location_details);
    const nearby = JSON.parse(detailsResult.nearby);
    const agent = this.mapRowToAgent(agentResult);
    
    return {
      ...property,
      location_details: locationDetails,
      nearby: nearby,
      agent: agent,
      similar_properties: similarProperties
    };
  }
  
  // Create new property
  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db
      .prepare(`
        INSERT INTO properties (
          id, title, price, location, description, specs, features, has_360_tour, 
          tour_id, image_url, images, category, property_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        property.title,
        property.price,
        property.location,
        JSON.stringify(property.description),
        JSON.stringify(property.specs),
        JSON.stringify(property.features),
        property.has360Tour ? 1 : 0,
        property.tourId || null,
        property.imageUrl,
        property.images ? JSON.stringify(property.images) : null,
        property.category,
        property.propertyType,
        now,
        now
      )
      .run();
    
    if (!result.success) {
      throw new Error('Failed to create property');
    }
    
    return id;
  }
  
  // Update property
  async updateProperty(id: string, property: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    // Get current property
    const currentProperty = await this.db
      .prepare('SELECT * FROM properties WHERE id = ?')
      .bind(id)
      .first();
    
    if (!currentProperty) {
      return false;
    }
    
    // Build update query
    const updates: string[] = [];
    const params: any[] = [];
    
    if (property.title) {
      updates.push('title = ?');
      params.push(property.title);
    }
    
    if (property.price) {
      updates.push('price = ?');
      params.push(property.price);
    }
    
    if (property.location) {
      updates.push('location = ?');
      params.push(property.location);
    }
    
    if (property.description) {
      updates.push('description = ?');
      params.push(JSON.stringify(property.description));
    }
    
    if (property.specs) {
      updates.push('specs = ?');
      params.push(JSON.stringify(property.specs));
    }
    
    if (property.features) {
      updates.push('features = ?');
      params.push(JSON.stringify(property.features));
    }
    
    if (property.has360Tour !== undefined) {
      updates.push('has_360_tour = ?');
      params.push(property.has360Tour ? 1 : 0);
    }
    
    if (property.tourId !== undefined) {
      updates.push('tour_id = ?');
      params.push(property.tourId || null);
    }
    
    if (property.imageUrl) {
      updates.push('image_url = ?');
      params.push(property.imageUrl);
    }
    
    if (property.images) {
      updates.push('images = ?');
      params.push(JSON.stringify(property.images));
    }
    
    if (property.category) {
      updates.push('category = ?');
      params.push(property.category);
    }
    
    if (property.propertyType) {
      updates.push('property_type = ?');
      params.push(property.propertyType);
    }
    
    // Add updated_at
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    
    // Add id as the last parameter
    params.push(id);
    
    if (updates.length === 0) {
      return true; // Nothing to update
    }
    
    const result = await this.db
      .prepare(`UPDATE properties SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();
    
    return result.success;
  }
  
  // Delete property
  async deleteProperty(id: string): Promise<boolean> {
    // First delete from property_details (due to foreign key constraint)
    await this.db
      .prepare('DELETE FROM property_details WHERE property_id = ?')
      .bind(id)
      .run();
    
    // Then delete the property
    const result = await this.db
      .prepare('DELETE FROM properties WHERE id = ?')
      .bind(id)
      .run();
    
    return result.success;
  }
  
  // Helper method to map database row to Property object
  private mapRowToProperty(row: any): Property {
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      location: row.location,
      description: JSON.parse(row.description),
      specs: JSON.parse(row.specs),
      features: JSON.parse(row.features),
      has360Tour: row.has_360_tour === 1,
      tourId: row.tour_id,
      imageUrl: row.image_url,
      images: row.images ? JSON.parse(row.images) : undefined,
      category: row.category as 'buy' | 'lease',
      propertyType: row.property_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  // Helper method to map database row to Agent object
  private mapRowToAgent(row: any): Agent {
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      phone: row.phone,
      email: row.email,
      bio: row.bio,
      imageUrl: row.image_url
    };
  }
}

// Inquiry Service
export class InquiryService {
  constructor(private db: D1Database) {}
  
  // Create new inquiry
  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await this.db
      .prepare(`
        INSERT INTO inquiries (
          id, first_name, last_name, email, phone, subject, message, 
          inquiry_type, property_id, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id,
        inquiry.firstName,
        inquiry.lastName,
        inquiry.email,
        inquiry.phone,
        inquiry.subject,
        inquiry.message,
        inquiry.inquiryType,
        inquiry.propertyId || null,
        'new', // Default status
        now,
        now
      )
      .run();
    
    if (!result.success) {
      throw new Error('Failed to create inquiry');
    }
    
    return id;
  }
  
  // Get all inquiries
  async getInquiries(): Promise<Inquiry[]> {
    const result = await this.db
      .prepare('SELECT * FROM inquiries ORDER BY created_at DESC')
      .all();
    
    if (!result.success) {
      throw new Error('Failed to fetch inquiries');
    }
    
    return result.results.map(this.mapRowToInquiry);
  }
  
  // Get inquiry by ID
  async getInquiryById(id: string): Promise<Inquiry | null> {
    const result = await this.db
      .prepare('SELECT * FROM inquiries WHERE id = ?')
      .bind(id)
      .first();
    
    if (!result) {
      return null;
    }
    
    return this.mapRowToInquiry(result);
  }
  
  // Update inquiry status
  async updateInquiryStatus(id: string, status: 'new' | 'in-progress' | 'completed'): Promise<boolean> {
    const result = await this.db
      .prepare('UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, new Date().toISOString(), id)
      .run();
    
    return result.success;
  }
  
  // Helper method to map database row to Inquiry object
  private mapRowToInquiry(row: any): Inquiry {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      inquiryType: row.inquiry_type as 'buy' | 'sell' | 'lease' | 'investment' | 'legal' | 'other',
      propertyId: row.property_id,
      status: row.status as 'new' | 'in-progress' | 'completed',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Region Service
export class RegionService {
  constructor(private db: D1Database) {}
  
  // Get all regions
  async getRegions(): Promise<Region[]> {
    const result = await this.db
      .prepare('SELECT * FROM regions')
      .all();
    
    if (!result.success) {
      throw new Error('Failed to fetch regions');
    }
    
    return result.results.map(this.mapRowToRegion);
  }
  
  // Get region by ID
  async getRegionById(id: string): Promise<Region | null> {
    const result = await this.db
      .prepare('SELECT * FROM regions WHERE id = ?')
      .bind(id)
      .first();
    
    if (!result) {
      return null;
    }
    
    return this.mapRowToRegion(result);
  }
  
  // Helper method to map database row to Region object
  private mapRowToRegion(row: any): Region {
    return {
      id: row.id,
      name: row.name,
      description: JSON.parse(row.description),
      imageUrl: row.image_url,
      altitude: row.altitude,
      climate: row.climate,
      connectivity: row.connectivity,
      distanceFromDelhi: row.distance_from_delhi,
      propertyHighlights: JSON.parse(row.property_highlights)
    };
  }
}
