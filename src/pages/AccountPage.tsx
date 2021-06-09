import React from 'react';
import { Balances } from '../components/deposit/Deposit';
import { useTokenBalances, useUserRegisteredTokens } from '../state/token';
import Loading from '../components/layout/Loading';

export function AccountPage() {
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();

  if (!balances || !userTokens) return <Loading />;

  return (
    <div className="flex items-center flex-col">
      <div className="text-center pb-5">
        <div className="text-white text-3xl font-semibold">Account Balance</div>
        <div className="text-white text-xs pt-2"></div>
      </div>
      <Balances tokens={userTokens} balances={balances} />
    </div>
  );
}
