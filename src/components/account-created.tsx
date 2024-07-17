'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

async function fetchProfile(authToken: string) {
  const response = await fetch('/api/getProfile', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ authToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

export function AccountCreated({ authToken, isExternal, resetState }: { authToken: string, isExternal: boolean, resetState: any }) {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const getProfile = async () => {
      try {
        const data = await fetchProfile(authToken);
        if (isMounted) {
          setProfileData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      }
    };

    getProfile();

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profileData) {
    return <div>Loading...</div>;
  }

  const { publicProfile, privateProfile } = profileData;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
            { !isExternal && ( <CardDescription> Review the details of your <span className="font-semibold">App Created</span> wallet. </CardDescription> ) }
            { isExternal && ( <CardDescription> Review the details of your <span className="font-semibold">External</span> wallet. </CardDescription> ) }
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="profile">Email</Label>
                <div className="bg-muted rounded px-3 py-2 text-muted-foreground">{privateProfile.email}</div>
              </div>
              <div>
                <Label htmlFor="user-id">User ID</Label>
                <div className="bg-muted rounded px-3 py-2 text-muted-foreground">{publicProfile.id}</div>
              </div>
              <div>
                <Label htmlFor="user-handle">User Handle</Label>
                <div className="bg-muted rounded px-3 py-2 text-muted-foreground">{publicProfile.handle}</div>
              </div>
              <div>
                <Label htmlFor="user-paymail">User Paymail</Label>
                <div className="bg-muted rounded px-3 py-2 text-muted-foreground">{publicProfile.paymail}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={resetState}>Create New User</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}