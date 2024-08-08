'use client';
import React, { useState, useEffect } from 'react';
import { AppUser, useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronRight } from 'lucide-react';


export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<{[key: string]: boolean}>({});
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

  const toggleRow = (id: number) => {
    setExpandedRows(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

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
              <TableHead></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Has Token</TableHead>
              <TableHead>Wallet ID</TableHead>
              <TableHead>Is Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <TableRow>
                  <TableCell>
                    <button onClick={() => toggleRow(user.id)}>
                      {expandedRows[user.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.hasToken ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{user.walletId || 'N/A'}</TableCell>
                  <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                </TableRow>
                {expandedRows[user.id] && user.balances && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="pl-10 py-2">
                        <h3 className="font-semibold mb-2">Balances:</h3>
                        {user.balances.map((balance, index) => (
                          <div key={index} className="mb-2">
                            <p><span className="font-medium">Currency:</span> {balance.currencyCode}</p>
                            <p><span className="font-medium">Balance:</span> {balance.units} {balance.currencyCode}</p>
                            <p><span className="font-medium">Fiat Equivalent:</span> {balance.fiatUnits} {balance.fiatCurrencyCode}</p>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}