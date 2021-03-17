import React from "react";

import { NEAR_COIN, USDT_COIN, USDC_COIN } from "~consts/DefaultSupportedCoins";
interface CoinBalanceProps {
  coin: CoinForSwap;
  price: number;
  delta: number;
  balance: number;
}

function CoinBalance({ coin, balance, price, delta }: CoinBalanceProps) {
  const { acronym, SVG } = coin;
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
          {balance} {acronym}
        </h2>
        <p>${(price * balance).toFixed(2)}</p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className={`text-xl ${color}`}>${price.toFixed(2)}</p>
          <p className={`${color}`}>{pct}%</p>
        </div>
        <SVG width="40" height="40" />
      </div>
    </a>
  );
}

function Portfolio() {
  return (
    <div>
      <h1 className=" font-semibold font-inter ">Portfolio</h1>
      <div className="flex flex-row pt-6 flex-wrap lg:flex-nowrap lg:space-x-12 ">
        <CoinBalance coin={USDC_COIN} balance={0} price={1} delta={0} />
        <CoinBalance coin={USDT_COIN} balance={0} price={1} delta={0} />
        <CoinBalance coin={NEAR_COIN} balance={0} price={6.05} delta={0.1063} />
      </div>
    </div>
  );
}

export default Portfolio;
