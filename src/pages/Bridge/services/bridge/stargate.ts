import {
  auroraAddr,
  auroraCallToAction,
  buildInput,
  toAddress,
} from 'src/services/aurora/aurora';
import {
  auroraServices,
  evmServices,
  nearServices,
  tokenServices,
} from '../contract';
import StargateAbi from '../../abi/stargate.json';
import StargatePoolAbi from '../../abi/stargatePoolUSDC.json';
import { BridgeTransferParams } from '.';
import { BigNumber, ethers } from 'ethers';
import { formatAmount, parseAmount } from '../../utils/format';
import { logger } from '../../utils/common';
import { Optional, Transaction } from '@near-wallet-selector/core';
import { BridgeConfig } from '../../config';
import { getTokenMeta } from '../../utils/token';
import Big from 'big.js';
import { startCase } from 'lodash';

const stargateBridgeService = {
  auroraReceiveContract: null as any,
  async initAuroraReceiveContract() {
    if (!stargateBridgeService.auroraReceiveContract) {
      stargateBridgeService.auroraReceiveContract =
        await auroraServices.getAuroraContract(
          BridgeConfig.Stargate.bridgeParams.Aurora.receive,
          StargateAbi
        );
    }
    return stargateBridgeService.auroraReceiveContract;
  },

  transfer(params: BridgeTransferParams) {
    if (params.to === 'NEAR') {
      return stargateBridgeService.evmToNear(params);
    } else {
      return stargateBridgeService.nearToEvm(params);
    }
  },
  async query(params: BridgeTransferParams): Promise<{
    //not contain slippage
    minAmount: string;
    readableMinAmount: string;
    //contain slippage
    minAmountWithSlippage: string;
    readableMinAmountWithSlippage: string;

    feeAmount: string;
    readableFeeAmount: string;
    usdFee: string;
    protocolFee: string;
    readableProtocolFee?: string;
    discounted: boolean;
    sendParam: any;
    messagingFee: any;
    valueToSend: string;
    insufficientFeeBalance?: boolean;
  }> {
    if (!params.amount) return;
    if (params.from === 'NEAR') {
      const { discountedFeeUSD, fullFeeUSD } =
        await stargateBridgeService.queryFeeUSD(params);
      const { discounted } = await stargateBridgeService.queryDiscount(params);
      const feeAmount = discounted
        ? discountedFeeUSD.toString()
        : fullFeeUSD.toString();
      logger.log('feeAmount', feeAmount);
      const readableFeeAmount = formatAmount(
        feeAmount,
        params.tokenIn.decimals
      );
      logger.log('readableFeeAmount', readableFeeAmount);
      const usdFee = readableFeeAmount;
      if (Number(params.amount) < Number(readableFeeAmount))
        return {
          minAmount: '0',
          readableMinAmount: '0',
          minAmountWithSlippage: '0',
          readableMinAmountWithSlippage: '0',
          feeAmount,
          readableFeeAmount,
          usdFee,
          protocolFee: '0',
          readableProtocolFee: '0',
          discounted,
          sendParam: {},
          messagingFee: {},
          valueToSend: '0',
        };
      else {
        const { sendParam, messagingFee, valueToSend } =
          await stargateBridgeService.prepareTakeTaxiStargate(
            params,
            discounted ? 'prepareDiscountTransaction' : 'orchestrateTransaction'
          );
        const sendContract =
          await stargateBridgeService.initAuroraReceiveContract();
        const contractFeeBalance = await sendContract.getContractEthBalance();
        logger.log('contractFeeBalance', formatAmount(contractFeeBalance, 18));
        logger.log('messagingFee', formatAmount(messagingFee.nativeFee, 18));
        const insufficientFeeBalance = contractFeeBalance.lt(
          messagingFee.nativeFee
        );
        const minAmount = new Big(sendParam.amountLD.toString())
          .times(
            1 - BridgeConfig.Stargate.bridgeParams[params.to].protocolFeeRatio
          )
          .toFixed(0);
        const protocolFee = new Big(sendParam.amountLD.toString())
          .times(BridgeConfig.Stargate.bridgeParams.Aurora.protocolFeeRatio)
          .toFixed(0);
        const readableProtocolFee = formatAmount(
          protocolFee,
          params.tokenOut.decimals
        );
        const minAmountWithSlippage = new Big(sendParam.minAmountLD.toString())
          .times(1 - params.slippage)
          .toFixed(0);
        logger.log('amountLD', sendParam.amountLD.toString());
        logger.log('minAmount', minAmount);
        logger.log('minAmountWithSlippage', minAmountWithSlippage);
        logger.log('origin minAmountLD', sendParam.minAmountLD.toString());
        const newSendParam = { ...sendParam };
        newSendParam.minAmountLD = BigNumber.from(minAmountWithSlippage);
        const readableMinAmount = formatAmount(
          minAmount,
          params.tokenIn.decimals
        );
        const readableMinAmountWithSlippage = formatAmount(
          minAmountWithSlippage,
          params.tokenIn.decimals
        );
        return {
          minAmount,
          readableMinAmount,
          minAmountWithSlippage,
          readableMinAmountWithSlippage,
          feeAmount,
          readableFeeAmount,
          usdFee,
          protocolFee,
          readableProtocolFee,
          discounted,
          sendParam: newSendParam,
          messagingFee,
          valueToSend,
          insufficientFeeBalance,
        };
      }
    } else {
      const { sendParam, messagingFee, valueToSend } =
        await stargateBridgeService.prepareTakeTaxiStargate(params);

      const { nativeFee, lzTokenFee } = messagingFee;
      const feeAmount = new Big(nativeFee).plus(lzTokenFee).toString();
      const readableFeeAmount = formatAmount(
        feeAmount,
        getTokenMeta('ETH').decimals
      );
      const ethPriceInUSD = await tokenServices.getPrice(getTokenMeta('ETH'));
      const usdFee = new Big(readableFeeAmount).times(ethPriceInUSD).toString();
      const newSendParam = { ...sendParam };
      const minAmount = new Big(sendParam.amountLD.toString())
        .times(
          1 - BridgeConfig.Stargate.bridgeParams[params.from].protocolFeeRatio
        )
        .toFixed(0);

      const protocolFee = new Big(sendParam.amountLD.toString())
        .times(BridgeConfig.Stargate.bridgeParams.Aurora.protocolFeeRatio)
        .toFixed(0);
      const readableProtocolFee = formatAmount(
        protocolFee,
        params.tokenOut.decimals
      );
      const minAmountWithSlippage = new Big(sendParam.minAmountLD.toString())
        .times(1 - params.slippage)
        .toFixed(0);
      newSendParam.minAmountLD = BigNumber.from(minAmountWithSlippage);
      logger.log('amountLD', sendParam.amountLD.toString());
      logger.log('minAmount', minAmount);
      logger.log('minAmountWithSlippage', minAmountWithSlippage);
      logger.log('origin minAmountLD', sendParam.minAmountLD.toString());
      const readableMinAmount = formatAmount(
        minAmount,
        params.tokenIn.decimals
      );
      const readableMinAmountWithSlippage = formatAmount(
        minAmountWithSlippage,
        params.tokenIn.decimals
      );

      return {
        minAmount,
        readableMinAmount,
        minAmountWithSlippage,
        readableMinAmountWithSlippage,
        feeAmount,
        readableFeeAmount,
        usdFee,
        protocolFee,
        readableProtocolFee,
        discounted: false,
        sendParam: newSendParam,
        messagingFee,
        valueToSend,
      };
    }
  },
  //cacheFeeUSD key fromChain_toChain_symbol
  cacheFeeUSD: {} as Record<
    string,
    { discountedFeeUSD: string; fullFeeUSD: string } | undefined
  >,
  async queryFeeUSD(params: BridgeTransferParams) {
    const cacheKey = `${params.from}_${params.to}_${params.tokenIn.symbol}`;
    if (stargateBridgeService.cacheFeeUSD[cacheKey])
      return { ...stargateBridgeService.cacheFeeUSD[cacheKey] };
    const { messagingFee } =
      await stargateBridgeService.prepareTakeTaxiStargate(params);

    const chainId = BridgeConfig.Stargate.bridgeParams[params.to].eid;
    const sendContract =
      await stargateBridgeService.initAuroraReceiveContract();
    const { discountedFeeUSD, fullFeeUSD } = await sendContract.calculateFee(
      messagingFee.nativeFee,
      chainId
    );
    logger.log('discountedFeeUSD', discountedFeeUSD.toString());
    logger.log('fullFeeUSD', fullFeeUSD.toString());

    stargateBridgeService.cacheFeeUSD[cacheKey] = {
      discountedFeeUSD,
      fullFeeUSD,
    };

    return { discountedFeeUSD, fullFeeUSD };
  },
  //cacheDiscount key fromChain_toChain_symbol
  cacheDiscount: {} as Record<string, { discounted: boolean }>,
  async queryDiscount(params: BridgeTransferParams) {
    const cacheKey = `${params.from}_${params.to}_${params.tokenIn.symbol}`;
    if (stargateBridgeService.cacheDiscount[cacheKey])
      return stargateBridgeService.cacheDiscount[cacheKey];

    const chainId = BridgeConfig.Stargate.bridgeParams[params.to].eid;
    const sendContract =
      await stargateBridgeService.initAuroraReceiveContract();
    const [discountPools, { messagingFee }] = await Promise.all([
      sendContract.discountPools(chainId),
      stargateBridgeService.prepareTakeTaxiStargate(
        params,
        'prepareDiscountTransaction'
      ),
    ]);
    const calculateDiscount = await sendContract.calculateDiscount(
      messagingFee.nativeFee,
      chainId
    );
    logger.log('discountPools', discountPools.toString());
    logger.log('calculateDiscount', calculateDiscount.toString());

    const discounted = discountPools.gt(calculateDiscount);
    logger.log('discounted', discounted);
    stargateBridgeService.cacheDiscount[cacheKey] = { discounted };
    return { discounted };
  },

  async prepareTakeTaxiStargate(
    params: BridgeTransferParams,
    method:
      | 'prepareTakeTaxiStargate'
      | 'prepareDiscountTransaction'
      | 'orchestrateTransaction' = 'prepareTakeTaxiStargate'
  ) {
    const { from, to, tokenIn, amount, recipient } = params;
    const rawAmount = parseAmount(amount, tokenIn.decimals);
    if (from === 'NEAR') {
      try {
        const chainId = BridgeConfig.Stargate.bridgeParams[to].eid;
        const sendContract =
          await stargateBridgeService.initAuroraReceiveContract();
        logger.log(`${method} params`, [chainId, rawAmount, recipient, `0x`]);
        const params = await sendContract[method](
          chainId,
          rawAmount,
          recipient || BridgeConfig.Stargate.bridgeParams.Aurora.receive,
          `0x`
        );
        if (method === 'prepareTakeTaxiStargate') {
          const { valueToSend, sendParam, messagingFee } = params;
          return { valueToSend, sendParam, messagingFee };
        } else {
          const [valueToSend, sendParam, messagingFee] = params;
          return { valueToSend, sendParam, messagingFee };
        }
      } catch (error) {
        console.error(method, error);
        return {};
      }
    } else {
      const sendContract = await evmServices.getEvmContract(
        BridgeConfig.Stargate.bridgeParams[from].send,
        StargateAbi,
        'view',
        from
      );

      const { valueToSend, sendParam, messagingFee } =
        await sendContract.prepareTakeTaxiStargate(
          BridgeConfig.Stargate.bridgeParams.Aurora.eid,
          rawAmount,
          BridgeConfig.Stargate.bridgeParams.Aurora.receive,
          `0x${Buffer.from(recipient || '', 'utf-8').toString('hex')}`
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
    if (
      [
        'ledger',
        'near-mobile-wallet',
        'okx-wallet',
        'mintbase-wallet',
        'neth',
      ].includes(window.nearWallet.id)
    ) {
      throw new Error(
        `${startCase(
          window.nearWallet.id
        )} is not supported for this bridge, please use other wallet.`
      );
    }
    const { from, tokenIn, amount, sender } = params;
    const auroraAccount = auroraAddr(sender);
    const nearTokenAddress = tokenIn.addresses.NEAR;
    const auroraTokenAddress = tokenIn.addresses.Aurora;
    const rawTotalAmount = parseAmount(amount, tokenIn.decimals);

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

    const auroraTransaction: Optional<Transaction, 'signerId'> = {
      receiverId: 'aurora',
      signerId: sender,
      actions: [],
    };
    if (tokenIn.symbol !== 'ETH') {
      const actionParams = await auroraServices.checkErc20Approve(
        auroraAccount,
        auroraTokenAddress,
        BridgeConfig.Stargate.bridgeParams.Aurora.receive,
        formatAmount(rawTotalAmount, tokenIn.decimals),
        tokenIn.decimals
      );
      if (actionParams)
        auroraTransaction.actions.push({
          type: 'FunctionCall',
          params: actionParams as any,
        });
    }

    const { discounted, messagingFee, sendParam } =
      await stargateBridgeService.query(params);

    const sendInput = buildInput(
      StargateAbi,
      discounted ? 'sendStargateWithDiscount' : 'sendStargate',
      [sendParam, messagingFee, auroraAccount, rawTotalAmount]
    );
    const sendActionParams = auroraCallToAction(
      toAddress(BridgeConfig.Stargate.bridgeParams.Aurora.receive),
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
    if (Array.isArray(res)) {
      const transaction = res.find(
        (item) =>
          item.transaction.receiver_id === 'aurora' &&
          item.transaction.actions?.[0]?.FunctionCall?.method_name === 'call'
      );
      logger.log('bridge: send success', res);
      logger.log('bridge: send success2', transaction);
      return transaction?.transaction.hash;
    }
  },
  async evmToNear(params: BridgeTransferParams) {
    const { tokenIn, tokenOut, amount, sender, recipient, from } = params;
    const registerTokenTransaction = await nearServices.checkFTStorageBalance(
      tokenOut.addresses.NEAR,
      recipient
    );
    if (registerTokenTransaction) {
      await nearServices.sendTransaction(registerTokenTransaction);
    }
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
      await stargateBridgeService.query(params);

    const stargatePoolContract = await evmServices.getEvmContract(
      poolAddress,
      StargatePoolAbi,
      'call'
    );
    const tx = await stargatePoolContract.send(
      sendParam,
      messagingFee,
      sender,
      { value: valueToSend, gasLimit: ethers.utils.hexlify(1000000) }
    );
    await tx.wait();
    console.log('bridge: send success', tx);
    return tx?.hash as string;
  },
};

export default stargateBridgeService;
