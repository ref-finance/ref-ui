import Big from 'big.js';
import {
  auroraAddr,
  auroraCallToAction,
  buildInput,
  toAddress,
} from 'src/services/aurora/aurora';
import { auroraServices, evmServices, tokenServices } from '../contract';
import StargateAbi from '../../abi/stargate.json';
import StargatePoolAbi from '../../abi/stargatePoolUSDC.json';
import { BridgeTransferParams } from '.';
import { ethers } from 'ethers';
import { formatAmount, parseAmount } from '../../utils/format';
import { logger } from '../../utils/common';
import { Optional, Transaction } from '@near-wallet-selector/core';
import { BridgeConfig } from '../../config';
import { getTokenMeta } from '../../utils/token';

const stargateBridgeService = {
  auroraReceiveContract: null as any,
  async initAuroraReceiveContract() {
    if (!stargateBridgeService.auroraReceiveContract) {
      stargateBridgeService.auroraReceiveContract =
        await auroraServices.getAuroraContract(
          BridgeConfig.Stargate.bridgeParams.auroraReceive,
          StargateAbi
        );
    }
    return stargateBridgeService.auroraReceiveContract;
  },
  async transfer(params: BridgeTransferParams) {
    if (params.to === 'NEAR') {
      return await stargateBridgeService.evmToNear(params);
    } else {
      return await stargateBridgeService.nearToEvm(params);
    }
  },
  async query(params: BridgeTransferParams) {
    if (new Big(params.amount || 0).eq(0)) return;
    const res = await Promise.all([
      stargateBridgeService.queryFee(params),
      stargateBridgeService.queryMinAmount(params),
    ]);
    return { ...res[0], minAmount: res[1] };
  },
  async queryFee(params: BridgeTransferParams) {
    if (params.from === 'NEAR') {
      const sendContract =
        await stargateBridgeService.initAuroraReceiveContract();

      const res = await Promise.allSettled<[Big, Big, Big, Big]>([
        sendContract.discountPoolETH(),
        sendContract.decrementPerTransactionETH(),
        sendContract.discountedFeeUSD(),
        sendContract.currentFeeUSD(),
      ]);
      const [
        discountPoolETH,
        decrementPerTransactionETH,
        discountedFeeUSD,
        currentFeeUSD,
      ] = res.map((r) => (r as PromiseFulfilledResult<Big>).value);

      if (discountPoolETH.gte(decrementPerTransactionETH)) {
        return {
          feeAmount: discountedFeeUSD.toString(),
          readableFeeAmount: formatAmount(
            discountedFeeUSD.toString(),
            params.tokenOut.decimals
          ),
          usdFee: formatAmount(
            discountedFeeUSD.toString(),
            params.tokenOut.decimals
          ),
          discounted: true,
        };
      } else {
        return {
          feeAmount: currentFeeUSD.toString(),
          readableFeeAmount: formatAmount(
            currentFeeUSD.toString(),
            params.tokenOut.decimals
          ),
          usdFee: formatAmount(
            currentFeeUSD.toString(),
            params.tokenOut.decimals
          ),
          discounted: false,
        };
      }
    } else {
      const { messagingFee } =
        await stargateBridgeService.prepareTakeTaxiStargate(params);
      console.log('messagingFee.nativeFee', messagingFee.nativeFee);
      const { nativeFee, lzTokenFee } = messagingFee;
      const feeAmount = new Big(nativeFee).plus(lzTokenFee).toString();
      const readableFeeAmount = formatAmount(
        feeAmount,
        getTokenMeta('ETH').decimals
      );
      const ethPriceInUSD = await tokenServices.getPrice(getTokenMeta('ETH'));
      const usdFee = new Big(readableFeeAmount).times(ethPriceInUSD).toFixed(4);
      return {
        feeAmount,
        readableFeeAmount,
        usdFee,
        discounted: false,
      };
    }
  },
  async queryMinAmount(params: BridgeTransferParams) {
    const res = await stargateBridgeService.prepareTakeTaxiStargate(params);
    return res?.sendParam?.minAmountLD?.toString();
  },
  async prepareTakeTaxiStargate(params: BridgeTransferParams) {
    const { from, to, tokenIn, amount, recipient } = params;
    const rawAmount = parseAmount(amount, tokenIn.decimals);
    if (from === 'NEAR') {
      const sendContract =
        await stargateBridgeService.initAuroraReceiveContract();

      const { valueToSend, sendParam, messagingFee } =
        await sendContract.prepareTakeTaxiStargate(
          BridgeConfig.Stargate.bridgeParams[to].eid,
          rawAmount,
          recipient,
          `0x`
        );
      logger.log('prepareTakeTaxiStargate', {
        valueToSend,
        sendParam,
        messagingFee,
      });
      return { valueToSend, sendParam, messagingFee };
    } else {
      const sendContract = await evmServices.getEvmContract(
        BridgeConfig.Stargate.bridgeParams[from].send,
        StargateAbi
      );
      const { valueToSend, sendParam, messagingFee } =
        await sendContract.prepareTakeTaxiStargate(
          BridgeConfig.Stargate.bridgeParams.Aurora.eid,
          rawAmount,
          BridgeConfig.Stargate.bridgeParams.auroraReceive,
          `0x${Buffer.from(recipient, 'utf-8').toString('hex')}`
        );
      logger.log('prepareTakeTaxiStargate', {
        valueToSend,
        sendParam,
        messagingFee,
      });
      return { valueToSend, sendParam, messagingFee };
    }
  },
  async nearToEvm(params: BridgeTransferParams) {
    const { from, tokenIn, amount, sender } = params;
    const auroraAccount = auroraAddr(sender);
    const nearTokenAddress = tokenIn.addresses.NEAR;
    const auroraTokenAddress = tokenIn.addresses.Aurora;
    const rawAmount = parseAmount(amount, tokenIn.decimals);
    const { feeAmount, discounted } = await stargateBridgeService.queryFee(
      params
    );
    logger.log('bridge: queryFee', { rawAmount, feeAmount, discounted });
    const rawTotalAmount = Big(rawAmount).plus(feeAmount).toFixed();

    const transferTransaction = {
      receiverId: nearTokenAddress,
      signerId: sender,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'ft_transfer_call',
            args: {
              receiver_id: 'aurora',
              amount: rawTotalAmount,
              msg:
                (tokenIn.symbol === 'ETH'
                  ? `${auroraAccount}:${'0'.repeat(64)}`
                  : '') + `${auroraAccount.substring(2)}`,
            },
            gas: '300000000000000',
            deposit: '1',
          },
        },
      ],
    } as Transaction;

    logger.log('transferTransaction', transferTransaction);
    const auroraTransaction: Optional<Transaction, 'signerId'> = {
      receiverId: 'aurora',
      signerId: sender,
      actions: [],
    };
    if (tokenIn.symbol !== 'ETH') {
      const actionParams = await auroraServices.checkErc20Approve(
        auroraAccount,
        auroraTokenAddress,
        BridgeConfig.Stargate.bridgeParams.auroraReceive,
        formatAmount(rawTotalAmount, tokenIn.decimals),
        tokenIn.decimals
      );
      if (actionParams)
        auroraTransaction.actions.push({
          type: 'FunctionCall',
          params: actionParams as any,
        });
    }
    const { valueToSend, sendParam, messagingFee } =
      await stargateBridgeService.prepareTakeTaxiStargate(params);

    const sendInput = buildInput(
      StargateAbi,
      discounted ? 'sendStargateWithDiscount' : 'sendStargate',
      [sendParam, messagingFee, auroraAccount, rawTotalAmount]
    );
    logger.log('bridge: sendInput', sendInput);
    logger.log('bridge: valueToSend', valueToSend);
    const sendActionParams = auroraCallToAction(
      toAddress(BridgeConfig.Stargate.bridgeParams.auroraReceive),
      sendInput
      // valueToSend
    );
    auroraTransaction.actions.push({
      type: 'FunctionCall',
      params: sendActionParams as any,
    });
    logger.log('bridge: send params', {
      transactions: [transferTransaction, auroraTransaction].filter(Boolean),
    });
    const res = await window.nearWallet.signAndSendTransactions({
      transactions: [transferTransaction, auroraTransaction],
    });
    logger.log('bridge: send success', res);
    return res;
  },
  async evmToNear(params: BridgeTransferParams) {
    const { tokenIn, tokenOut, amount, sender, recipient, from } = params;
    const erc20Address = tokenIn.addresses[from];
    const poolAddress =
      BridgeConfig.Stargate.bridgeParams[from].pool[tokenOut.symbol];
    if (!poolAddress) throw new Error('Invalid pool address');
    await evmServices.checkErc20Approve({
      token: erc20Address,
      amount,
      owner: sender,
      spender: poolAddress,
    });

    const { valueToSend, sendParam, messagingFee } =
      await stargateBridgeService.prepareTakeTaxiStargate(params);

    const stargatePoolContract = await evmServices.getEvmContract(
      poolAddress,
      StargatePoolAbi
    );
    const tx2 = await stargatePoolContract.send(
      sendParam,
      messagingFee,
      sender,
      { value: valueToSend, gasLimit: ethers.utils.hexlify(3000000) }
    );
    await tx2.wait();
    logger.log('bridge: stargate sendStargate', tx2);
  },
};

export default stargateBridgeService;
