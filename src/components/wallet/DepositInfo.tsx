import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import QRCode from 'react-qr-code';

interface DepositInfoProps {
  depositInfo: {
    id: string;
    alias: string;
    paymail: string;
    base58Address: string;
  };
}

export function DepositInfo({ depositInfo }: DepositInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p>
            <span className="font-medium">Alias:</span> {depositInfo.alias}
          </p>
          <p>
            <span className="font-medium">Paymail:</span> {depositInfo.paymail}
          </p>
          <p>
            <span className="font-medium">Address:</span>{' '}
            {depositInfo.base58Address}
          </p>
        </div>
        <div className="flex justify-center">
          <QRCode value={depositInfo.base58Address} size={150} />
        </div>
      </CardContent>
    </Card>
  );
}
