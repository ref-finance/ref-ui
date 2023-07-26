import React, { useEffect, useState } from 'react';
import { nearMetadata, getFTmetadata, ftGetBalance } from '../../near';
import { toReadableNumber } from '../../orderly/utils';
import { Holding, TokenInfo, TokenMetadata } from '../../orderly/type';
import { getCurrentHolding } from '../../orderly/off-chain-api';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import Big from 'big.js';
import { usePerpData } from '../UserBoardPerp/state';

export function useTokenBalance(tokenId: string | undefined, deps?: any) {
  const [tokenMeta, setTokenMeta] = useState<TokenMetadata>();
  const [walletBalance, setWalletBalance] = useState<string>('');

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!tokenId) return;

    getFTmetadata(tokenId).then((meta) => {
      setTokenMeta(meta);
    });
  }, [tokenId, deps]);

  useEffect(() => {
    if (!tokenId || !accountId) return;

    getFTmetadata(tokenId)
      .then((meta) => {
        return meta;
      })
      .then((tokenMeta) => {
        ftGetBalance(tokenMeta?.id).then((balance) => {
          setWalletBalance(toReadableNumber(tokenMeta.decimals, balance));
        });
      });
  }, [tokenId, tokenMeta?.id, deps, accountId]);

  return !tokenMeta || !tokenId ? '0' : walletBalance;
}

interface TokenWithDecimals {
  id: string;
  decimals: number;
}

interface BalanceType {
  meta: TokenMetadata;
  holding: number;
  wallet_balance: string;
  id: string;
  name: string;
  'in-order': number;
}

export function useTokensBalances(
  tokens: TokenWithDecimals[] | undefined,
  tokenInfo: TokenInfo[] | undefined,
  trigger: any,
  freeCollateral: string
) {
  const [showbalances, setShowBalances] = useState<BalanceType[]>([]);

  const { accountId } = useWalletSelector();

  const { myPendingOrdersRefreshing, validAccountSig } = useOrderlyContext();

  const getBalanceAndMeta = async (token: TokenWithDecimals) => {
    const balance = await ftGetBalance(token.id).then((balance) => {
      return toReadableNumber(token.decimals, balance);
    });

    const meta = await getFTmetadata(token.id);

    return {
      balance,
      meta,
    };
  };

  useEffect(() => {
    if (!tokens || !tokenInfo || !accountId || !validAccountSig) return;

    Promise.all(
      tokenInfo.map((t) =>
        getBalanceAndMeta({
          id: t.token_account_id,
          decimals: t.decimals,
        })
      )
    )
      .then((balances) => {
        const showbalances = balances.map((b, i) => {
          const wallet_balance = b.balance;

          return {
            meta: b.meta,
            wallet_balance,
            id: tokenInfo[i].token_account_id,
            name: tokenInfo[i].token,
          };
        });

        return showbalances;
      })
      .then(async (res) => {
        const response = await getCurrentHolding({ accountId });

        const holdings = response?.data?.holding as Holding[];

        const resMap = res.reduce(
          (acc, cur) => {
            const id = cur.id;

            const holding = holdings?.find(
              (h: Holding) => h.token === cur.name
            );
            const displayHolding = holding
              ? Number(
                  new Big(holding.holding + holding.pending_short).toFixed(
                    Math.min(8, cur.meta.decimals || 9),
                    0
                  )
                )
              : 0;

            acc[id] = {
              ...cur,
              holding: displayHolding,
              'in-order': holding?.pending_short || 0,
            };
            return acc;
          },
          {} as {
            [key: string]: BalanceType;
          }
        );

        setShowBalances(Object.values(resMap));
      });
  }, [
    tokens?.map((t) => t.id).join('|'),
    tokenInfo,
    accountId,
    trigger,
    myPendingOrdersRefreshing,
    validAccountSig,
  ]);

  if (showbalances.length > 0 && freeCollateral !== '-') {
    showbalances.forEach((sb) => {
      if (sb.name === 'USDC') {
        sb.holding = Number(freeCollateral);
      }
    });
  }

  return showbalances;
}

export function useTokensOrderlyBalances(
  tokens: TokenWithDecimals[] | undefined,
  tokenInfo: TokenInfo[] | undefined,
  trigger?: any
) {
  const [showbalances, setShowBalances] = useState<BalanceType[]>([]);

  const { accountId } = useWalletSelector();

  const { balances } = useOrderlyContext();
  console.log('balances: ', balances);

  const { freeCollateral, triggerBalanceBasedData } = usePerpData();

  const { myPendingOrdersRefreshing, validAccountSig } = useOrderlyContext();

  const getBalanceAndMeta = async (token: TokenWithDecimals) => {
    const balance = await ftGetBalance(token.id).then((balance) => {
      return toReadableNumber(token.decimals, balance);
    });

    const meta = await getFTmetadata(token.id);

    return {
      balance,
      meta,
    };
  };

  useEffect(() => {
    if (!tokens || !tokenInfo || !accountId || !validAccountSig) return;

    Promise.all(
      tokenInfo.map((t) =>
        getBalanceAndMeta({
          id: t.token_account_id,
          decimals: t.decimals,
        })
      )
    )
      .then((balances) => {
        const showbalances = balances.map((b, i) => {
          const wallet_balance = b.balance;

          return {
            meta: b.meta,
            wallet_balance,
            id: tokenInfo[i].token_account_id,
            name: tokenInfo[i].token,
          };
        });

        return showbalances;
      })
      .then(async (res) => {
        const response = await getCurrentHolding({ accountId });

        const holdings = response?.data?.holding as Holding[];

        const resMap = res.reduce(
          (acc, cur) => {
            const id = cur.id;

            const holding = holdings?.find(
              (h: Holding) => h.token === cur.name
            );
            const displayHolding = holding
              ? Number(
                  new Big(holding.holding + holding.pending_short).toFixed(
                    Math.min(8, cur.meta.decimals || 9),
                    0
                  )
                )
              : 0;

            acc[id] = {
              ...cur,
              holding: displayHolding,
              'in-order': holding?.pending_short || 0,
            };
            return acc;
          },
          {} as {
            [key: string]: BalanceType;
          }
        );

        setShowBalances(Object.values(resMap));
      });
  }, [
    tokens?.map((t) => t.id).join('|'),
    tokenInfo,
    accountId,
    trigger,
    myPendingOrdersRefreshing,
    validAccountSig,
    triggerBalanceBasedData,
  ]);

  if (showbalances.length > 0 && freeCollateral !== '-') {
    showbalances.forEach((sb) => {
      if (sb.name === 'USDC') {
        sb.holding = Number(freeCollateral);
      }
    });
  }

  if (balances) {
    showbalances.forEach((sb) => {
      const curBalance = balances[sb.name];

      if (curBalance && sb.name !== 'USDC') {
        sb.holding = Number(
          new Big(curBalance.holding + curBalance.pendingShortQty).toFixed(
            Math.min(8, sb.meta.decimals || 9),
            0
          )
        );
      }
    });
  }

  return showbalances;
}
