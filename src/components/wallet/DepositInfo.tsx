'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/app/context/WalletContext';
import {
  CopyIcon,
  ExternalLinkIcon,
  MailIcon,
  UserIcon,
  WalletIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import TopUpDialog from '@/components/wallet/TopUpDialog';

export function DepositInfo({ depositLink }: { depositLink: string }) {
  const { depositInfo } = useWallet();

  if (!depositInfo) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <WalletIcon className="mr-2" />
          Deposit Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <InfoItem
            icon={<UserIcon size={18} />}
            label="Alias"
            value={depositInfo.alias}
          />
          <InfoItem
            icon={<MailIcon size={18} />}
            label="Paymail"
            value={depositInfo.paymail}
          />
          <InfoItem
            icon={<WalletIcon size={18} />}
            label="Address"
            value={depositInfo.base58Address}
          />
        </div>
        <div className="flex flex-col space-y-2 mt-4">
          {depositLink && (
            <Button
              className="w-full"
              onClick={() => window.open(depositLink, '_blank')}
              variant="default"
              size="sm"
            >
              Deposit $1 with HandCash
              <ExternalLinkIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
          {/* Top-Up Wallet Option */}
          <TopUpDialog
            trigger={
              <Button
                className="w-full"
                variant="secondary"
                size="sm"
              >
                Top-up Wallet With Crypto or Credit Card
              </Button>
            }
            depositAddress={depositInfo.base58Address}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast.success(`${label} has been copied to your clipboard.`);
      })
      .catch(() => {
        toast.error(`Failed to copy ${label}.`);
      });
  };

  return (
    <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium">{label}:</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm truncate max-w-[150px]">{value}</span>
        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
          <CopyIcon size={16} />
        </Button>
      </div>
    </div>
  );
}
