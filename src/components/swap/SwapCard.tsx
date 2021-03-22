import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import SelectCurrencyModal from "./SelectCurrencyModal";
import DownArrowSVG from "~assets/misc/down-arrow.svg";

import SubmitButton from "~components/general/SubmitButton";
import { getReturn } from "~utils/ContractUtils";

interface SwapContainerProps {
  title: string;
  balance: number;
  showMax?: boolean;
  selectedCoin: CoinForSwap;
  setCoin: Dispatch<SetStateAction<CoinForSwap>>;
  value: number;
  disabled?: boolean;
  onChange?: (value: SetStateAction<number>) => void;
}

const SwapHeader = () => (
  <div className="flex flex-row pt-6 mb-6 space-x-4 border-b border-borderGray">
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
  value,
  onChange,
  disabled = false,
}: SwapContainerProps) {
  return (
    <div className="flex flex-col p-3 bg-backgroundGray space-y-2">
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
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
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

const getPool = (idOne: string, idTwo: string) => {
  let poolId = 0;
  const pool = window.pools.find((p: PoolInfo) => {
    const { token_account_ids } = p;
    const [t1, t2] = token_account_ids;
    if ((idOne === t1 && idTwo === t2) || (idOne === t2 && idTwo === t1)) {
      return p;
    }
    poolId += 1;
  });
  if (!pool) {
    poolId = -1;
  }

  return { pool, poolId };
};

function SwapCard() {
  const defaultCoin = window.tokenMap[window.tokenList[0]];
  const [amount, setAmount] = useState<number>(0);
  const [selectedCoinOne, setCoinOne] = useState<CoinForSwap>(defaultCoin);
  const [selectedCoinTwo, setCoinTwo] = useState<CoinForSwap>();
  const [toAmount, setToAmount] = useState<number>(0);
  const { pool, poolId } = getPool(selectedCoinOne?.id, selectedCoinTwo?.id);

  useEffect(() => {
    if (poolId > -1 && amount) {
      getReturn(
        poolId,
        selectedCoinOne.id,
        selectedCoinTwo.id,
        amount
      ).then((returnAmt) => setToAmount(returnAmt));
    }
  }, [poolId, amount]);
  useAvoidDuplicateCoins(selectedCoinOne, selectedCoinTwo, setCoinTwo);

  const disabled = !window.accountId || !pool || !amount;
  return (
    <div className="px-6">
      <SwapHeader />
      <SwapContainer
        title="From"
        showMax
        balance={0.0}
        selectedCoin={selectedCoinOne}
        setCoin={setCoinOne}
        value={amount}
        onChange={setAmount}
      />
      <DownArrow />
      <SwapContainer
        title="To"
        balance={0.0}
        value={toAmount}
        selectedCoin={selectedCoinTwo}
        setCoin={setCoinTwo}
        disabled
      />
      <SubmitButton
        disabled={disabled}
        amount={amount}
        pool={pool}
        coinsSelected={!!(selectedCoinOne && selectedCoinTwo)}
      />
    </div>
  );
}

export default SwapCard;
