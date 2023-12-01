import {
  bridgedETH,
  bridgedNEAR,
  naturalETH,
  naturalNEAR,
} from '@near-eth/near-ether';
import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20';
import Big from 'big.js';
import { ethers } from 'ethers';
import type { WalletSelector } from '@near-wallet-selector/core';
import { BridgeParams } from '../config';
import erc20Abi from './../abi/Erc20Abi.json';

const rainbowBridgeService = {
  async checkApprove({
    token,
    amount,
    from,
    sender,
  }: {
    token: BridgeModel.BridgeTokenMeta;
    amount: string;
    from: BridgeModel.BridgeSupportChain;
    sender: string;
  }) {
    if (from === 'NEAR' || !token.addresses.ETH) return true;
    const signer = await window.ethWeb3Provider?.getSigner();
    const erc20Contract = new ethers.Contract(
      token.addresses.ETH,
      erc20Abi,
      signer
    );
    const allowance = await erc20Contract.allowance(
      sender,
      BridgeParams.erc20LockerAddress
    );
    console.log('allowance', erc20Contract, allowance);
    const amountIn = new Big(amount).times(10 ** token.decimals).toFixed();
    if (allowance.gte(amountIn)) return true;
    return false;
  },
  async approve({
    token,
    amount,
    from,
  }: {
    token: BridgeModel.BridgeTokenMeta;
    amount: string;
    from: BridgeModel.BridgeSupportChain;
  }) {
    if (from === 'NEAR' || !token.addresses.ETH) return;
    const signer = await window.ethWeb3Provider?.getSigner();
    const erc20Contract = new ethers.Contract(
      token.addresses.ETH,
      erc20Abi,
      signer
    );
    const amountIn = new Big(amount).times(10 ** token.decimals).toFixed();
    const tx = await erc20Contract.approve(
      BridgeParams.erc20LockerAddress,
      amountIn
    );
    await tx.wait();
  },
  getBridgeInstance({
    token,
    from,
  }: {
    token: BridgeModel.BridgeTokenMeta;
    from: BridgeModel.BridgeSupportChain;
  }) {
    if (from === 'NEAR' && !token.addresses.ETH && token.symbol === 'ETH')
      return { bridgedETH };
    //   nep141 to eth
    else if (
      from === 'NEAR' &&
      !!token.addresses.NEAR &&
      !!token.addresses.ETH &&
      token.symbol !== 'NEAR'
    )
      return { bridgedNep141 };
    else if (from === 'NEAR' && token.symbol === 'NEAR') return { naturalNEAR };
    //   erc20 to nep141
    else if (
      from === 'ETH' &&
      !!token.addresses.ETH &&
      !!token.addresses.NEAR &&
      token.symbol !== 'NEAR'
    )
      return { naturalErc20 };
    else if (from === 'ETH' && token.symbol === 'NEAR') return { bridgedNEAR };
    else if (from === 'ETH' && !token.addresses.ETH && token.symbol === 'ETH')
      return { naturalETH };
  },
  async transfer({
    token,
    amount: amountIn,
    sender,
    from,
    recipient,
    nearWalletSelector,
  }: {
    token: BridgeModel.BridgeTokenMeta;
    amount: string;
    sender: string;
    from: BridgeModel.BridgeSupportChain;
    recipient: string;
    nearWalletSelector?: WalletSelector;
  }) {
    const isApproved = await rainbowBridgeService.checkApprove({
      token,
      amount: amountIn,
      from,
      sender,
    });
    if (!isApproved) {
      await rainbowBridgeService.approve({
        token,
        amount: amountIn,
        from,
      });
    }
    const nearAccount = (await nearWalletSelector.wallet()) as any;

    const amount = new Big(amountIn).times(10 ** token.decimals).toFixed();
    console.log('amount', amount);

    const instance = rainbowBridgeService.getBridgeInstance({ token, from });
    console.log('instance', instance, {
      token,
      from,
      amount,
      sender,
      recipient,
    });
    if (instance.bridgedETH)
      return instance.bridgedETH.sendToEthereum({
        amount,
        recipient: sender,
        options: {
          nearAccount,
        },
      });
    else if (instance.bridgedNep141)
      return instance.bridgedNep141.sendToEthereum({
        erc20Address: token.addresses.ETH,
        amount,
        recipient: sender,
        options: {
          ...token,
          nep141Address: token.addresses.NEAR,
          nearAccount,
        },
      });
    else if (instance.naturalNEAR)
      return instance.naturalNEAR.sendToEthereum({
        recipient: sender,
        amount,
        options: {
          nearAccount,
        },
      });
    else if (instance.naturalErc20)
      return instance.naturalErc20.sendToNear({
        erc20Address: token.addresses.ETH,
        amount,
        recipient,
      });
    else if (instance.bridgedNEAR)
      return instance.bridgedNEAR.sendToNear({
        amount,
        recipient,
      });
    else if (instance.naturalETH)
      return instance.naturalETH.sendToNear({
        amount,
        recipient,
      });
  },
};

export default rainbowBridgeService;
