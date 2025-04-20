'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretAdminAccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin immediately
    router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">Redirecting to admin panel...</h2>
        <div className="mt-4 h-2 w-32 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-[#0A2E1C] animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 