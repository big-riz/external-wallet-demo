// src/app/actions/logoutAction.ts
'use server';

import { cookies } from 'next/headers';

export async function logoutAction() {
  'use server';
  cookies().delete('session');
}
