import React from "react";

interface SubmitButtonProps {
  amount: number;
  pool: PoolInfo;
  coinsSelected: boolean;
}

function SubmitButton({ amount, pool, coinsSelected }: SubmitButtonProps) {
  const notLoggedIn = !window.accountId;
  const disabled = notLoggedIn || !pool || !amount || !coinsSelected;

  let text = "Swap";

  if (!pool && coinsSelected) {
    text = "No pool available";
  }
  if (!amount) {
    text = "Enter an amount";
  }
  if (notLoggedIn) {
    text = '"Connect your wallet" ';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        //
      }}
      className="flex flex-row justify-center py-4 mt-10 mb-16 items-center rounded-md w-full bg-black  text-white disabled:text-gray-400  disabled:bg-gray-100"
      // style={{ backgroundColor: "#e5e7eb" }}
    >
      <h1 className=" text-xl font-inter font-medium ">{text}</h1>
    </button>
  );
}

export default SubmitButton;
