import { useEffect, useState } from 'react';
import metadata from '~utils/metadata';
import { AdboardState, getAdboardState } from '../services/adboard';
import { wallet } from '../services/near';

export const useAdboardState = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [adboardState, setAdboardState] = useState<AdboardState>();

  useEffect(() => {
    getAdboardState()
      .then(setAdboardState)
      .finally(() => setLoading(false));
  }, []);

  const ownedFrames = adboardState?.metadata.filter(
    (metadata) => metadata.owner === wallet.getAccountId()
  );

  const isOwnFrame = (owner: string) => {
    return owner === wallet.getAccountId();
  };

  return {
    ...adboardState,
    loading,
    ownedFrames,
    isOwnFrame,
  };
};
