import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import SelectCurrencyModal from "./SelectCurrencyModal";
import DownArrowSVG from "~assets/misc/down-arrow.svg";

import SubmitButton from "~components/general/SubmitButton";
import { getReturn, swapToken } from "~utils/ContractUtils";
import { getPool } from "~utils";
import { wallet } from "~services/near";
import DefaultSupportedCoinsMetadataDev from "~consts/DefaultSupportCoinsMetadataDev";

interface SwapContainerProps {
  title: string;
  balance: number;
  showMax?: boolean;
  selectedCoin: CoinForSwap;
  setCoin: Dispatch<SetStateAction<CoinForSwap>>;
  value: number;
  disabled?: boolean;
  onMaxClick?: () => void;
  onChange?: (value: SetStateAction<number>) => void;
}

interface MaxButtonProps {
  onMaxClick?: () => void;
}
interface SwapButtonProps {
  amount: number;
  minAmount: number;
  userBalance: number;
  pool: PoolInfo;
  selectedCoinOne: CoinForSwap;
  selectedCoinTwo: CoinForSwap;
  poolId: number;
}

const SwapHeader = () => (
  <div className="flex flex-row pt-6 mb-6 space-x-4 border-b border-borderGray">
    <div className="pb-3 border-b border-black ">
      <h2 className="font-inter font-medium text-sm">Swap</h2>
    </div>
  </div>
);

function MaxButton({ onMaxClick }: MaxButtonProps) {
  return (
    <button
      onClick={onMaxClick}
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
  onMaxClick,
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
          {showMax && <MaxButton onMaxClick={onMaxClick} />}
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

function SwapButton({
  amount,
  minAmount,
  pool,
  selectedCoinOne,
  selectedCoinTwo,
  userBalance,
  poolId,
}: SwapButtonProps) {
  const coinsSelected = !!(selectedCoinOne && selectedCoinTwo);
  const notLoggedIn = !wallet.isSignedIn();
  const notEnoughBalance = amount > userBalance;
  const disabled =
    notEnoughBalance || notLoggedIn || !pool || amount <= 0 || !coinsSelected;

  let text = "Swap";

  if (!pool && coinsSelected) {
    text = "No pool available";
  }

  if (notEnoughBalance) {
    text = "Not enough balance";
  }
  if (!amount) {
    text = "Enter an amount";
  }

  if (!selectedCoinTwo) {
    text = "Select a token";
  }

  if (notLoggedIn) {
    text = "Connect your wallet";
  }

  return (
    <SubmitButton
      onClick={() => {
        swapToken(
          poolId,
          selectedCoinOne.id,
          amount,
          selectedCoinTwo.id,
          minAmount
        );
      }}
      disabled={disabled}
      text={text}
    />
  );
}

function SwapCard() {
  //TODO: fix these two lines :)
  const tokenMap = DefaultSupportedCoinsMetadataDev;
  const defaultCoin = tokenMap[Object.values(tokenMap)[0]];

  const [amount, setAmount] = useState<number>(0);
  const [selectedCoinOne, setCoinOne] = useState<CoinForSwap>(defaultCoin);
  const [selectedCoinTwo, setCoinTwo] = useState<CoinForSwap>();
  const [toAmount, setToAmount] = useState<number>(0);
  const { pool, poolId } = getPool(selectedCoinOne?.id, selectedCoinTwo?.id);

  const userBalance = parseFloat(window.deposits[selectedCoinOne?.id] || 0.0);
  useEffect(() => {
    if (poolId > -1) {
      getReturn(
        poolId,
        selectedCoinOne.id,
        selectedCoinTwo.id,
        amount || 0
      ).then((returnAmt) => setToAmount(returnAmt));
    }
    if (!amount) {
      setToAmount(0);
    }
  }, [poolId, amount]);

  useEffect(() => {
    setAmount(0);
    setToAmount(0);
  }, [selectedCoinOne, selectedCoinTwo]);
  useAvoidDuplicateCoins(selectedCoinOne, selectedCoinTwo, setCoinTwo);

  return (
    <div className="px-6">
      <SwapHeader />
      <SwapContainer
        title="From"
        showMax
        onMaxClick={() => {
          setAmount(userBalance);
        }}
        balance={userBalance}
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
      <SwapButton
        amount={amount}
        minAmount={toAmount}
        pool={pool}
        poolId={poolId}
        userBalance={userBalance}
        selectedCoinOne={selectedCoinOne}
        selectedCoinTwo={selectedCoinTwo}
      />
    </div>
  );
}

export default SwapCard;
