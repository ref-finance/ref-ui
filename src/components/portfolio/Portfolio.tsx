import React from "react";

import DepositWithdrawSelect from "./DepositWithdrawSelect";
interface CoinBalanceProps {
  // price: number;
  // delta: number;
  balance: number;
  coinName: string;
}

// type DepositMap = <string, number>
interface DepositProps {
  deposits: Record<string, number>;
}
function CoinBalance({ coinName, balance }: CoinBalanceProps) {
  const coin = window.tokenMap[coinName];
  const { symbol, icon } = coin;

  // const pct = (delta * 100).toFixed(2);
  // let color = delta >= 0 ? "text-green-500" : "text-red-400";
  // if (delta === 0) {
  //   color = "text-black";
  // }

  return (
    <div className="flex flex-row items-center">
      <img className="object-cover h-6 w-6 mr-4" src={icon} />
      <h2 className=" text-lg">
        {balance} {symbol}
      </h2>
    </div>
  );
}

function CoinPortfolio({ deposits }: DepositProps) {
  const coins = Object.keys(deposits);

  return (
    <div className="flex flex-col pt-6 flex-wrap lg:flex-nowrap space-y-4">
      {coins.map((coin) => {
        const balance = deposits[coin];
        return <CoinBalance key={coin} coinName={coin} balance={balance} />;
      })}
      {/* <CoinBalance coin={USDC_COIN} balance={0} price={1} delta={0} />
      
      <CoinBalance coin={NEAR_COIN} balance={0} price={6.05} delta={0.1063} /> */}
    </div>
  );
}

function Portfolio({ deposits }: DepositProps) {
  return (
    <div>
      <h1 className=" font-semibold font-inter pt-8 ">Portfolio</h1>
      <CoinPortfolio deposits={deposits} />
      <DepositWithdrawSelect />
    </div>
  );
}

export default Portfolio;
