import Big from 'big.js';
import {
  auroraAddr,
  auroraCallToAction,
  buildInput,
  toAddress,
} from 'src/services/aurora/aurora';
import { auroraServices, evmServices } from '../contract';
import StargateAbi from '../../abi/stargate.json';
import StargatePoolAbi from '../../abi/stargatePoolUSDC.json';
import { BridgeTransferParams } from '.';
import { ethers } from 'ethers';
import { formatAmount, parseAmount } from '../../utils/format';
import { logger } from '../../utils/common';
import { Optional, Transaction } from '@near-wallet-selector/core';
import { BridgeConfig } from '../../config';

const stargateBridgeService = {
  async transfer(params: BridgeTransferParams) {
    if (params.to === 'NEAR') {
      return await stargateBridgeService.evmToNear(params);
    } else {
      return await stargateBridgeService.nearToEvm(params);
    }
  },
  async queryFee(
    from: BridgeModel.BridgeSupportChain,
    token: BridgeModel.BridgeTokenMeta
  ) {
    if (from === 'NEAR') {
      const sendContract = await auroraServices.getAuroraContract(
        BridgeConfig.Stargate.bridgeParams.auroraReceive,
        StargateAbi
      );
      const discountPoolETH: Big = await sendContract.discountPoolETH();
      const decrementPerTransactionETH: Big =
        await sendContract.decrementPerTransactionETH();
      logger.log('discountPoolETH', discountPoolETH);
      logger.log('decrementPerTransactionETH', decrementPerTransactionETH);
      if (discountPoolETH.gte(decrementPerTransactionETH)) {
        const discountedFeeUSD: Big = await sendContract.discountedFeeUSD();
        return {
          fee: discountedFeeUSD.toString(),
          readableFee: formatAmount(
            discountedFeeUSD.toString(),
            token.decimals
          ),
          usdFee: formatAmount(discountedFeeUSD.toString(), token.decimals),
          discounted: true,
        };
      } else {
        const currentFeeUSD: Big = await sendContract.currentFeeUSD();
        return {
          fee: currentFeeUSD.toString(),
          readableFee: formatAmount(currentFeeUSD.toString(), token.decimals),
          usdFee: formatAmount(currentFeeUSD.toString(), token.decimals),
          discounted: false,
        };
      }
    }
  },
  async nearToEvm({
    from,
    to,
    tokenIn,
    tokenOut,
    amount,
    sender,
    recipient,
  }: BridgeTransferParams) {
    const auroraAccount = auroraAddr(sender);
    const nearTokenAddress = tokenIn.addresses.NEAR;
    const auroraTokenAddress = tokenIn.addresses.Aurora;
    const rawAmount = parseAmount(amount, tokenIn.decimals);
    const { fee: rawFeeAmount, discounted } =
      await stargateBridgeService.queryFee(from, tokenIn);
    logger.log('bridge: queryFee', { rawAmount, rawFeeAmount, discounted });
    const rawTotalAmount = Big(rawAmount).plus(rawFeeAmount).toFixed();

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

    const sendContract = await auroraServices.getAuroraContract(
      BridgeConfig.Stargate.bridgeParams.auroraReceive,
      StargateAbi
    );
    try {
      const { valueToSend, sendParam, messagingFee } =
        await sendContract.prepareTakeTaxiStargate(
          BridgeConfig.Stargate.bridgeParams[to].eid,
          rawAmount,
          recipient,
          `0x`
        );

      logger.log('bridge: send params', [
        sendParam,
        messagingFee,
        auroraAccount,
        rawTotalAmount,
      ]);
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
    } catch (error) {
      console.error(error);
    }
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

    const rawAmount = ethers.utils
      .parseUnits(amount, tokenIn.decimals)
      .toString();

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
    logger.log('bridge: stargate prepareTakeTaxiStargate', {
      valueToSend,
      sendParam,
      messagingFee,
    });
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
