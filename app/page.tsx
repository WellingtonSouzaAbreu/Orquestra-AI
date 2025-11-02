'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/storage/localStorage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a nickname
    const user = db.getUser();
    if (!user) {
      router.push('/welcome');
    } else {
      router.push('/inicio');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
