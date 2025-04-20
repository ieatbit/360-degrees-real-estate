import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: '360 Degrees Real Estate - Premium Land & Plot Listings',
  description: 'Explore premium plots and land listings with immersive 360° virtual tours. Find the perfect location to build your dream home.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>" />
        <style dangerouslySetInnerHTML={{ __html: `
          .page-transition * {
            transition: none !important;
          }
          html.is-loading {
            overflow: hidden;
          }
          html.is-loading body {
            visibility: hidden;
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          document.documentElement.classList.add('is-loading');
          window.addEventListener('DOMContentLoaded', function() {
            document.documentElement.classList.add('page-transition');
            setTimeout(function() {
              document.documentElement.classList.remove('is-loading');
              setTimeout(function() {
                document.documentElement.classList.remove('page-transition');
              }, 100);
            }, 10);
          });
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
