import React, { useState } from "react";
import SelectCurrencyModal from "~components/swap/SelectCurrencyModal";

import { ToastContainer, toast } from "react-toastify";
import { depositToken } from "~utils/ContractUtils";

interface SelectProps {
  title: string;
  onClick: (selectedCoin: CoinForSwap, amount: number) => void;
}

function deposit(selectedCoin: CoinForSwap, amount: number) {
  try {
    if (!window.accountId) {
      throw new Error("NO_ACCOUNT_ID");
    }
    if (!selectedCoin) {
      throw new Error("NO_COIN_SELECTED");
    }
    if (!amount) {
      throw new Error("NO_AMOUNT");
    }
    depositToken(selectedCoin.id, amount);
  } catch ({ message: error }) {
    console.log("error", error);
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
  }
}

function Select({ title, onClick }: SelectProps) {
  const [selectedCoin, setCoin] = useState(null);
  const [amount, setAmount] = useState(0);
  return (
    <div className="flex flex-col space-y-4 border-black rounded border p-6">
      <h1 className="text-xl font-inter font-semibold">{title}</h1>
      <SelectCurrencyModal selectedCoin={selectedCoin} setCoin={setCoin} />

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
      <button type="button" onClick={() => onClick(selectedCoin, amount)}>
        <h2>Deposit</h2>
      </button>
    </div>
  );
}

function DepositWithdrawSelect() {
  return (
    <div className="mt-6 flex flex-col space-y-4 lg:space-x-4 lg:space-y-0 lg:flex-row ">
      <Select title="Deposit" onClick={deposit} />
      <Select title="Withdraw" onClick={deposit} />
      <ToastContainer />
    </div>
  );
}

export default DepositWithdrawSelect;
