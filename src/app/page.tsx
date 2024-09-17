'use client';
import HeadsOrTailsGame from '@/components/games/HeadsOrTails';
import React from 'react';

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-start justify-center bg-background">
        <div className="w-full max-w-4xl p-4 md:p-8">
          <HeadsOrTailsGame />
        </div>
      </main>
    </div>
  )
}