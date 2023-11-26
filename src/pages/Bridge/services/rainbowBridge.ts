import type { Transfer } from '@near-eth/client';
import {
  bridgedETH,
  bridgedNEAR,
  naturalETH,
  naturalNEAR,
} from '@near-eth/near-ether';
import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20';
import type { WalletSelector } from '@near-wallet-selector/core';
import Big from 'big.js';

const rainbowBridgeService = {
  transfer: async ({
    token,
    amount: amountIn,
    sender,
    from,
    accountId,
    nearWalletSelector,
  }: {
    token: any;
    amount: string;
    sender: string;
    from: BridgeModel.BridgeSupportChain;
    accountId: string;
    nearWalletSelector?: WalletSelector;
  }) => {
    let transfer: Transfer | null = null;

    const wallet = (await nearWalletSelector.wallet()) as any;

    const amount = new Big(amountIn).times(10 ** token.decimals).toFixed();

    if (from === 'NEAR' && !token.ethereum_address && token.symbol === 'ETH') {
      transfer = await bridgedETH.sendToEthereum({
        amount,
        recipient: sender,
        options: {
          nearAccount: wallet,
        },
      });
    }

    //   nep141 to eth
    if (
      from === 'NEAR' &&
      !!token.near_address &&
      !!token.ethereum_address &&
      token.symbol !== 'NEAR'
    ) {
      transfer = await bridgedNep141.sendToEthereum({
        erc20Address: token.ethereum_address,
        amount,
        recipient: sender,
        options: {
          ...token,
          nep141Address: token.near_address,
          nearAccount: wallet,
        },
      });
    }

    if (from === 'NEAR' && token.symbol === 'NEAR') {
      transfer = await naturalNEAR.sendToEthereum({
        recipient: sender,
        amount,
        options: {
          nearAccount: wallet,
        },
      });
    }

    //   erc20 to nep141
    if (
      from === 'ETH' &&
      !!token.ethereum_address &&
      !!token.near_address &&
      token.symbol !== 'NEAR'
    ) {
      transfer = await naturalErc20.sendToNear({
        erc20Address: token.ethereum_address,
        amount,
        recipient: accountId,
      });
    }

    if (from === 'ETH' && token.symbol === 'NEAR') {
      transfer = await bridgedNEAR.sendToNear({
        amount,
        recipient: accountId,
      });
    }

    if (from === 'ETH' && !token.ethereum_address && token.symbol === 'ETH') {
      transfer = await naturalETH.sendToNear({
        amount,
        recipient: accountId,
      });
    }

    return transfer;
  },
};

export default rainbowBridgeService;
