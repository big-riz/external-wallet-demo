'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface User {
  email: string;
  id: string;
  hasToken: boolean;
  walletId: string | null;
  isAdmin: boolean;
}

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getUsers(token);
        if (response.data) {
          setUsers(response.data);
        } else {
          throw new Error('Failed to fetch users');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('An error occurred while fetching users');
        toast.error('Failed to fetch users');
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, [token, router]);

  if (!token) {
    return null; // The useEffect will handle routing to /auth
  }

  return (
    <div className="w-full px-4 py-8 bg-background">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {isLoading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Has Token</TableHead>
              <TableHead>Wallet ID</TableHead>
              <TableHead>Is Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.hasToken ? 'Yes' : 'No'}</TableCell>
                <TableCell>{user.walletId || 'N/A'}</TableCell>
                <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}