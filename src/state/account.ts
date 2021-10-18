import { useEffect, useState } from 'react';
import {
  AccountStorageView,
  currentRefPrice,
  currentStorageBalance,
  RefPrice,
} from '../services/account';
import { wallet } from '../services/near';

export const useCurrentStorageBalance = () => {
  const [storageBalance, setStorageBalance] = useState<AccountStorageView>();
  useEffect(() => {
    currentStorageBalance(wallet.getAccountId())
      .then(setStorageBalance)
      .catch(() => setStorageBalance(null));
  }, [wallet.getAccountId()]);
  return storageBalance;
};

export const useRefPrice = () => {
  const [data, setData] = useState<RefPrice>();
  useEffect(() => {
    currentRefPrice().then((res) => {
      res && setData(res);
    });
  }, []);
  return { data };
};
