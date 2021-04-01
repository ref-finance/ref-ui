import { useEffect, useState } from 'react';
import {
  getDepositableBalance,
  getWhitelistedTokens,
  getTokenBalances,
  getTokenMetadata,
  getUserRegisteredTokens,
  TokenBalancesView,
  TokenMetadata,
} from '~services/token';

export const useToken = (id: string) => {
  const [token, setToken] = useState<TokenMetadata>();

  useEffect(() => {
    getTokenMetadata(id).then(setToken);
  }, [id]);

  return token;
};

export const useTokens = (ids: string[] = []) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    Promise.all<TokenMetadata>(ids.map((id) => getTokenMetadata(id))).then(
      setTokens
    );
  }, [ids.join('')]);

  return tokens;
};

export const useWhitelistTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    getWhitelistedTokens()
      .then((tokenIds) =>
        Promise.all(tokenIds.map((tokenId) => getTokenMetadata(tokenId)))
      )
      .then(setTokens);
  }, []);

  return tokens;
};

export const useUserRegisteredTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    getUserRegisteredTokens()
      .then((tokenIds) =>
        Promise.all(tokenIds.map((tokenId) => getTokenMetadata(tokenId)))
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
    if (tokenId) getDepositableBalance(tokenId).then(setDepositable);
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
