import { useCallback, useEffect, useRef, useState } from 'react';
import { wallet } from '../services/near';
import {
  ftGetBalance,
  ftGetTokenMetadata,
  TokenMetadata,
} from '../services/ft-contract';
import {
  getWhitelistedTokens,
  getTokenBalances,
  getUserRegisteredTokens,
  TokenBalancesView,
} from '../services/token';
import {
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';

export const useToken = (id: string) => {
  const [token, setToken] = useState<TokenMetadata>();

  useEffect(() => {
    ftGetTokenMetadata(id).then(setToken);
  }, [id]);

  return token;
};

export const useTokens = (ids: string[] = []) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    Promise.all<TokenMetadata>(ids.map((id) => ftGetTokenMetadata(id))).then(
      setTokens
    );
  }, [ids.join('')]);

  return tokens;
};

export const useWhitelistTokens = (extraTokenIds: string[] = []) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    getWhitelistedTokens()
      .then((tokenIds) => {
        const allTokenIds = [...new Set([...tokenIds, ...extraTokenIds])];
        return Promise.all(
          allTokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
        );
      })
      .then(setTokens);
  }, []);

  return tokens;
};

export const useUserRegisteredTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    if (wallet.isSignedIn()) {
      getUserRegisteredTokens()
        .then((tokenIds) =>
          Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
        )
        .then(setTokens);
    }
  }, []);

  return tokens;
};

export const useTokenBalances = () => {
  const [balances, setBalances] = useState<TokenBalancesView>();

  useEffect(() => {
    getTokenBalances()
      .then(setBalances)
      .catch(() => setBalances({}));
  }, []);

  return balances;
};

export const getDepositableBalance = async (
  tokenId: string,
  decimals?: number
) => {
  if (tokenId === 'NEAR') {
    if (wallet.isSignedIn()) {
      return wallet
        .account()
        .getAccountBalance()
        .then(({ available }) => {
          return toReadableNumber(decimals, available);
        });
    } else {
      return toReadableNumber(decimals, '0');
    }
  } else if (tokenId) {
    return ftGetBalance(tokenId)
      .then((res) => {
        return toReadableNumber(decimals, res);
      })
      .catch((res) => '0');
  } else {
    return '';
  }
};

export const useTokensData = (
  tokens: TokenMetadata[],
  balances?: TokenBalancesView
) => {
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<TokenMetadata[]>([]);
  const fetchIdRef = useRef(0);
  const setResultAtIndex = (data: TokenMetadata, index: number) => {
    setResult((oldResults) => {
      const newResults = [...oldResults];
      newResults[index] = data;
      return newResults;
    });
    setCount((c) => c + 1);
  };

  const trigger = useCallback(() => {
    if (!!balances) {
      setCount(0);
      setResult([]);
      const currentFetchId = fetchIdRef.current;
      for (let i = 0; i < tokens.length; i++) {
        const index = i;
        const item = tokens[index];
        getDepositableBalance(item.id, item.decimals)
          .then((max: string) => {
            if (currentFetchId !== fetchIdRef.current) {
              throw new Error();
            }
            return max;
          })
          .then((max: string) => {
            const nearCount = toPrecision(max, 3) || '0';
            const refCount = toRoundedReadableNumber({
              decimals: item.decimals,
              number: balances ? balances[item.id] : '0',
            });
            return {
              ...item,
              asset: toRealSymbol(item.symbol),
              near: Number(nearCount.replace(/[\,]+/g, '')),
              ref: Number(toPrecision(refCount, 3).replace(/[\,]+/g, '')),
              total:
                Number(nearCount.replace(/[\,]+/g, '')) +
                Number(toPrecision(refCount, 3).replace(/[\,]+/g, '')),
            };
          })
          .then((d: TokenMetadata) => setResultAtIndex(d, index))
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [balances]);

  useEffect(() => {
    trigger();
  }, [tokens, tokens.length]);

  return {
    trigger,
    loading: count < tokens.length,
    tokensData: result,
  };
};

export const useDepositableBalance = (tokenId: string, decimals?: number) => {
  const [depositable, setDepositable] = useState<string>('');
  const [max, setMax] = useState<string>('');
  useEffect(() => {
    if (tokenId === 'NEAR') {
      if (wallet.isSignedIn()) {
        wallet
          .account()
          .getAccountBalance()
          .then(({ available }) => setDepositable(available));
      } else {
        setDepositable('0');
      }
    } else if (tokenId) ftGetBalance(tokenId).then(setDepositable);
  }, [tokenId]);

  useEffect(() => {
    const max = toReadableNumber(decimals, depositable) || '0';
    setMax(max);
  }, [depositable]);

  return max;
};

export const useUnregisteredTokens = () => {
  const [unregisteredTokenIds, setUnregisteredTokenIds] = useState<string[]>(
    []
  );
  const tokens = useTokens(unregisteredTokenIds);

  useEffect(() => {
    Promise.all([getWhitelistedTokens(), getUserRegisteredTokens()])
      .then(([globalTokens, userTokens]) => {
        return globalTokens.filter((token) => !userTokens.includes(token));
      })
      .then(setUnregisteredTokenIds);
  }, []);

  return tokens;
};

export const getExchangeRate = (
  tokens: any,
  pool: any,
  first_token_price: any,
  use_api_price: boolean
) => {
  const first_token_num = toReadableNumber(
    tokens[0].decimals || 24,
    pool.supplies[tokens[0].id]
  );
  const second_token_num = toReadableNumber(
    tokens[1].decimals || 24,
    pool.supplies[tokens[1].id]
  );

  return use_api_price
    ? first_token_price === 'N/A'
      ? 'N/A'
      : Number(first_token_num) === 0
      ? 'N/A'
      : `≈$${(
          (Number(second_token_num) / Number(first_token_num)) *
          first_token_price
        ).toFixed(8)}`
    : Number(first_token_num) === 0
    ? 'N/A'
    : `≈ ${(Number(second_token_num) / Number(first_token_num)).toFixed(2)} ${
        tokens[1].symbol
      }`;
};
