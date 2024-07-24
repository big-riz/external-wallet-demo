import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiService } from '@/lib/api';

interface AdminLoginProps {
  setAdminToken: (token: string) => void;
  setCurrentView: (view: string) => void;
}

export function AdminLogin({ setAdminToken, setCurrentView }: AdminLoginProps) {
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await apiService.adminLogin(password);
    if (response.data) {
      setAdminToken(response.data.token);
      setCurrentView('manageUsers');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Login</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}