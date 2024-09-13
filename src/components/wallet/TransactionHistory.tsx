import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TransactionHistoryProps {
  transactions: any[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Fiat Equivalent</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.transactionId}>
                <TableCell>{tx.transactionId.slice(0, 8)}...</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>
                  {tx.units} {tx.currency.code}
                </TableCell>
                <TableCell>
                  {tx.fiatEquivalent.units} {tx.fiatEquivalent.currencyCode}
                </TableCell>
                <TableCell>{tx.participants[0]?.alias || 'N/A'}</TableCell>
                <TableCell>{new Date(tx.time * 1000).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
