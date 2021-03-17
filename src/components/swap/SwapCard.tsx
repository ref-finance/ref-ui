import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import SelectCurrencyModal from "./SelectCurrencyModal";
import DownArrowSVG from "~assets/misc/down-arrow.svg";
import { NEAR_COIN } from "~consts/DefaultSupportedCoins";
import SubmitButton from "~components/general/SubmitButton";

interface SwapContainerProps {
  title: string;
  balance: number;
  showMax?: boolean;
  selectedCoin: CoinForSwap;
  setCoin: Dispatch<SetStateAction<CoinForSwap>>;
}

const SwapHeader = () => (
  <div className="flex flex-row pt-6 mb-6 space-x-4 border-b border-borderGray mx-6">
    <div className="pb-3 border-b border-black ">
      <h2 className="font-inter font-medium text-sm">Swap</h2>
    </div>
  </div>
);

function MaxButton() {
  return (
    <button
      className="bg-disabledGray px-2 py-1 pt-1.5 rounded-md hover:border-black border transition-colors"
      type="button"
    >
      MAX
    </button>
  );
}

function SwapContainer({
  title,
  balance,
  showMax,
  selectedCoin,
  setCoin,
}: SwapContainerProps) {
  return (
    <div className="flex flex-col p-3  mx-6 bg-backgroundGray space-y-2">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="text-sm font-light text-gray-400">{title}</p>
        <p className="text-sm font-light text-gray-400">
          Balance: {balance.toFixed(1)}
        </p>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl font-inter"
        />
        <div className="flex flex-row items-center space-x-2.5">
          {showMax && <MaxButton />}
          <SelectCurrencyModal selectedCoin={selectedCoin} setCoin={setCoin} />
        </div>
      </div>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex flex-row justify-center max-w my-3">
      <DownArrowSVG />
    </div>
  );
}

function useAvoidDuplicateCoins(
  coinOne: CoinForSwap,
  coinTwo: CoinForSwap,
  setCoinTwo: Dispatch<SetStateAction<CoinForSwap>>
) {
  useEffect(() => {
    if (coinTwo && coinOne.id === coinTwo.id) {
      setCoinTwo(null);
    }
  }, [coinOne, coinTwo]);
}

function SwapCard() {
  const [selectedCoinOne, setCoinOne] = useState<CoinForSwap>(NEAR_COIN);
  const [selectedCoinTwo, setCoinTwo] = useState<CoinForSwap>();

  useAvoidDuplicateCoins(selectedCoinOne, selectedCoinTwo, setCoinTwo);
  return (
    <>
      <SwapHeader />
      <SwapContainer
        title="From"
        showMax
        balance={0.0}
        selectedCoin={selectedCoinOne}
        setCoin={setCoinOne}
      />
      <DownArrow />
      <SwapContainer
        title="To"
        balance={0.0}
        selectedCoin={selectedCoinTwo}
        setCoin={setCoinTwo}
      />
      <SubmitButton />
    </>
  );
}

export default SwapCard;
