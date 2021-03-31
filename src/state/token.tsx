import { useEffect, useState } from 'react';
import { getTokenMetadata, TokenMetadata } from '~services/token';

export const useToken = (id: string) => {
  const [token, setToken] = useState<TokenMetadata>();

  useEffect(() => {
    getTokenMetadata(id).then(setToken);
  }, [id]);

  return token;
};

export const useTokens = (ids: string[]) => {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    Promise.all<TokenMetadata>(ids.map((id) => getTokenMetadata(id))).then(
      setTokens
    );
  }, [ids]);

  return tokens;
};
