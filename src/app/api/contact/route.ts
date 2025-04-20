export const dynamic = "force-dynamic";
// Rebuilt for static export
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSettings } from '@/utils/settings';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Make this route dynamically rendered

// Define the contact data structure
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'seen' | 'responded';
}

// Path to contact messages JSON file
const contactFilePath = path.join(process.cwd(), 'data', 'contact-messages.json');

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

// Get all contact messages from file
async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    await ensureDataDir();
    
    try {
      await fs.access(contactFilePath);
      const data = await fs.readFile(contactFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, create empty array
      await fs.writeFile(contactFilePath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error('Error accessing contact messages file:', error);
    return [];
  }
}

// Save contact messages to file
async function saveContactMessages(messages: ContactMessage[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(contactFilePath, JSON.stringify(messages, null, 2));
}

/**
 * Handle POST request for contact form submission
 */
export async function POST(req: NextRequest) {
  try {
    console.log('Processing contact form submission');
    
    // Get website settings
    const settings = await getSettings();
    
    // Parse request data
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      console.log('Missing required fields in contact form submission');
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.log('Invalid email format in contact form submission');
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Create contact message object to save
    const contactMessage: ContactMessage = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject || '',
      message: data.message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    
    // Save to backend storage - first get existing messages
    const messages = await getContactMessages();
    messages.push(contactMessage);
    await saveContactMessages(messages);
    console.log(`Contact message saved with ID: ${contactMessage.id}`);
    
    // Also save to inquiries to have everything in one place
    try {
      const inquiriesFilePath = path.join(process.cwd(), 'data', 'inquiries.json');
      let inquiries = [];
      
      try {
        await fs.access(inquiriesFilePath);
        const inquiriesData = await fs.readFile(inquiriesFilePath, 'utf-8');
        inquiries = JSON.parse(inquiriesData);
      } catch (error) {
        // File doesn't exist, create empty array
        await fs.writeFile(inquiriesFilePath, JSON.stringify([]), 'utf-8');
      }
      
      // Create inquiry object
      const inquiry = {
        id: contactMessage.id,
        firstName: data.name.split(' ')[0] || '',
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email,
        phone: data.phone || '',
        subject: data.subject || 'Contact Form Message',
        message: data.message,
        inquiryType: 'contact-form',
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      inquiries.push(inquiry);
      await fs.writeFile(inquiriesFilePath, JSON.stringify(inquiries, null, 2), 'utf-8');
      console.log(`Also saved as inquiry with ID: ${inquiry.id}`);
    } catch (error) {
      console.error('Error saving to inquiries:', error);
      // Continue even if this fails
    }
    
    // Try to send email if configured, but don't fail the request if not
    try {
      // Use hardcoded email address if settings are not available
      const contactEmail = 'contact@360degreesrealestate.in';
      
      // Check if SMTP settings are configured
      if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
        console.log('Email settings not configured in admin settings');
        // Still return success since we saved the data
        return NextResponse.json(
          { 
            message: 'Your message has been received. We will contact you soon!',
            notice: 'Email delivery is not configured yet, but your message has been saved.'
          },
          { status: 200 }
        );
      }
      
      // Create email transport
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort),
        secure: parseInt(settings.smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass,
        },
      });
      
      // Email to send to site admin/owner
      const adminEmailOptions = {
        from: settings.emailFrom || settings.smtpUser, 
        to: contactEmail, // Use the new email address
        subject: `New Contact Form Submission from ${data.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${data.subject || 'No subject'}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>This email was sent from the contact form on your website ${settings.siteName}.</small></p>
        `,
      };
      
      // Email to send to the person who submitted the form (confirmation)
      const userEmailOptions = {
        from: settings.emailFrom || settings.smtpUser,
        to: data.email,
        subject: `Thank you for contacting ${settings.siteName}`,
        html: `
        <h2>Thank you for reaching out to Luxury Real Estate.</h2>
        <p>Hello ${data.name},</p>
        <p>We've received your message and our team will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,</p>
        <p>360degreesrealestate</p>
      `,
      };
      
      // Send emails
      console.log('Sending email to admin...');
      await transporter.sendMail(adminEmailOptions);
      
      // Then send confirmation to user
      console.log('Sending confirmation email to user...');
      await transporter.sendMail(userEmailOptions);
      
      console.log('Contact form emails sent successfully');
    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      // Continue even if email sending fails, since we saved the data
      return NextResponse.json(
        { 
          message: 'Your message has been received, but there was an issue sending email confirmations.',
          error: emailError.message
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { message: 'Your message has been sent. We will contact you soon!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
