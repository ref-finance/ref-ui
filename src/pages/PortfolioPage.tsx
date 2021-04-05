import React from 'react';
import { toRoundedReadableNumber } from '../utils/numbers';
import { useTokenBalances, useUserRegisteredTokens } from '../state/token';
import TokenList from '../components/tokens/TokenList';
import Loading from '../components/layout/Loading';
import TokenManagement from '../components/management/TokenManagement';
import PageWrap from '~components/layout/PageWrap';

export default function PortfolioPage() {
  const balances = useTokenBalances();
  const registeredTokens = useUserRegisteredTokens();

  if (!registeredTokens) return <Loading />;

  return (
    <PageWrap>
      <h1 className="text-center text-xl py-2 font-bold border-b-2">
        Balances
      </h1>
      <TokenList
        tokens={registeredTokens}
        render={(token) => (
          <p>
            {toRoundedReadableNumber({
              decimals: token.decimals,
              number: balances[token.id],
            })}
          </p>
        )}
      />
      <TokenManagement />
    </PageWrap>
  );
}
