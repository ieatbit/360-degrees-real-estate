'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/LoadingSpinner';

export default function ContentRedirectPage() {
  const router = useRouter();
  
  // Redirect to admin dashboard
  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Redirecting...</p>
    </div>
  );
} 