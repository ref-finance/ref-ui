import React, { useEffect, useState } from 'react';
import PortfolioCoinList from './PortfolioCoinList';
import DepositWithdrawSelect from './DepositWithdrawSelect';
import { getTokenBalances } from '~services/token';

function Portfolio() {
  const [balances, setBalances] = useState({});
  useEffect(() => {
    getTokenBalances().then((res) => setBalances(res));
  }, []);
  return (
    <>
      <h1 className="font-semibold font-inter pt-8">Portfolio</h1>
      <tbody>
        <PortfolioCoinList deposits={balances} />
      </tbody>
      <DepositWithdrawSelect />
    </>
  );
}

export default Portfolio;
