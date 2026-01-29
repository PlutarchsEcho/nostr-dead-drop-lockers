import React from 'react';
import LockersMap from '@/components/LockersMap';
import { useSeoMeta } from '@unhead/react';

export default function Marketplace() {
  useSeoMeta({ title: 'Locker Marketplace' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dead Drop Locker Marketplace</h1>
          <a href="/" className="text-sm text-muted-foreground">Vibed with Shakespeare</a>
        </header>

        <LockersMap />
      </div>
    </div>
  );
}
