import {
  bridgedETH,
  bridgedNEAR,
  naturalETH,
  naturalNEAR,
} from '@near-eth/near-ether';
import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20';
import Big from 'big.js';
import type { WalletSelector } from '@near-wallet-selector/core';
import { BridgeConfig } from '../config';
import { ethServices } from './contract';
import { decorate, get, Transfer } from '@near-eth/client';

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
    const erc20Contract = await ethServices.getErc20Contract(
      token.addresses.ETH
    );
    const allowance = await erc20Contract.allowance(
      sender,
      BridgeConfig.Rainbow.bridgeParams.erc20LockerAddress
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
    const erc20Contract = await ethServices.getErc20Contract(
      token.addresses.ETH
    );
    const amountIn = new Big(amount).times(10 ** token.decimals).toFixed();
    const tx = await erc20Contract.approve(
      BridgeConfig.Rainbow.bridgeParams.erc20LockerAddress,
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

    const instance = rainbowBridgeService.getBridgeInstance({ token, from });
    console.log('rainbow bridge instance', instance);
    console.log('rainbow bridge params', {
      token,
      from,
      amount,
      sender,
      recipient,
    });
    let result;
    if (instance.bridgedETH)
      result = await instance.bridgedETH.sendToEthereum({
        amount,
        recipient,
        options: {
          sender,
          nearAccount,
        },
      });
    else if (instance.bridgedNep141)
      result = await instance.bridgedNep141.sendToEthereum({
        erc20Address: token.addresses.ETH,
        amount,
        recipient,
        options: {
          sender,
          ...token,
          nep141Address: token.addresses.NEAR,
          nearAccount,
        },
      });
    else if (instance.naturalNEAR)
      result = await instance.naturalNEAR.sendToEthereum({
        recipient,
        amount,
        options: {
          sender,
          nearAccount,
        },
      });
    else if (instance.naturalErc20)
      result = await instance.naturalErc20.sendToNear({
        erc20Address: token.addresses.ETH,
        amount,
        recipient,
        options: {
          sender,
        },
      });
    else if (instance.bridgedNEAR)
      result = await instance.bridgedNEAR.sendToNear({
        amount,
        recipient,
        options: {
          sender,
        },
      });
    else if (instance.naturalETH)
      result = await instance.naturalETH.sendToNear({
        amount,
        recipient,
        options: {
          sender,
        },
      });
    if (result) return rainbowBridgeService.transformRawData(result);
  },
  async query(params?: Parameters<typeof get>[number]) {
    const result = await get(params);
    const sortedResult =
      (result as BridgeModel.BridgeTransaction[])?.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ) ?? [];

    const decodedResult = sortedResult.map((item) =>
      rainbowBridgeService.transformRawData(item)
    );
    console.log('decodedResult', decodedResult);
    return decodedResult as BridgeModel.BridgeTransaction[];
  },
  async getById(id: string) {
    const result = await rainbowBridgeService.query({
      filter: (t) => t.id === id,
    });
    return result?.[0];
  },
  transformRawData(data: Transfer) {
    try {
      const result = decorate(data, {
        locale: 'en_US',
      }) as BridgeModel.BridgeTransaction;
      if (result.callToAction === 'Deposit') result.callToAction = 'Claim';
      return result;
    } catch (error) {
      console.error(error);
      return data as BridgeModel.BridgeTransaction;
    }
  },
};

export default rainbowBridgeService;
