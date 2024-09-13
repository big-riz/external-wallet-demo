import React from 'react';
import UserPage from '@/components/user/user';

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-start justify-center bg-background">
        <div className="w-full max-w-4xl p-4 md:p-8">
            <UserPage/>
        </div>
      </main>
    </div>
  )
}