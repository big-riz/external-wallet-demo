import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw } from 'lucide-react'

export function Users() {
  const [users, setUsers] = useState({});

  useEffect(() => {
    const storedData = localStorage.getItem('users');
    if (storedData) {
      const parsedUsers = JSON.parse(storedData);
      setUsers(parsedUsers);
    }
  }, []);

  const handleDelete = (email) => {
    const updatedUsers = { ...users };
    delete updatedUsers[email];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleRequestCode = async (email) => {
    console.log('reset state', 'Set state to 2');
    // Placeholder for future implementation
    // setEmail(result.email);
    // setRequestId(result.requestId);
    // setCurrentStep(2);
    // resolve(true);
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
                  <TableHead className="w-1/3">Handle</TableHead>
                  <TableHead className="w-1/6 text-center">New Code</TableHead>
                  <TableHead className="w-1/6 text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(users).map(([email, userData]) => (
                  <TableRow key={email}>
                    <TableCell className="w-1/3">{email}</TableCell>
                    <TableCell className="w-1/3">{userData.profile.handle}</TableCell>
                    <TableCell className="w-1/6 text-center">
                      <Button variant="outline" size="sm" onClick={() => handleRequestCode(email)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New Code
                      </Button>
                    </TableCell>
                    <TableCell className="w-1/6 text-center">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(email)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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