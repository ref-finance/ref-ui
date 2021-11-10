import { useEffect, useRef, useState } from 'react';
import { AccountStorageView, currentStorageBalance } from '../services/account';
import { wallet } from '../services/near';
import { currentRefPrice } from '~services/api';

const REFRESH_TIME = 60 * 1000;

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
  const timer = useRef(null);
  const [data, setData] = useState<string>();

  const callback = () =>
    currentRefPrice().then((res) => {
      res && setData(res);
    });

  useEffect(() => {
    callback();

    timer.current = setInterval(callback, REFRESH_TIME);

    return () => {
      clearInterval(timer.current);
    };
  }, []);

  return { data };
};
