import React, { useState } from "react";
import SubmitButton from "~components/general/SubmitButton";
import SelectCurrencyModal from "~components/swap/SelectCurrencyModal";

import { ToastContainer, toast } from "react-toastify";
import { depositToken, withdrawToken } from "~utils/ContractUtils";
import { wallet } from "~services/near";

interface SelectProps {
  title: string;
  onClick: (selectedCoin: CoinForSwap, amount: number) => void;
  showAll: boolean;
}

function checkError(selectedCoin: CoinForSwap, amount: number) {
  try {
    if (!wallet.isSignedIn()) {
      throw new Error("NO_ACCOUNT_ID");
    }
    if (!selectedCoin) {
      throw new Error("NO_COIN_SELECTED");
    }
    if (amount <= 0) {
      throw new Error("NO_AMOUNT");
    }
    return false;
  } catch ({ message: error }) {
    let errorMsg = "An error occured. Please try again later.";
    if (error === "NO_ACCOUNT_ID") {
      errorMsg = "Please sign in first to swap.";
    }
    if (error === "NO_COIN_SELECTED") {
      errorMsg = "Please select a coin to deposit first.";
    }
    if (error === "NO_AMOUNT") {
      errorMsg = "Please set an amount greater than zero.";
    }
    toast.error(errorMsg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    return true;
  }
}

function withdraw(selectedCoin: CoinForSwap, amount: number) {
  const didError = checkError(selectedCoin, amount);
  if (didError) {
    return;
  }
  withdrawToken(selectedCoin.id, amount);
}

function deposit(selectedCoin: CoinForSwap, amount: number) {
  const didError = checkError(selectedCoin, amount);
  if (didError) {
    return;
  }
  depositToken(selectedCoin.id, amount);
}

function Select({ title, onClick, showAll }: SelectProps) {
  const [selectedCoin, setCoin] = useState(null);
  const [amount, setAmount] = useState(0);
  const disabled = false;
  console.log(title, showAll);
  return (
    <div className="flex flex-col space-y-4 border-black rounded border p-6">
      <h1 className="text-xl font-inter font-semibold">{title}</h1>
      <SelectCurrencyModal selectedCoin={selectedCoin} setCoin={setCoin} showAll={showAll} />

      <div className="flex flex-col p-1">
        <h2>Amount</h2>
        <input
          value={amount || ""}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          type="number"
          placeholder="0.0"
          className="text-2xl font-inter"
        />
      </div>
      <SubmitButton onClick={() => onClick(selectedCoin, amount)} text={title} disabled={disabled} />
    </div>
  );
}

function DepositWithdrawSelect() {
  return (
    <div className="mt-6 flex flex-col space-y-4 lg:space-x-4 lg:space-y-0 lg:flex-row ">
      <Select title="Deposit" onClick={deposit} showAll={true} />
      <Select title="Withdraw" onClick={withdraw} showAll={false} />
      <ToastContainer />
    </div>
  );
}

export default DepositWithdrawSelect;
