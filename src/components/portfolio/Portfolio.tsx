import React from 'react';
import PortfolioCoinList from './PortfolioCoinList';
import DepositWithdrawSelect from './DepositWithdrawSelect';

// type DepositMap = <string, number>
interface DepositProps {
  deposits: Record<string, number>;
}

function Portfolio({ deposits }: DepositProps) {
  return (
    <div>
      <h1 className="font-semibold font-inter pt-8">Portfolio</h1>
      <tbody>
        <PortfolioCoinList deposits={deposits}/>
      </tbody>
      <DepositWithdrawSelect />
    </div>
  );
}

export default Portfolio;
