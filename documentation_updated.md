# 360degreesrealestate.in - Website Documentation

## Overview
This documentation provides comprehensive information about your 360degreesrealestate.in website, including its features, structure, and instructions for managing content.

## Table of Contents
1. [Website Features](#website-features)
2. [Technical Architecture](#technical-architecture)
3. [Content Management](#content-management)
4. [Property Management](#property-management)
5. [360° Virtual Tour Integration](#360-virtual-tour-integration)
6. [Domain Configuration](#domain-configuration)
7. [Maintenance and Updates](#maintenance-and-updates)

## Website Features

### Home Page
- Hero section with search functionality
- Featured properties showcase
- Uttarakhand regions information
- Why Choose Us section
- Client testimonials
- Call to action

### Property Listings
- Separate Buy and Lease sections
- Property cards with 360° indicators
- Detailed property pages with specifications
- Virtual tour integration
- Contact forms for inquiries

### Search and Filter
- Property type filtering
- Location-based search
- Price range filtering
- Property size filtering
- Category selection (Buy/Lease)

### Regional Information
- Dedicated Uttarakhand Guide section
- Information about Kumaon region
- Details about popular locations (Nainital, Almora, etc.)

### Contact and About
- Contact form for general inquiries
- About Us page with company information
- Team member profiles

## Technical Architecture

### Frontend
- Built with Next.js 15.1.4
- Responsive design using Tailwind CSS
- Client-side components for interactive elements
- Server-side rendering for SEO optimization

### Backend
- API routes for data management
- Database schema for properties, inquiries, and regions
- Authentication system for admin access
- File storage for property images and 360° tours

### Database Structure
- Properties table: stores all property information
- Inquiries table: stores user inquiries and contact form submissions
- Regions table: stores information about Uttarakhand regions
- Users table: stores admin user information

## Content Management

### Adding New Properties
1. Access the admin dashboard (URL: https://360degreesrealestate.in/admin)
2. Log in with your admin credentials
3. Navigate to "Properties" section
4. Click "Add New Property"
5. Fill in the property details:
   - Title
   - Price
   - Location
   - Description
   - Specifications (bedrooms, bathrooms, area, etc.)
   - Features
   - Category (Buy/Lease)
   - Property Type
   - Upload images
   - Add 360° tour (if available)
6. Click "Save" to publish the property

### Managing Inquiries
1. Access the admin dashboard
2. Navigate to "Inquiries" section
3. View all inquiries with status indicators
4. Click on an inquiry to view details
5. Update status (New, In Progress, Completed)
6. Add internal notes
7. Send responses directly from the dashboard

### Updating Regional Information
1. Access the admin dashboard
2. Navigate to "Regions" section
3. Select the region to update
4. Edit the content using the rich text editor
5. Upload new images if needed
6. Click "Save" to publish changes

## Property Management

### Property Statuses
- Active: Currently available properties
- Sold/Leased: Properties that are no longer available
- Featured: Properties highlighted on the home page
- Draft: Properties not yet published

### Adding 360° Virtual Tours
1. Create your 360° tour using your preferred software (Matterport, CloudPano, etc.)
2. Export the tour as an embed code or URL
3. In the property edit page, locate the "Virtual Tour" section
4. Paste the embed code or URL
5. Save the property to update the tour

### Managing Property Images
- Main image: Appears on property cards and as the featured image
- Gallery images: Additional images shown in the property detail page
- Recommended image sizes:
  - Main image: 1200 x 800 pixels
  - Gallery images: 1600 x 1200 pixels
  - Virtual tour placeholder: 1920 x 1080 pixels

## 360° Virtual Tour Integration

### Supported Platforms
The website supports integration with the following 360° virtual tour platforms:
- Matterport
- CloudPano
- WP VR
- Custom iframe embeds

### Integration Methods
1. **Embed Code**: Paste the embed code provided by your virtual tour platform
2. **URL Integration**: Enter the direct URL to your virtual tour
3. **API Integration**: For advanced users, connect directly to tour platform APIs

### Best Practices
- Ensure tours are mobile-compatible
- Optimize tour loading speed for better user experience
- Include navigation instructions for users
- Add hotspots to highlight key property features

## Domain Configuration

### Pointing Your Domain to the Deployed Website
1. Log in to your domain registrar account (where you purchased 360degreesrealestate.in)
2. Navigate to the DNS settings or Zone Editor
3. Add the following records:
   - Type: A Record
   - Name: @ (or leave blank)
   - Value: The IP address provided by the hosting service
   - TTL: 3600 (or as recommended)
4. Add a CNAME record:
   - Type: CNAME
   - Name: www
   - Value: The deployment URL provided (currently pointing to the temporary deployment URL)
   - TTL: 3600 (or as recommended)
5. Save changes and wait for DNS propagation (can take up to 48 hours)

### SSL Certificate
The website is deployed with an SSL certificate for secure HTTPS connections. This is automatically managed and renewed.

## Maintenance and Updates

### Regular Maintenance Tasks
- Check and respond to new inquiries daily
- Update property statuses as they change
- Add new properties as they become available
- Refresh content on regional information pages quarterly
- Review and update testimonials monthly

### Technical Updates
- The website framework (Next.js) will receive automatic security updates
- Major version updates will require manual intervention
- Database backups are performed automatically daily
- Content backups should be performed before making significant changes

### Support and Assistance
For technical support or assistance with website management, please contact:
- Email: support@360degreesrealestate.in
- Include your specific issues in your message
- Response time: Within 24-48 hours

---

This documentation is provided as a guide for managing your 360degreesrealestate.in website. For additional assistance or custom feature development, please contact the development team.
