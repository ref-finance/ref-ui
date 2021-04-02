import { useEffect, useState } from 'react';
import { AccountStorageView, currentStorageBalance } from '~services/account';
import { wallet } from '~services/near';

export const useCurrentStorageBalance = () => {
  const [storageBalance, setStorageBalance] = useState<AccountStorageView>();
  useEffect(() => {
    currentStorageBalance(wallet.getAccountId()).then(setStorageBalance);
  }, [wallet.getAccountId()]);
  return storageBalance;
};
