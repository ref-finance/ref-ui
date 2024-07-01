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
import { parseAmount } from '../../utils/format';
import { logger } from '../../utils/common';
import { Optional, Transaction } from '@near-wallet-selector/core';

const stargateBridgeParams = {
  Arbitrum: {
    send: '0x9affc062e3cbe2806334355b92059e3d8f4c4657',
    pool: {
      USDC: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
    },
    eid: '30110',
  },
  Ethereum: {
    send: '0x3B693e0F2f5f5e0b819e669b60A715858dCb6C07',
    pool: {
      USDC: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
    },
    eid: '30101',
  },
  Aurora: {
    pool: {
      USDC: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
    },
    eid: '30211',
  },
  EndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
  auroraReceive: '0x50BA119cC15ef0a5F8df355AdA5bC53Cf6C5cc94',
};

const stargateBridgeService = {
  async transfer(params: BridgeTransferParams) {
    if (params.to === 'NEAR') {
      return await stargateBridgeService.evmToNear(params);
    } else {
      return await stargateBridgeService.nearToEvm(params);
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
    const parsedAmount = parseAmount(amount, tokenIn.decimals);
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
              amount: parsedAmount,
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

    console.log('transferTransaction', transferTransaction);
    const auroraTransaction: Optional<Transaction, 'signerId'> = {
      receiverId: 'aurora',
      signerId: sender,
      actions: [],
    };
    if (tokenIn.symbol !== 'ETH') {
      const actionParams = await auroraServices.checkErc20Approve(
        auroraAccount,
        auroraTokenAddress,
        stargateBridgeParams.Aurora.pool[tokenOut.symbol],
        amount,
        tokenIn.decimals
      );
      if (actionParams)
        auroraTransaction.actions.push({
          type: 'FunctionCall',
          params: actionParams as any,
        });
    }

    const sendContract = await auroraServices.getAuroraContract(
      stargateBridgeParams.auroraReceive,
      StargateAbi
    );
    logger.log(
      'prepareTakeTaxiStargate:',
      stargateBridgeParams.auroraReceive,
      'prepareTakeTaxiStargate params:',
      stargateBridgeParams[to].eid,
      parsedAmount,
      recipient,
      `0x`
    );
    try {
      const { valueToSend, sendParam, messagingFee } =
        await sendContract.prepareTakeTaxiStargate(
          stargateBridgeParams[to].eid,
          parsedAmount,
          recipient,
          `0x`
        );
      logger.log('bridge: stargate prepareTakeTaxiStargate', {
        valueToSend,
        sendParam,
        messagingFee,
      });
      const sendInput = buildInput(StargatePoolAbi, 'send', [
        sendParam,
        messagingFee,
        auroraAccount,
      ]);
      logger.log('bridge: sendInput', sendInput);
      logger.log('bridge: valueToSend', valueToSend);
      const sendActionParams = auroraCallToAction(
        toAddress(stargateBridgeParams.Aurora.pool[tokenOut.symbol]),
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
      console.error('prepareTakeTaxiStargate error', error);
    }
  },
  async evmToNear(params: BridgeTransferParams) {
    const { tokenIn, tokenOut, amount, sender, recipient, from } = params;
    const erc20Address = tokenIn.addresses[from];
    const poolAddress = stargateBridgeParams[from].pool[tokenOut.symbol];
    if (!poolAddress) throw new Error('Invalid pool address');
    await evmServices.checkErc20Approve({
      token: erc20Address,
      amount,
      owner: sender,
      spender: poolAddress,
    });

    const amountIn = ethers.utils
      .parseUnits(amount, tokenIn.decimals)
      .toString();

    const sendContract = await evmServices.getEvmContract(
      stargateBridgeParams[from].send,
      StargateAbi
    );

    const { valueToSend, sendParam, messagingFee } =
      await sendContract.prepareTakeTaxiStargate(
        stargateBridgeParams.Aurora.eid,
        amountIn,
        stargateBridgeParams.auroraReceive,
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
