import { useEffect, useState } from 'react';
import metadata from 'src/utils/metadata';
import { AdboardState, getAdboardState } from '../services/adboard';
import { wallet } from '../services/near';
import { getCurrentWallet } from '../utils/wallets-integration';

export const useAdboardState = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [adboardState, setAdboardState] = useState<AdboardState>();

  useEffect(() => {
    getAdboardState()
      .then(setAdboardState)
      .finally(() => setLoading(false));
  }, []);

  const ownedFrames = adboardState?.metadata.filter(
    (metadata) => metadata.owner === getCurrentWallet()?.wallet?.getAccountId()
  );

  const isOwnFrame = (owner: string) => {
    return owner === getCurrentWallet()?.wallet?.getAccountId();
  };

  return {
    ...adboardState,
    loading,
    ownedFrames,
    isOwnFrame,
  };
};
