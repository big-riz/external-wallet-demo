'use client';

import { Toaster } from 'react-hot-toast';

export function ToastContainer() {
  return <Toaster position="bottom-left" toastOptions={{ duration: 1000 }} />;
}