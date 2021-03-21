import React from "react";
import FullCard from "~components/layout/FullCard";

interface LiquidityTokenRowProps {
  coin: CoinForSwap;
}

interface LiquidityPageProps {
  children: string;
}

function LiquidityTokenRow({ coin }: LiquidityTokenRowProps) {
  const { icon, name, symbol, id } = coin;

  const href = `/liquidity/${encodeURIComponent(id)}`;
  // TODO: get price and liquidity
  return (
    <tr className="h-12 border-separate  border-b border-t border-borderGray">
      <td>
        <a
          href={href}
          className="flex flex-row items-center text-blue-400 hover:text-blue-300"
        >
          <img className="object-cover" src={icon} height={30} width={30} />
          <p className="ml-4">{name}</p>
        </a>
      </td>
      <td>
        <a href={href}>{symbol}</a>
      </td>
      <td>
        <h1>N/A</h1>
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

  const liquidityTokens = Object.values(window.tokenMap);
  return (
    <FullCard>
      <div>
        <h1 className="text-lg font-medium pt-8">Popular Liquidity Pairs</h1>
        <table className="w-full">
          <thead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader>Symbol</TableHeader>
              <TableHeader>Liquidity</TableHeader>
              <TableHeader>Price</TableHeader>
            </tr>
          </thead>
          <tbody>
            {liquidityTokens.map((liquidityToken: CoinForSwap) => (
              <LiquidityTokenRow
                coin={liquidityToken}
                key={liquidityToken.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </FullCard>
  );
}

export default LiquidityPage;
