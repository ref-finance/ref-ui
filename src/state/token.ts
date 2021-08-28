import { useEffect, useState } from 'react';
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
import { toReadableNumber } from '~utils/numbers';

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
    getUserRegisteredTokens()
      .then((tokenIds) =>
        Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
      )
      .then(setTokens);
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

export const useDepositableBalance = (tokenId: string) => {
  const [depositable, setDepositable] = useState<string>('');

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

  return depositable;
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
    : `≈ ${(Number(second_token_num) / Number(first_token_num)).toFixed(4)} ${
        tokens[1].symbol
      }`;
};
