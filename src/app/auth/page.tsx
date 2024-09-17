// app/auth/page.tsx

import { getUserDataWithoutRedirect } from '@/app/actions/getUserDataWithoutRedirect';
import { redirect } from 'next/navigation';
import { AuthClient } from './AuthClient';

export default async function AuthPage() {
  const user = await getUserDataWithoutRedirect();
  if (user?.id) {
    redirect('/');
  }
  return <AuthClient />;
}
