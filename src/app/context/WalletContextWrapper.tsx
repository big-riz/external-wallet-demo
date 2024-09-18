import { WalletProvider } from '@/app/context/WalletContext';
import { getUserBalances } from '@/app/actions/wallet/getUserBalances';
import { getWalletDepositInfo } from '@/app/actions/wallet/getWalletDepositInfo';
import { Types } from '@handcash/handcash-sdk';

interface WalletInfo {
  isWalletConnected: boolean;
  depositInfo: Types.DepositInfo | undefined;
  balances: Types.UserBalance[];
}

async function fetchWalletInfo(): Promise<WalletInfo> {
  try {
    const depositInfoResult = await getWalletDepositInfo();
    
    if ('error' in depositInfoResult) {
      return {
        isWalletConnected: false,
        depositInfo: undefined,
        balances: [],
      };
    }

    const depositInfo = depositInfoResult as Types.DepositInfo;
    const balances = await getUserBalances();
    
    return {
      isWalletConnected: true,
      depositInfo,
      balances: Array.isArray(balances) ? balances : [],
    };
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    return {
      isWalletConnected: false,
      depositInfo: undefined,
      balances: [],
    };
  }
}

export default async function WalletWrapper({ children }: { children: React.ReactNode }) {
  const initialData = await fetchWalletInfo();

  return (
    <WalletProvider 
      initialWalletInfo={initialData}
      refreshBalancesActionName="getUserBalances"
      getAllInfoActionName="fetchWalletInfo"
    >
      {children}
    </WalletProvider>
  );
}