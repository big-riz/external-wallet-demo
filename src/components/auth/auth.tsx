'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useFormState } from 'react-dom';
import { signUp } from '@/app/actions/auth/signUpAction';
import { signIn } from '@/app/actions/auth/signInAction';

type AuthState = {
  error?: string;
  errors?: Record<string, string[]>;
} | null;

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const [signUpState, signUpAction] = useFormState<AuthState, FormData>(signUp, null);
  const [signInState, signInAction] = useFormState<AuthState, FormData>(signIn, null);
  const handleSubmit = isSignUp ? signUpAction : signInAction;

  useEffect(() => {
    const state = isSignUp ? signUpState : signInState;
    if (state?.error) {
      toast.error(state.error);
    } else if (state !== null && !state.error) {
      router.push('/');
    }
  }, [signUpState, signInState, isSignUp, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create an Account' : 'Sign In'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
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