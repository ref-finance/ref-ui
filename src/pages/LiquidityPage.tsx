import React from "react";
import FullCard from "~components/layout/FullCard";

interface LiquidityTokenRowProps {
  pair: PoolInfo;
  poodId: number;
}

interface LiquidityPageProps {
  children: string;
}

function LiquidityTokenRow({ pair }: LiquidityTokenRowProps) {
  const { token_account_ids } = pair;
  const [coinOneSymbol, coinTwoSymbol] = token_account_ids;
  const coinOne = window.tokenMap[coinOneSymbol];
  const coinTwo = window.tokenMap[coinTwoSymbol];

  const { icon, name, symbol, id } = coinOne;
  const {
    icon: iconTwo,
    name: nameTwo,
    symbol: symbolTwo,
    id: idTwo,
  } = coinTwo;

  const href = `/liquidity/${id}`;
  const hrefTwo = `/liquidity/${idTwo}`;
  // TODO: get price and liquidity
  return (
    <tr className="h-12 border-separate  border-b border-t border-borderGray">
      <td>
        <div className="flex flex-row items-center text-blue-400 ">
          <img className="object-cover" src={icon} height={30} width={30} />
          <img
            className="object-cover ml-4"
            src={iconTwo}
            height={30}
            width={30}
          />
          <a href={href} className="hover:text-blue-300">
            <p className="ml-4">{name}</p>
          </a>
          <p className="mx-2 text-black">/</p>
          <a href={hrefTwo} className="hover:text-blue-300">
            <p>{nameTwo}</p>
          </a>
        </div>
      </td>
      <td>
        <a href={href}>
          {symbol} / {symbolTwo}
        </a>
      </td>
      <td>
        <h1>N/A</h1>
      </td>
    </tr>
  );
}

function LiquidityPage() {
  const TableHeader = ({ children }: LiquidityPageProps) => (
    <th className="text-left font-light text-sm py-4">{children}</th>
  );

  const liquidityPairs = window.pools;
  return (
    <FullCard>
      <div>
        <h1 className="text-lg font-medium pt-8">Popular Liquidity Pairs</h1>
        <table className="w-full">
          <thead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Symbols</TableHeader>
              <TableHeader>Liquidity</TableHeader>
            </tr>
          </thead>
          <tbody>
            {liquidityPairs.map((pair: PoolInfo, poodId: number) => (
              <LiquidityTokenRow
                pair={pair}
                poodId={poodId}
                key={
                  pair.token_account_ids[0] + pair.token_account_ids[1] + poodId
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </FullCard>
  );
}

export default LiquidityPage;
