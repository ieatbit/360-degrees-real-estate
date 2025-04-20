import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContentPage } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// Content data path
const contentFilePath = path.join(process.cwd(), 'data/content.json');

// Function to get content data
async function getContent(slug: string): Promise<ContentPage | null> {
  try {
    // Check if the file exists, if not return null
    try {
      await fs.access(contentFilePath);
    } catch (error) {
      console.error('Content file does not exist:', error);
      return null;
    }

    // Read the file
    const fileContent = await fs.readFile(contentFilePath, 'utf8');
    const contentData = JSON.parse(fileContent) as ContentPage[];
    
    // Find the content with the matching slug
    const content = contentData.find(item => item.slug === slug && item.status === 'published');
    
    if (!content) {
      console.log(`Content with slug "${slug}" not found or not published`);
      return null;
    }
    
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const content = await getContent(params.slug);
  
  if (!content) {
    return {
      title: 'Content Not Found',
      description: 'The requested content could not be found',
    };
  }
  
  return {
    title: content.metaTitle || content.title,
    description: content.metaDescription || '',
  };
}

interface ContentPageProps {
  params: {
    slug: string
  }
}

export default async function ContentPage({ 
  params 
}: ContentPageProps) {
  const content = await getContent(params.slug);
  
  if (!content) {
    notFound();
  }

  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{content.title}</h1>
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content || '' }}
          />
        </div>
      </main>
      
      <Footer />
    </>
  );
} 