import React, { useEffect, useState } from 'react';
import { get_account } from '../services/lp-locker';
import getConfig from '../services/config';

export function useLpLocker(mftId) {
  const [balance, setBalance] = useState('0');
  useEffect(() => {
    getBalance();
  }, [mftId]);
  async function getBalance() {
    const locked = await get_account();
    let balance = '0';
    if (locked) {
      balance =
        locked.locked_tokens[`${getConfig().REF_FI_CONTRACT_ID}@${mftId}`]
          ?.locked_balance || '0';
      setBalance(balance);
    }
  }
  return balance;
}
