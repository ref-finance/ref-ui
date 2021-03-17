import React from "react";
import FullCard from "~components/layout/FullCard";
import { DEFAULT_COIN_LIST } from "~consts/DefaultSupportedCoins";

interface LiquidityTokenRowProps {
  coin: CoinForSwap;
}

interface LiquidityPageProps {
  children: string;
}

function LiquidityTokenRow({ coin }: LiquidityTokenRowProps) {
  const { SVG, name, acronym, tokenId } = coin;

  const href = `/liquidity/${tokenId}`;
  // TODO: get price and liquidity
  return (
    <tr className="h-12 border-separate  border-b border-t border-borderGray">
      <td>
        <a
          href={href}
          className="flex flex-row items-center text-blue-400 hover:text-blue-300"
        >
          <SVG height="30" width="30" />
          <p className="ml-4">{name}</p>
        </a>
      </td>
      <td>
        <a href={href}>{acronym}</a>
      </td>
      <td>
        <h1>$0</h1>
      </td>
      <td>
        <h1>$0</h1>
      </td>
    </tr>
  );
}

function LiquidityPage() {
  const TableHeader = ({ children }: LiquidityPageProps) => (
    <th className="text-left font-light text-sm py-4">{children}</th>
  );

  const liquidityTokens = DEFAULT_COIN_LIST;
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
            {liquidityTokens.map((liquidityToken) => (
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
