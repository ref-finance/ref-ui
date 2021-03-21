import React from "react";

import DepositWithdrawSelect from "./DepositWithdrawSelect";
interface CoinBalanceProps {
  coin: CoinForSwap;
  price: number;
  delta: number;
  balance: number;
}

interface PortfolioProps {
  tokensInContract: string[];
}

function CoinBalance({ coin, balance, price, delta }: CoinBalanceProps) {
  const { symbol, icon } = coin;
  const pct = (delta * 100).toFixed(2);

  let color = delta >= 0 ? "text-green-500" : "text-red-400";
  if (delta === 0) {
    color = "text-black";
  }

  return (
    <a
      href="/"
      className="transition-all hover:border-black border border-borderGray rounded-md w-44 p-4 h-40 flex flex-col justify-between transform hover:-translate-y-1 hover:scale-102 mr-4 mb-4 lg:m-0"
    >
      <div>
        <h2 className=" text-xl  w-max font-bold">
          {balance} {symbol}
        </h2>
        <p>${(price * balance).toFixed(2)}</p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className={`text-xl ${color}`}>${price.toFixed(2)}</p>
          <p className={`${color}`}>{pct}%</p>
        </div>
        <img className="object-cover" src={icon} height={40} width={40} />
      </div>
    </a>
  );
}

function CoinPortfolio() {
  return (
    <div className="flex flex-row pt-6 flex-wrap lg:flex-nowrap lg:space-x-12 ">
      {/* <CoinBalance coin={USDC_COIN} balance={0} price={1} delta={0} />
      <CoinBalance coin={USDT_COIN} balance={0} price={1} delta={0} />
      <CoinBalance coin={NEAR_COIN} balance={0} price={6.05} delta={0.1063} /> */}
    </div>
  );
}

function Portfolio({ tokensInContract }: PortfolioProps) {
  return (
    <div>
      <h1 className=" font-semibold font-inter ">Portfolio</h1>
      <CoinPortfolio />
      <DepositWithdrawSelect />
    </div>
  );
}

export default Portfolio;
