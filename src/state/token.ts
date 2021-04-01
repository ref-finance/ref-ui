import { useEffect, useState } from 'react';
import {
  getDepositableBalance,
  getRegisteredTokens,
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

export const useRegisteredTokens = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    getRegisteredTokens()
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
    getTokenBalances().then(setBalances);
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

export const useGetUnregisteredTokens = () => {
  const [unregisteredTokens, setUnregisteredTokens] = useState([]);

  useEffect(() => {
    Promise.all([getRegisteredTokens(), getUserRegisteredTokens()])
      .then((results) => {
        return results[0].filter((item) => !results[1].includes(item));
      })
      .then(setUnregisteredTokens);
  }, []);
  return unregisteredTokens;
};
