'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlatformRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/platform/recommendations');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080c0b] flex items-center justify-center text-emerald-400 font-mono text-xs">
      Loading CarbonSphere Platform...
    </div>
  );
}
