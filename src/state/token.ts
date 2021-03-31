import { useEffect, useState } from 'react';
import {
  getRegisteredTokens,
  getTokenBalances,
  getTokenMetadata,
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
  const [tokens, setTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    getRegisteredTokens()
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
