'use client';
import React from 'react';
import { useProtectedRoute } from '@/lib/auth-context';

export default function Home() {
  useProtectedRoute();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-start justify-center bg-background">
        <div className="w-full max-w-4xl p-4 md:p-8">
          A Skeleton Wallet as a Service Application
        </div>
      </main>
    </div>
  )
}