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
    'This allows you to add an NEP-141 token to the exchange that is not already listed.',
  addLiquidityPool:
    'This creates a new liquidity pool for the two tokens selected. The fee is the percentage the pool takes from each transaction.',
  addLiquidity:
    'This will deposit your tokens into the liquidity pool to <br> receive a portion of the returns this pool generates.',
  removeLiquidity:
    'This removes your liquidity shares from the pool and <br> transfers the tokens back into your exchange portfolio.',
  swap: (
    <>
      <div>
        Swap exchanges the first selected token with the second selected token.
      </div>
      <div>
        The pools with the highest available liquidity and the lowest exchange
        fee will be used.
      </div>
    </>
  ),
  balances:
    'This page reflects the amount of tokens you have deposited in the exchange. <br> Use the from below to add or withdraw tokens using your NEAR Wallet.',
  addToken:
    'This allows you to add an NEP-141 token to the exchange that is not already listed.',
  poolFee:
    'The fee liquidity providers will earn on each trade. <br> If the fee is 0.3%, a trade of $100 nUSDT to nDAI <br> will incur a fee of $0.3 nDAI. This nDAI is distributed <br> proportionally to liquidity providers of the nUSDT - <br> nDAI pool',
  getLPTokenCopy: 'Click here to jump to the corresponding pool.',
  airdrop:
    ' Please claim your airdrop at least once before the expiration date otherwise your balance would be donated into the treasury.',
  farmRewards:
    'Here is where you will see all the balances that you have claimed from the pools you are participating in. Withdraw to your Near wallet',
};
