import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

interface UsersProps {
  authTokens: Record<string, string>;
  setAuthTokens: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCurrentView: (view: string) => void;
  setSelectedUser: (user: { email: string; authToken: string }) => void;
}

export function Users({ authTokens, setAuthTokens, setCurrentView, setSelectedUser }: UsersProps) {
  const handleDelete = async (email: string) => {
    const updatedTokens = { ...authTokens };
    delete updatedTokens[email];
    setAuthTokens(updatedTokens);
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
                {Object.entries(authTokens).map(([email, authToken]) => (
                  <TableRow key={email} className="cursor-pointer" onClick={() => handleSelectUser(email, authToken)}>
                    <TableCell className="w-1/3">{email}</TableCell>
                    <TableCell className="w-1/2">{authToken.slice(0, 20)}...</TableCell>
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