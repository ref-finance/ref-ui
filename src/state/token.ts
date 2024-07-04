import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useContext,
  createContext,
} from 'react';

import {
  STABLE_TOKEN_IDS,
  wallet,
  STABLE_TOKEN_USN_IDS,
} from '../services/near';
import {
  ftGetBalance,
  ftGetTokenMetadata,
  TokenMetadata,
} from '../services/ft-contract';
import {
  getWhitelistedTokens,
  getWhitelistedTokensInfo,
  getTokenBalances,
  getUserRegisteredTokens,
  TokenBalancesView,
  getWhitelistedTokensAndNearTokens,
  getGlobalWhitelist,
} from '../services/token';
import {
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '../utils/numbers';
import { toRealSymbol } from '../utils/token';
import getConfig from '../services/config';
import { nearMetadata, WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import { Pool } from '../services/pool';
import {
  getBatchTokenNearAcounts,
  getTriTokenIdsOnRef,
  useTriTokenIdsOnRef,
} from '../services/aurora/aurora';
import { AllStableTokenIds, getAccountNearBalance } from '../services/near';
import { defaultTokenList, getAuroraConfig } from '../services/aurora/config';
import { getTokenPriceList, getTokens } from '../services/indexer';
import { useWalletSelector } from '../context/WalletSelectorContext';
import { WalletContext, getCurrentWallet } from '../utils/wallets-integration';
import db from '../store/RefDatabase';
import { get_auto_whitelisted_postfix } from '../services/token';

export const useToken = (id: string) => {
  const [token, setToken] = useState<TokenMetadata>();

  useEffect(() => {
    ftGetTokenMetadata(id).then(setToken);
  }, [id]);

  return token;
};

export const usePoolTokens = (pools: Pool[]) => {
  const [poolTokens, setPoolTokens] = useState({});
  useEffect(() => {
    if (!pools.length) return;
    getPoolTokens(pools);
  }, [pools]);
  async function getPoolTokens(pools) {
    const copyPools = JSON.parse(JSON.stringify(pools || []));
    const allRequest = copyPools.map(async (p) => {
      return await Promise.all(
        p.tokenIds.map((id) => {
          return ftGetTokenMetadata(id);
        })
      );
    });
    const result = await Promise.all(allRequest);
    const last = result.reduce((pre, cur, i) => {
      return {
        ...pre,
        [copyPools[i].id]: cur,
      };
    }, {});
    setPoolTokens(last);
  }
  return poolTokens;
};

export const useTokens = (ids: string[] = [], curTokens?: TokenMetadata[]) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    if (curTokens?.length > 0) {
      setTokens(curTokens);
      return;
    }
    Promise.all<TokenMetadata>(ids.map((id) => ftGetTokenMetadata(id))).then(
      setTokens
    );
  }, [ids.join('')]);

  return tokens;
};

export const useTriTokens = (stopOn?: boolean) => {
  const [triTokens, setTriTokens] = useState<TokenMetadata[]>();
  const auroraTokens = defaultTokenList.tokens;
  const allSupportPairs = getAuroraConfig().Pairs;
  const symbolToAddress = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});

  const tokenIds = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split('-');
      return names.map((n) => {
        if (n === 'ETH') return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      });
    })
    .flat();
  useEffect(() => {
    if (stopOn) return;
    getBatchTokenNearAcounts(tokenIds).then((res) => {
      const allIds = res.concat(['aurora']);

      return Promise.all(
        allIds.map((addr: string) =>
          ftGetTokenMetadata(addr).then((ftmeta) => ({
            ...ftmeta,
            onTri: true,
          }))
        )
      ).then(setTriTokens);
    });
  }, [stopOn]);
  return !!stopOn ? [] : triTokens?.filter((token) => token.id);
};

export const useRainbowWhitelistTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();
  const triTokenIds = useTriTokenIdsOnRef();

  const extraTokenIds = (triTokenIds || []).concat(['aurora']);

  useEffect(() => {
    getWhitelistedTokens()
      .then((tokenIds) => {
        const allTokenIds = [...new Set([...tokenIds, ...extraTokenIds])];
        return Promise.all(
          allTokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
        );
      })
      .then(setTokens);
  }, [getCurrentWallet()?.wallet?.isSignedIn(), extraTokenIds.join('-')]);

  return tokens?.map((t) => ({ ...t, onRef: true }));
};

export const useWhitelistTokens = (extraTokenIds: string[] = []) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();
  useEffect(() => {
    getWhitelistedTokensInfo()
      .then(async (tokenInfo) => {
        const { globalWhitelist, userWhitelist } = tokenInfo;
        const allWhiteTokenIds = [
          ...new Set([...globalWhitelist, ...userWhitelist, ...extraTokenIds]),
        ];
        const allTokens = await getAllTokens();
        const postfix = await get_auto_whitelisted_postfix();
        // for tknx
        postfix.push('.tknx');
        postfix.push('.tkns');
        const whiteMetaDataList = await Promise.all(
          allWhiteTokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
        );
        const globalMetaDataWhitelist = whiteMetaDataList.filter((m) =>
          globalWhitelist.includes(m.id)
        );
        const whiteMap = whiteMetaDataList.reduce(
          (sum, cur) => ({ ...sum, ...{ [cur.id]: cur } }),
          {}
        );
        allTokens
          .filter((token: TokenMetadata) => {
            return (
              postfix.some((p) => token.id.includes(p)) &&
              !globalMetaDataWhitelist.find((w) => w.id === token.id)
            );
          })
          .map((token) => {
            token.isRisk = true;
            token.isUserToken = !!userWhitelist.includes(token.id);
            whiteMap[token.id] = token;
            return token;
          });
        return Object.values(whiteMap) as TokenMetadata[];
      })
      .then(setTokens);
  }, [getCurrentWallet()?.wallet?.isSignedIn(), extraTokenIds.join('-')]);
  return tokens?.map((t) => ({ ...t, onRef: true }));
};
async function getAllTokens() {
  let allTokens = (await db.queryAllTokens()) || [];
  if (!allTokens.length) {
    const tokens = await getTokens();
    allTokens = Object.keys(tokens).reduce((acc, id) => {
      acc.push({
        id,
        ...tokens[id],
      });
      return acc;
    }, []);
  }
  return allTokens;
}
export const useRiskTokens = () => {
  const tokens = useWhitelistTokens();
  const allRiskTokens = useMemo(() => {
    return tokens?.filter((token) => token.isRisk);
  }, [tokens]);
  return allRiskTokens || [];
};
export const useGlobalWhitelistTokens = (extraTokenIds: string[] = []) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();
  useEffect(() => {
    getGlobalWhitelist()
      .then((tokenIds) => {
        const allTokenIds = [...new Set([...tokenIds, ...extraTokenIds])];
        return Promise.all(
          allTokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
        );
      })
      .then(setTokens);
  }, [getCurrentWallet()?.wallet?.isSignedIn(), extraTokenIds.join('-')]);

  return tokens?.map((t) => ({ ...t, onRef: true }));
};

export const useBTCTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    Promise.all(getConfig().BTCIDS.map((id) => ftGetTokenMetadata(id))).then(
      setTokens
    );
  }, []);

  return tokens;
};

export const useWhitelistStableTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    Promise.all(
      AllStableTokenIds.map((tokenId) => ftGetTokenMetadata(tokenId))
    ).then(setTokens);
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
      .then(async (tokenList) => {
        const triTokenIds = await getTriTokenIdsOnRef();

        const newList = [...new Set((triTokenIds || []).concat(tokenList))];

        const walletBalancePromise = Promise.all(
          [nearMetadata.id, ...newList].map((tokenId) => {
            return getDepositableBalance(tokenId);
          })
        );
        const tokenMetadataPromise = Promise.all(
          newList.map((tokenId) => ftGetTokenMetadata(tokenId, true))
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
  const { accountId } = useWalletSelector();

  const isSignedIn = !!accountId;

  useEffect(() => {
    if (!isSignedIn) return;
    getTokenBalances()
      .then(setBalances)
      .catch(() => setBalances({}));
  }, [isSignedIn, accountId]);

  return balances;
};

export const useWalletTokenBalances = (tokenIds: string[] = []) => {
  const [balances, setBalances] = useState<TokenBalancesView>();

  const near = useDepositableBalance('NEAR');

  useEffect(() => {
    if (tokenIds.some((id) => !id)) return;

    Promise.all<string>(tokenIds.map((id) => ftGetBalance(id))).then((res) => {
      const balances = {};
      res.map((item, index) => {
        const tokenId: string = tokenIds[index];
        balances[tokenId] = item;
        if (tokenId === WRAP_NEAR_CONTRACT_ID) {
          balances[tokenId] = near;
        }
      });
      setBalances(balances);
    });
  }, [tokenIds.join(''), near]);

  return balances;
};

export const getDepositableBalance = async (
  tokenId: string,
  decimals?: number
) => {
  if (tokenId === 'NEAR') {
    if (getCurrentWallet()?.wallet?.isSignedIn()) {
      return getAccountNearBalance(
        getCurrentWallet().wallet.getAccountId()
      ).then(({ available }: any) => {
        return toReadableNumber(decimals, available);
      });
    } else {
      return toReadableNumber(decimals, '0');
    }
  } else if (tokenId) {
    return ftGetBalance(tokenId)
      .then((res: string) => {
        return toReadableNumber(decimals, res);
      })
      .catch((res: any) => '0');
  } else {
    return '';
  }
};

export const useTokenPriceList = (dep?: any) => {
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});

  const [tokenListTrigger, setTokenListTrigger] = useState<boolean>(false);

  useEffect(() => {
    if (dep) {
      setTokenListTrigger(!tokenListTrigger);
    }
  }, [dep]);

  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
  }, [tokenListTrigger]);

  if (Object.keys(tokenPriceList).length > 0) {
    tokenPriceList.NEAR = tokenPriceList?.[WRAP_NEAR_CONTRACT_ID];
  }

  return tokenPriceList;
};

export const useTokensData = (
  tokens: TokenMetadata[],
  balances?: TokenBalancesView,
  visible?: boolean
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

  const { accountId } = useWalletSelector();

  const trigger = useCallback(() => {
    setCount(0);
    setResult([]);
    const currentFetchId = fetchIdRef.current;
    for (let i = 0; i < tokens.length; i++) {
      const index = i;
      const item = tokens[index];
      getDepositableBalance(
        item.id === WRAP_NEAR_CONTRACT_ID && item.symbol == 'NEAR'
          ? 'NEAR'
          : item.id,
        item.decimals
      )
        .then((max: string) => {
          if (currentFetchId !== fetchIdRef.current) {
            throw new Error();
          }
          return max;
        })
        .then((max: string) => {
          const nearCount = !!accountId ? toPrecision(max, 3) || '0' : '0';
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
        .catch((err) => {});
    }
  }, [tokens?.length]);

  useEffect(() => {
    if (visible && tokens?.length > 0) {
      trigger();
    }
  }, [tokens?.map((t) => t.id).join('-'), visible]);
  return {
    trigger,
    loading: count < tokens?.length,
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

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const { wallet } = getCurrentWallet();

  useEffect(() => {
    if (isSignedIn && wallet) {
      if (tokenId === 'NEAR') {
        getAccountNearBalance(getCurrentWallet().wallet.getAccountId()).then(
          ({ available }: any) => setDepositable(available)
        );
      } else if (tokenId) {
        ftGetBalance(tokenId).then(setDepositable);
      }
    } else {
      setDepositable('0');
    }
  }, [tokenId, isSignedIn, wallet]);

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
