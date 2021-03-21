import React, { useState } from "react";
import SelectCurrencyModal from "~components/swap/SelectCurrencyModal";

function DepositSelect() {
  const [selectedCoin, setCoin] = useState(null);
  return (
    <div className="flex flex-col space-y-4 border-black rounded border p-6">
      <h1 className="text-xl font-inter font-semibold">Deposit</h1>
      <SelectCurrencyModal selectedCoin={selectedCoin} setCoin={setCoin} />

      <div className="flex flex-col p-1">
        <h2>Amount</h2>
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl font-inter"
        />
      </div>
      <button type="button">
        <h2>Deposit</h2>
      </button>
    </div>
  );
}

function DepositWithdrawSelect() {
  return (
    <div className="mt-6 flex">
      <DepositSelect />
    </div>
  );
}

export default DepositWithdrawSelect;
