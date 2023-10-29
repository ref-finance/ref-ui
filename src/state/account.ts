import { useEffect, useRef, useState } from 'react';
import { AccountStorageView, currentStorageBalance } from '../services/account';
import { wallet } from '../services/near';
import { currentRefPrice } from 'src/services/api';
import { useMobile } from 'src/utils/device';
import { getCurrentWallet } from '../utils/wallets-integration';

const REFRESH_TIME = 60 * 1000;

export const useCurrentStorageBalance = () => {
  const [storageBalance, setStorageBalance] = useState<AccountStorageView>();
  useEffect(() => {
    currentStorageBalance(getCurrentWallet()?.wallet?.getAccountId())
      .then(setStorageBalance)
      .catch(() => setStorageBalance(null));
  }, [getCurrentWallet()?.wallet?.getAccountId()]);
  return storageBalance;
};

export const useRefPrice = (position?: 'MobileNav' | 'Footer') => {
  const timer = useRef(null);
  const [data, setData] = useState<string>();

  const mobileWindow = useMobile();

  const callback = () =>
    currentRefPrice().then((res) => {
      res && setData(res);
    });

  useEffect(() => {
    mobileWindow && callback();
    !mobileWindow && callback();

    timer.current = setInterval(callback, REFRESH_TIME);

    return () => {
      clearInterval(timer.current);
    };
  }, [mobileWindow]);

  return { data };
};
