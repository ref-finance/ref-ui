import React, { useEffect, useState } from 'react';
import { useWalletSelector } from '../context/WalletSelectorContext';
import { getHistoryOrder, OrderTxType } from '../services/indexer';

export const useHistoryOrderTx = () => {
  const { accountId } = useWalletSelector();

  const [txIds, setTxIds] = useState<OrderTxType[] | null>(null);

  useEffect(() => {
    if (!accountId) return;

    getHistoryOrder(accountId).then((res) => {
      setTxIds(res);
    });
  }, [accountId]);

  return txIds;
};
