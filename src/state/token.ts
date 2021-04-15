import { useEffect, useState } from 'react';
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

export const useWhitelistTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    getWhitelistedTokens()
      .then((tokenIds) =>
        Promise.all(tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId)))
      )
      .then(setTokens);
  }, []);

  return tokens;
};

export const useUserRegisteredTokens = (accountId?: string) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    getUserRegisteredTokens(accountId)
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
    if (tokenId) ftGetBalance(tokenId).then(setDepositable);
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
