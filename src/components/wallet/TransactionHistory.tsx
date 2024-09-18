import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Types } from '@handcash/handcash-sdk';

interface TransactionHistoryProps {
  transactions: Types.PaymentResult[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Fiat Equivalent</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Participant</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Time</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isReceive = tx.type.toLowerCase() === 'receive' || tx.type.toLowerCase() === 'incoming';
                const participantAlias = tx.participants[0]?.alias || 'N/A';
                const amount = `${tx.units.toFixed(3)} ${tx.currency.code}`;
                const fiatEquivalent = `${tx.fiatEquivalent.units} ${tx.fiatEquivalent.currencyCode}`;
                const time = new Date(tx.time * 1000).toLocaleString();
                const transactionId = tx.transactionId;
                return (
                  <tr key={transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {isReceive ? (
                          <ArrowDownIcon className="w-5 h-5 mr-2 text-green-500" />
                        ) : (
                          <ArrowUpIcon className="w-5 h-5 mr-2 text-red-500" />
                        )}
                        <span className="capitalize">{isReceive ? 'Receive' : 'Send'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono">{amount}</td>
                    <td className="py-4 px-4 font-mono">{fiatEquivalent}</td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">
                        {participantAlias.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{time}</td>
                    <td className="py-4 px-4">
                      <Link href={`https://whatsonchain.com/tx/${transactionId}`} passHref>
                          {transactionId.slice(0, 8)}...
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
