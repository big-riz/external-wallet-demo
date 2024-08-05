import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';

interface TransactionHistoryProps {
  email: string;
}

interface PaymentResult {
  transactionId: string;
  note: string;
  time: number;
  type: 'send' | 'receive';
  units: number;
  fiatCurrencyCode: {
    units: number;
    currencyCode: string;
  };
  currency: {
    code: string;
    logoUrl: string;
  };
  participants: Array<{
    id: string;
    type: string;
    alias: string;
    tags: string[];
  }>;
}

export function TransactionHistory({ email }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentResult[]>([]);
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
                <TableHead>Fiat Equivalent</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.transactionId}>
                  <TableCell>{tx.transactionId.slice(0, 8)}...</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>
                    {tx.units} {tx.currency.code}
                    <img src={tx.currency.logoUrl} alt={tx.currency.code} className="w-4 h-4 inline ml-1" />
                  </TableCell>
                  <TableCell>
                    {tx.fiatEquivalent.units} {tx.fiatEquivalent.currencyCode}
                  </TableCell>
                  <TableCell>
                    {tx.participants[0]?.alias || 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(tx.time * 1000).toLocaleString()}</TableCell>
                  <TableCell>{tx.note || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}