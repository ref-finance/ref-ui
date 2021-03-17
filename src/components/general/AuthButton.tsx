import React from "react";

function AuthButton() {
  return (
    <button
      type="button"
      className=" my-4 h-10 w-56  border border-black flex-row-centered shadow-lg hover:bg-disabledGray rounded-lg transition-colors"
    >
      <h1 className="font-inter text-sm ">Connect to Wallet</h1>
    </button>
  );
}

export default AuthButton;
