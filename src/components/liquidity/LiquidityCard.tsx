import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import SelectCurrencyModal from "~components/swap/SelectCurrencyModal";
import PlusSVG from "~assets/misc/plus.svg";
import { NEAR_COIN } from "~consts/DefaultSupportedCoins";
import SubmitButton from "~components/general/SubmitButton";

interface LiquidityContainerProps {
  selectedCoin: CoinForSwap;
  setCoin: Dispatch<SetStateAction<CoinForSwap>>;
}

interface LiquidityCardProps {
  defaultToken: CoinForSwap;
}

function LiquidityContainer({
  selectedCoin,
  setCoin,
}: LiquidityContainerProps) {
  return (
    <div className="flex flex-col p-3  mx-6 bg-backgroundGray space-y-2">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="text-sm font-light text-gray-400">Input</p>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl font-inter"
        />
        <div className="flex flex-row items-center space-x-2.5">
          <SelectCurrencyModal selectedCoin={selectedCoin} setCoin={setCoin} />
        </div>
      </div>
    </div>
  );
}

function useEnsureSelectedIsValid(
  defaultCoin: CoinForSwap,
  coinOne: CoinForSwap,
  coinTwo: CoinForSwap,
  [setOne, setTwo]: Dispatch<SetStateAction<CoinForSwap>>[]
) {
  useEffect(() => {
    if (coinTwo && coinOne.id === coinTwo.id) {
      setTwo(null);
    }
    if (coinOne && coinTwo) {
      if (coinOne.id !== defaultCoin.id && coinTwo.id !== defaultCoin.id) {
        setOne(defaultCoin);
        setTwo(null);
      }
    }
  }, [coinOne, coinTwo]);
}

function LiquidityCard({ defaultToken }: LiquidityCardProps) {
  const [selectedCoinOne, setCoinOne] = useState<CoinForSwap>(defaultToken);
  const [selectedCoinTwo, setCoinTwo] = useState<CoinForSwap>();

  useEnsureSelectedIsValid(defaultToken, selectedCoinOne, selectedCoinTwo, [
    setCoinOne,
    setCoinTwo,
  ]);

  return (
    <div className="flex flex-col  items-center lg:w-1/3 lg:min-w-25 mt-4 lg:mx-6 rounded-lg border-2 border-black shadow-xl">
      <h1 className="text-left w-full p-6">+ Liquidity </h1>
      <LiquidityContainer selectedCoin={selectedCoinOne} setCoin={setCoinOne} />
      <div className="my-6">
        <PlusSVG />
      </div>
      <LiquidityContainer selectedCoin={selectedCoinTwo} setCoin={setCoinTwo} />
      <div className="w-full">
        <SubmitButton />
      </div>
    </div>
  );
}

export default LiquidityCard;
