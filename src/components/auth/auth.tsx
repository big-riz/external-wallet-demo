'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

const hashPassword = (password: string) => {
  return CryptoJS.SHA256(password).toString();
};

const signIn = async (email: string, hashedPassword: string): Promise<{ token: string, user: any }> => {
  const response = await fetch('/api/auth/signIn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: hashedPassword }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign in');
  }
  return response.json();
};

const signUp = async (email: string, hashedPassword: string): Promise<{ token: string, user: any }> => {
  const response = await fetch('/api/auth/signUp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: hashedPassword }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign up');
  }
  return response.json();
};

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hashedPassword = hashPassword(password);
      const { token, user } = await (isSignUp ? signUp(email, hashedPassword) : signIn(email, hashedPassword));
      setToken(token);
      toast.success(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      router.push('/'); // Redirect to dashboard or home page
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create an Account' : 'Sign In'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button className="w-full mt-4" type="submit">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}