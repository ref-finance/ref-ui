import React from "react";

interface PriceProps {
  name: string;
  price: number;
  delta: number;
}

function Price({ name, price, delta }: PriceProps) {
  const pct = (delta * 100).toFixed(2);

  const color = delta >= 0 ? "text-green-500" : "text-red-400";
  return (
    <div className="flex flex-row space-x-1.5 mr-6 lg:m-0">
      <h1 className="font-bold text-sm">{name}:</h1>
      <p className="text-sm">${price.toLocaleString()}</p>
      <p className={`text-sm ${color}`}>{pct}%</p>
    </div>
  );
}
function PriceTicker() {
  // TODO: Decide where we want to grab prices from.
  return (
    <div
      style={{ backgroundColor: "#f4f5f7" }}
      className="flex flex-row lg:space-x-6 w-full m-6 ml-0 p-4  rounded-md flex-wrap lg:flex-nowrap"
    >
      <Price name="NEAR" price={6.05} delta={0.1063} />
      <Price name="ETH" price={1794.97} delta={-0.0274} />
    </div>
  );
}

export default PriceTicker;
