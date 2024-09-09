import React from 'react';
import QRCode from 'react-qr-code';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';

export type DepositInfo = {
  id: string;
  alias: string;
  paymail: string;
  base58Address: string;
};

interface DepositInfoProps {
  depositInfo: DepositInfo;
}

export function DepositInfo({ depositInfo }: DepositInfoProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Deposit Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">ID</TableCell>
              <TableCell>{depositInfo.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Alias</TableCell>
              <TableCell>{depositInfo.alias}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Paymail</TableCell>
              <TableCell className="flex items-center justify-between">
                {depositInfo.paymail}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(depositInfo.paymail)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Base58 Address</TableCell>
              <TableCell className="flex items-center justify-between">
                <span className="truncate max-w-[200px]">{depositInfo.base58Address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(depositInfo.base58Address)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex flex-col items-center space-y-4">
          <QRCode value={depositInfo.base58Address} size={100} />
        </div>
      </CardContent>
    </Card>
  );
}