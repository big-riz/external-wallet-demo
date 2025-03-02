'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useFormState } from "react-dom";
import { signUpAction } from '@/app/actions/auth/signUpAction';
import { signIn } from '@/app/actions/auth/signInAction';
import logo from '../../../public/logo.webp';

type AuthState = {
  error?: string;
  errors?: Record<string, string[]>;
} | null;

export function AuthClient() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const [signUpState, signUpDispatch] = useFormState<AuthState, FormData>(signUpAction, null);
  const [signInState, signInDispatch] = useFormState<AuthState, FormData>(signIn, null);
  const handleSubmit = isSignUp ? signUpDispatch : signInDispatch;

  useEffect(() => {
    const state = isSignUp ? signUpState : signInState;
    if (state?.error) {
      toast.error(state.error);
    } else if (state !== null && !state.error) {
      router.push('/');
    }
  }, [signUpState, signInState, isSignUp, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary to-primary-foreground">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-4">
            <Image
              src={logo}
              alt="On Chain Casino Logo"
              width={200}
              height={200}
              className="rounded-lg"
            />
            <CardTitle className="text-2xl font-bold text-center">
              On Chain Casino
            </CardTitle>
            <p className="text-muted-foreground text-center">
              {isSignUp ? 'Create an Account' : 'Sign In'}
            </p>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">
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