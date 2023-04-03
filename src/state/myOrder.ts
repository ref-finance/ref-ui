import React, { useEffect, useState } from 'react';
import { useWalletSelector } from '../context/WalletSelectorContext';
import {
  getHistoryOrder,
  OrderTxType,
  HistoryOrderSwapInfo,
  getHistoryOrderSwapInfo,
} from '../services/indexer';

export const useHistoryOrderTx = () => {
  const { accountId } = useWalletSelector();

  const [txIds, setTxIds] = useState<OrderTxType[] | null>(null);

  useEffect(() => {
    if (!accountId) return;

    getHistoryOrder(accountId).then((res) => {
      //@ts-ignore

      setTxIds(res?.data === null ? [] : res);
    });
  }, [accountId]);

  return txIds;
};

export const useHistoryOrderSwapInfo = ({
  start_at,
  end_at,
}: {
  start_at: number;
  end_at: number;
}) => {
  const { accountId } = useWalletSelector();

  const [swapInfo, setSwapInfo] = useState<HistoryOrderSwapInfo[] | null>([]);

  useEffect(() => {
    if (!accountId) return;

    getHistoryOrderSwapInfo(accountId).then((res) => {
      //@ts-ignore
      setSwapInfo(res?.data === null ? [] : res);
    });
  }, [accountId]);

  return (
    swapInfo?.filter(
      (s) => Number(s.timestamp) >= start_at && Number(s.timestamp) <= end_at
    ) || []
  );
};
