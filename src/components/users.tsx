import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'
import { apiService } from '@/lib/api';

interface UsersProps {
  adminToken: string;
  setCurrentView: (view: string) => void;
  setSelectedUser: (user: { email: string; authToken: string }) => void;
}

export function Users({ adminToken, setCurrentView, setSelectedUser }: UsersProps) {
  const [users, setUsers] = useState<Array<{ email: string; auth_token: string }>>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await apiService.getUsers(adminToken);
      if (response.data) {
        setUsers(response.data);
      }
    };
    fetchUsers();
  }, [adminToken]);

  const handleDelete = async (email: string) => {
    const response = await apiService.deleteUser(email, adminToken);
    if (response.data) {
      setUsers(users.filter(user => user.email !== email));
    }
  };

  const handleSelectUser = (email: string, authToken: string) => {
    setSelectedUser({ email, authToken });
    setCurrentView('userDetails');
  };

  return (
    <div className="w-full px-4 py-8 bg-background">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>User Table</CardTitle>
          <CardDescription>View and manage users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Email</TableHead>
                  <TableHead className="w-1/2">Auth Token</TableHead>
                  <TableHead className="w-1/6 text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(({ email, auth_token }) => (
                  <TableRow key={email} className="cursor-pointer" onClick={() => handleSelectUser(email, auth_token)}>
                    <TableCell className="w-1/3">{email}</TableCell>
                    <TableCell className="w-1/2">{auth_token?.slice(0, 20)}...</TableCell>
                    <TableCell className="w-1/6 text-center">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(email);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}