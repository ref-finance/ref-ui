import React from 'react';

export default {
  slippageCopy:
    "Slippage is the difference between the estimated <br> and actual price you receive. The percentage you <br> select is the acceptable difference between the <br> current exchange rate and the exchange rate at <br> the time of your transaction's execution.",
  deposit:
    'This deposits your selected tokens into the <br> exchange for swapping or adding to a liquidity pool.',
  nearDeposit:
    'This first wraps then deposits your Ⓝ into the <br> exchange for swapping or adding to a liquidity pool.',
  nearWithdraw:
    'This will first unwrap your Ⓝ then withdraw it from <br> the exchange and move the tokens to your wallet.',
  withdraw:
    'This will withdraw your selected tokens from <br> the exchange and deposit them into your wallet.',
  registerToken:
    'This registers a new token with the <br> exchange that is not already listed.',
  whitelistToken:
    'This allows you to add an ERC-20 token to the exchange that is not already listed.',
  addLiquidityPool:
    'This creates a new liquidity pool for the two tokens selected. The fee is the percentage the pool takes from each transaction.',
  addLiquidity:
    'This will deposit your tokens into the liquidity pool to <br> receive a portion of the returns this pool generates.',
  removeLiquidity:
    'This removes your liquidity shares from the pool and <br> transfers the tokens back into your exchange portfolio.',
  swap: (
    <>
      <div>
        Swap exchanges the first selected token with the value of the second
        selected token.
      </div>
      <div>
        This looks for a pool with available liquidity and the lowest exchange
        fee.
      </div>
    </>
  ),
  balances:
    'This page reflects the amount of tokens you have deposited in the exchange. <br> Use the from below to add or withdraw tokens using your NEAR Wallet.',
  addToken:
    'This allows you to add an ERC-20 token to the exchange that is not already listed.',
};