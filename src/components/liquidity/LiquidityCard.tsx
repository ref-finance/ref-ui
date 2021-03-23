import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import SelectCurrencyModal from "~components/swap/SelectCurrencyModal";
import PlusSVG from "~assets/misc/plus.svg";
import SubmitButton from "~components/general/SubmitButton";
import { getPool } from "~utils";
import { addLiquidity } from "~utils/ContractUtils";

interface LiquidityContainerProps {
  selectedCoin: CoinForSwap;
  setCoin: Dispatch<SetStateAction<CoinForSwap>>;
  value: number;
  setValue: (value: number) => void;
}

interface LiquidityCardProps {
  defaultToken: CoinForSwap;
}

function LiquidityContainer({
  selectedCoin,
  setCoin,
  value,
  setValue,
}: LiquidityContainerProps) {
  return (
    <div className="flex flex-col p-3 bg-backgroundGray space-y-2">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="text-sm font-light text-gray-400">Input</p>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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

  const [amountOne, setAmountOne] = useState<number>(0);
  const [amountTwo, setAmountTwo] = useState<number>(0);

  useEnsureSelectedIsValid(defaultToken, selectedCoinOne, selectedCoinTwo, [
    setCoinOne,
    setCoinTwo,
  ]);

  const { pool, poolId } = getPool(selectedCoinOne?.id, selectedCoinTwo?.id);

  return (
    <div className="flex flex-col  items-center lg:w-1/3 lg:min-w-25 mt-4 px-3 lg:px-6 rounded-lg border-2 border-black shadow-xl">
      <h1 className="text-left w-full py-6">+ Liquidity </h1>
      <LiquidityContainer
        selectedCoin={selectedCoinOne}
        setCoin={setCoinOne}
        value={amountOne}
        setValue={(value) => setAmountOne(value)}
      />
      <div className="my-6">
        <PlusSVG />
      </div>
      <LiquidityContainer
        selectedCoin={selectedCoinTwo}
        setCoin={setCoinTwo}
        value={amountTwo}
        setValue={(value) => setAmountTwo(value)}
      />
      <div className="w-full">
        <SubmitButton
          text={!pool ? "No Pool Available" : "Provide Liquidity"}
          disabled={
            amountOne <= 0 ||
            amountTwo <= 0 ||
            !selectedCoinOne ||
            !selectedCoinTwo ||
            !pool
          }
          onClick={() => addLiquidity(poolId, [amountOne, amountTwo])}
        />
      </div>
    </div>
  );
}

export default LiquidityCard;
