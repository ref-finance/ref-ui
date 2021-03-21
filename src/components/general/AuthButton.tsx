import React from "react";
import { login, logout } from "../../utils";

function AuthButton() {
  const isSignedIn = window.walletConnection.isSignedIn();
  const text = isSignedIn
    ? `Signed in as ${window.accountId}`
    : "Connect to Wallet";

  const onClick = () => {
    if (isSignedIn) {
      logout();
    } else {
      login();
    }
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className=" my-4 h-10 w-56  border border-black flex-row-centered shadow-lg hover:bg-disabledGray rounded-lg transition-colors"
    >
      <h1 className="font-inter text-xs ">{text}</h1>
    </button>
  );
}

export default AuthButton;
