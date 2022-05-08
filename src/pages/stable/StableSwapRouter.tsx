import React from 'react';
import { useParams } from 'react-router-dom';
import { usePool } from '../../state/pool';
import { Loading } from '../../components/icon/Loading';
import StableSwapPage from './StableSwapPage';
import { StableSwapPageEntry } from './StableSwapEntry';
import StableSwapPageUSN from './StableSwapPageUSN';

interface ParamTypes {
  id: string;
}
export const StableSwapRouter = () => {
  const { id } = useParams<ParamTypes>();
  const { pool } = usePool(id);

  if (!pool) return <Loading />;

  if (pool.tokenIds.length > 2) return <StableSwapPage pool={pool} />;
  else return <StableSwapPageUSN pool={pool} />;
};
