import React from 'react';
import { PortfolioCoin } from './PortfolioCoin';

// type DepositMap = <string, number>
interface DepositProps {
  deposits: Record<string, number>;
}

function PortfolioCoinList({ deposits }: DepositProps) {
  const coins = Object.keys(deposits);
  const coinTable = (
    <table className="flex flex-col pt-6 flex-wrap lg:flex-nowrap space-y-4">
      {coins.map((coin) => {
        const balance = deposits[coin];
        return <PortfolioCoin key={coin} coinName={coin} balance={balance} />;
      })}
    </table>
  );
  return coinTable;
}

export default PortfolioCoinList;