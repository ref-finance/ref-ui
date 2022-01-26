import { useCallback, useEffect, useRef, useState } from 'react';
import { STABLE_TOKEN_IDS, wallet } from '../services/near';
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
  getWhitelistedTokensAndNearTokens,
} from '../services/token';
import {
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '../utils/numbers';
import { toRealSymbol } from '../utils/token';
import getConfig from '~services/config';
import { nearMetadata } from '../services/wrap-near';

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

export const useWhitelistStableTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();
  useEffect(() => {
    getWhitelistedTokens()
      .then((tokenIds) => {
        const allTokenIds = STABLE_TOKEN_IDS;
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
export const useUserRegisteredTokensAllAndNearBalance = () => {
  const [tokens, setTokens] = useState<any[]>();

  useEffect(() => {
    getWhitelistedTokensAndNearTokens()
      .then((tokenList) => {
        const walletBalancePromise = Promise.all(
          [nearMetadata.id, ...tokenList].map((tokenId) => {
            return getDepositableBalance(tokenId);
          })
        );
        const tokenMetadataPromise = Promise.all(
          tokenList.map((tokenId) => ftGetTokenMetadata(tokenId))
        );
        return Promise.all([tokenMetadataPromise, walletBalancePromise]);
      })
      .then((result) => {
        const arr = result[0];
        arr.unshift(nearMetadata);
        arr.forEach((token, index) => {
          token.near = result[1][index];
          token.nearNonVisible = result[1][index];
        });
        setTokens(arr);
      });
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

export const useWalletTokenBalances = (tokenIds: string[] = []) => {
  const [balances, setBalances] = useState<TokenBalancesView>();

  useEffect(() => {
    Promise.all<string>(tokenIds.map((id) => ftGetBalance(id))).then((res) => {
      let balances = {};
      res.map((item, index) => {
        const tokenId: string = tokenIds[index];
        balances[tokenId] = item;
      });
      setBalances(balances);
    });
  }, [tokenIds.join('')]);

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

export const useDepositableBalance = (
  tokenId: string,
  decimals?: number,
  dependabale?: boolean
) => {
  const [depositable, setDepositable] = useState<string>('');
  const [max, setMax] = useState<string>('');
  useEffect(() => {
    if (wallet.isSignedIn()) {
      if (tokenId === 'NEAR') {
        wallet
          .account()
          .getAccountBalance()
          .then(({ available }) => setDepositable(available));
      } else if (tokenId) {
        ftGetBalance(tokenId).then(setDepositable);
      }
    } else {
      setDepositable('0');
    }
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
