import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { usePool } from '../../state/pool';
import { Loading } from '../../components/icon/Loading';
import StableSwapPage from './StableSwapPage';
import StableSwapPageUSN from './StableSwapPageUSN';
import FourTokenStablePage from './FourTokenStablePage';
import { NEARX_POOL_ID } from 'src/services/near';
import { PageContainer } from '../../components/layout/PageContainer';

interface ParamTypes {
  id: string;
}

export default function Container(props: any) {
  return (
    <PageContainer>
      <StableSwapRouter {...props} />
    </PageContainer>
  );
}
function StableSwapRouter() {
  const { id } = useParams<ParamTypes>();
  const { pool } = usePool(id);

  const history = useHistory();

  if (id === NEARX_POOL_ID) {
    history.push('/');
  }

  if (!pool) return <Loading />;

  if (pool.tokenIds.length == 3) return <StableSwapPage pool={pool} />;
  if (pool.tokenIds.length == 4) return <FourTokenStablePage pool={pool} />;
  else return <StableSwapPageUSN pool={pool} />;
}
