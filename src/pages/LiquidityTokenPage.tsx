import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import FullCard from "~components/layout/FullCard";
import RightArrowSVG from "~assets/misc/right-arrow.svg";

import LiquidityCard from "~components/liquidity/LiquidityCard";
import { getTokenFromTokenId } from "~utils/ContractUtils";

interface ParamTypes {
  tokenId: string;
}

interface TokenProps {
  token: CoinForSwap;
}

interface DeltaText {
  delta: number;
}

interface TokenDetailColumnProps {
  title: string;
  value: string | number;
  delta: number;
}

function Header({ token }: TokenProps) {
  return (
    <div className="flex flex-row items-center space-x-2 pt-2 lg:p-7 pb-4">
      <a href="/liquidity">
        <p className="text-gray-500 font-light font-inter text-sm">Tokens</p>
      </a>
      <RightArrowSVG />
      {token && (
        <p className="text-gray-500 font-light font-inter text-sm">
          {token.symbol} ({token.id})
        </p>
      )}
    </div>
  );
}

const getDeltaColorAndSign = (delta: number) => {
  const color = delta >= 0 ? "text-green-500" : "text-red-400";
  const sign = delta >= 0 ? "+" : "-";

  return { color, sign };
};

function DeltaText({ delta }: DeltaText) {
  const { color, sign } = getDeltaColorAndSign(delta);
  return (
    <p className={`${color}`}>
      {sign}
      {delta * 100}%
    </p>
  );
}

function TokenAbout({ token }: TokenProps) {
  const { icon, name } = token;
  return (
    <div className="flex flex-row items-center lg:pl-7">
      <img className="object-cover" src={icon} height={40} width={40} />
      <h1 className="font-bold font-inter text-2xl ml-4 mr-2">{name}</h1>
      <DeltaText delta={0} />
    </div>
  );
}

function TokenDetailColumn({ title, value, delta }: TokenDetailColumnProps) {
  const { color, sign } = getDeltaColorAndSign(delta);
  return (
    <div className="flex flex-col mr-8 mb-8 lg:m-0">
      <h2 className="text-gray-500 pb-1">{title}</h2>
      <div className="flex flex-row items-center space-x-2">
        <p>{value}</p>
        <p className={`${color} text-sm`}>
          {sign}
          {(delta * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function TokenDetails({ token }: TokenProps) {
  return (
    <div className="flex flex-col lg:pl-6 mt-8 mb-14">
      <h1 className=" font-normal text-xl pb-4">Token Details</h1>
      <div className="flex flex-row lg:space-x-24 flex-wrap">
        <TokenDetailColumn
          title="Total Liquidity"
          // value={"$0"}
          value="N/A"
          delta={0}
        />
        <TokenDetailColumn
          title="Volume (24hrs)"
          //value={"$0"}
          value="N/A"
          delta={0}
        />
        <TokenDetailColumn
          title="Transactions (24hrs)"
          value={"N/A"}
          delta={0}
        />
      </div>
    </div>
  );
}

function LiquidityTokenPage() {
  const { tokenId: rawTokenId } = useParams<ParamTypes>();
  const tokenId = decodeURIComponent(rawTokenId);
  const [token, setToken] = useState<CoinForSwap>(null);
  useEffect(() => {
    getTokenFromTokenId(tokenId).then((tokenFromAPI) => {
      setToken(tokenFromAPI);
    });
  }, []);

  return (
    <FullCard>
      <Header token={token} />
      {token && <TokenAbout token={token} />}
      {token && <TokenDetails token={token} />}
      {token && <LiquidityCard defaultToken={token} />}
      <div className="h-10" />
    </FullCard>
  );
}

export default LiquidityTokenPage;
