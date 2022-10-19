import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { usePool } from '../../state/pool';
import { Loading } from '../../components/icon/Loading';
import StableSwapPage from './StableSwapPage';
import { StableSwapPageEntry } from './StableSwapEntry';
import StableSwapPageUSN from './StableSwapPageUSN';
import { NEARX_POOL_ID } from '~services/near';

interface ParamTypes {
  id: string;
}
export const StableSwapRouter = () => {
  const { id } = useParams<ParamTypes>();
  const { pool } = usePool(id);

  const history = useHistory();

  if (id === NEARX_POOL_ID) {
    history.push('/');
  }

  if (!pool) return <Loading />;

  if (pool.tokenIds.length > 2) return <StableSwapPage pool={pool} />;
  else return <StableSwapPageUSN pool={pool} />;
};
