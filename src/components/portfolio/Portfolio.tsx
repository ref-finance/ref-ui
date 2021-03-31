import React, { useEffect, useState } from 'react';
import PortfolioCoinList from './PortfolioCoinList';
import DepositWithdrawSelect from './DepositWithdrawSelect';
import { getTokenBalances } from '~services/token';
import { wallet } from '~services/near';

function Portfolio() {
  const [balances, setBalances] = useState();
  useEffect(() => {
    getTokenBalances().then(res => setBalances(res))
  }, [])
  console.log('balances??', balances)
  console.log('wallet???', wallet.isSignedIn());
  return (
    <div>
      <h1 className="font-semibold font-inter pt-8">Portfolio</h1>
      <tbody>
        <PortfolioCoinList deposits={balances} />
      </tbody>
      <DepositWithdrawSelect />
    </div>
  );
}

export default Portfolio;
