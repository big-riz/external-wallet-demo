import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { Types } from '@handcash/handcash-sdk';

interface TransactionHistoryProps {
  email: string;
}

export function TransactionHistory({ email }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Types.PaymentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setIsLoading(true);
      const response = await apiService.getTransactionHistory(email);
      if (response.data) {
        setTransactions(response.data);
        setError(null);
      } else {
        setError('Failed to fetch transaction history');
      }
      setIsLoading(false);
    };

    fetchTransactionHistory();
  }, [email]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Loading transaction history...</p>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.transactionId}>
                  <TableCell>{tx.transactionId}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  {/* <TableCell>{tx.fiatEquivalent.amount}</TableCell>
                  <TableCell>{tx.fiatEquivalent.currencyCode}</TableCell> */}
                  <TableCell>{new Date(tx.time * 1000).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}