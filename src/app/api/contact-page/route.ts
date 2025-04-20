export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the Contact page content structure
interface ContactPageContent {
  title: string;
  subtitle: string;
  heroImage: string;
  getInTouchText: string;
  officeLocation: {
    address: string;
    mapEmbed: string;
    showMap: boolean;
  };
  contactInfo: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  faqSection: {
    title: string;
    subtitle: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  };
  updatedAt: string;
}

// Default content with safe defaults
const defaultContent: ContactPageContent = {
  title: 'Contact Us',
  subtitle: "We're here to assist you with any queries about Uttarakhand properties",
  heroImage: '',
  getInTouchText: 'Whether you\'re looking to buy, sell, or lease property in Uttarakhand, our team of experts is ready to assist you. Fill out the form, and we\'ll get back to you as soon as possible.',
  officeLocation: {
    address: 'Mall Road, Almora, Uttarakhand',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27561.837268764513!2d79.63896734226673!3d29.59738209931433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a0b7328910d81f%3A0x9811d25dd87d8ed3!2sAlmora%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1710236428824!5m2!1sen!2sin',
    showMap: true
  },
  contactInfo: {
    email: 'info@360degreesrealestate.in',
    phone: '+91 98765 43210',
    whatsapp: '919759866333'
  },
  operatingHours: {
    weekdays: 'Monday - Saturday: 9 AM - 6 PM',
    weekends: 'Sunday: By Appointment Only'
  },
  faqSection: {
    title: 'Frequently Asked Questions',
    subtitle: '',
    faqs: [
      {
        question: 'How can I schedule a property visit?',
        answer: 'You can schedule a property visit by filling out our contact form, calling us directly, or sending us an email. Our team will arrange a convenient time for you to visit the property.'
      },
      {
        question: 'Do you offer virtual property tours?',
        answer: 'Yes, we specialize in 360° virtual tours that allow you to explore properties remotely. These tours provide an immersive experience of the property without requiring a physical visit'
      },
      {
        question: 'What areas in Uttarakhand do you cover?',
        answer: 'We primarily focus on properties in the Kumaon region, including Nainital, Almora, Bhimtal, Mukteshwar, and Ranikhet. We also have select listings in the Garhwal region'
      },
      {
        question: 'Can you help with property documentation?',
        answer: 'Absolutely. Our legal team provides comprehensive documentation assistance, including title verification, registration support, and contract preparation to ensure a smooth transaction'
      }
    ]
  },
  updatedAt: new Date().toISOString()
};

// Path to the content file
const contentFilePath = path.join(process.cwd(), 'data', 'contact-page.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get content from file or create with defaults if doesn't exist
async function getContent(): Promise<ContactPageContent> {
  try {
    await ensureDataDir();
    
    try {
      await fs.access(contentFilePath);
      const data = await fs.readFile(contentFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, create with defaults
      await fs.writeFile(contentFilePath, JSON.stringify(defaultContent, null, 2));
      return defaultContent;
    }
  } catch (error) {
    console.error('Error accessing contact page content file:', error);
    return defaultContent;
  }
}

// Save content to file
async function saveContent(content: ContactPageContent): Promise<void> {
  await ensureDataDir();
  content.updatedAt = new Date().toISOString();
  await fs.writeFile(contentFilePath, JSON.stringify(content, null, 2));
}

// GET endpoint - retrieve contact page content
export async function GET() {
  try {
    console.log("GET request for contact page content");
    const content = await getContent();
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error('Error retrieving contact page content:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve contact page content' },
      { status: 500 }
    );
  }
}

// POST endpoint - update contact page content
export async function POST(req: NextRequest) {
  try {
    console.log("POST request to update contact page content");
    
    // Parse request data
    const data = await req.json();
    
    // Get existing content
    const existingContent = await getContent();
    
    // Update content with new data
    const updatedContent: ContactPageContent = {
      ...existingContent,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated content
    await saveContent(updatedContent);
    
    return NextResponse.json(
      { message: 'Contact page content updated successfully', content: updatedContent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating contact page content:', error);
    return NextResponse.json(
      { error: 'Failed to update contact page content' },
      { status: 500 }
    );
  }
} 