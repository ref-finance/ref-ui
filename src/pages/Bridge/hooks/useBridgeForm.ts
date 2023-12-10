import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import useBridgeToken from './useBridgeToken';
import {
  useAsyncMemo,
  useDebouncedEffect,
  useStorageState,
  useTime,
} from './useHooks';
import Big from 'big.js';
import { ethServices, tokenServices } from '../services/contract';
import { BridgeConfig, SupportChains } from '../config';

export default function useBridgeForm() {
  const { getTokenBySymbol } = useBridgeToken();

  const [storageState, setStorageState] = useStorageState<{
    fromChain: BridgeModel.BridgeSupportChain;
    toChain: BridgeModel.BridgeSupportChain;
    fromToken: string;
    toToken: string;
  }>('REF_BRIDGE_FORM');

  const [bridgeFromValue, setBridgeFromValue] = useState<
    BridgeModel.BridgeTransferFormData['from']
  >(() => ({
    chain: storageState?.fromChain ?? 'ETH',
    tokenMeta: getTokenBySymbol(storageState?.fromToken ?? 'ETH'),
    amount: undefined,
  }));

  const [bridgeToValue, setBridgeToValue] = useState<
    BridgeModel.BridgeTransferFormData['to']
  >(() => ({
    chain: storageState?.toChain ?? 'NEAR',
    tokenMeta: getTokenBySymbol(storageState?.toToken ?? 'ETH'),
    amount: undefined,
    isCustomAccountAddress: false,
    customAccountAddress: undefined,
  }));

  const walletCxt = useWalletConnectContext();

  useDebouncedEffect(
    () => {
      const fromValue = { ...bridgeFromValue };
      const toValue = { ...bridgeToValue };

      // sync account address
      if (walletCxt?.[fromValue.chain]?.accountId)
        fromValue.accountAddress = walletCxt?.[fromValue.chain]?.accountId;
      if (walletCxt?.[bridgeToValue.chain]?.accountId)
        toValue.accountAddress = walletCxt?.[bridgeToValue.chain]?.accountId;

      // sync local storage
      if (bridgeFromValue.chain !== bridgeToValue.chain) {
        setStorageState({
          fromChain: fromValue.chain,
          fromToken: fromValue.tokenMeta?.symbol,
          toChain: toValue.chain,
          toToken: toValue.tokenMeta?.symbol,
        });
      }

      // sync amount out
      const amountOut = fromValue.amount;
      toValue.amount = amountOut;

      setBridgeFromValue(fromValue);
      setBridgeToValue(toValue);
    },
    [
      walletCxt?.[bridgeFromValue.chain]?.accountId,
      walletCxt?.[bridgeToValue.chain]?.accountId,
      bridgeFromValue.chain,
      bridgeToValue.chain,
      bridgeFromValue.tokenMeta?.symbol,
      bridgeToValue.tokenMeta?.symbol,
      bridgeFromValue.amount,
    ],
    500
  );

  // Sync every minute
  const time = useTime('minute');
  const estimatedGasFee = useAsyncMemo(
    () => ethServices.calculateGasInUSD(BridgeConfig.Rainbow.gas),
    [BridgeConfig.Rainbow.gas, time.format()],
    '0'
  );

  const bridgeFromBalance = useAsyncMemo(
    () =>
      tokenServices.getBalance(
        bridgeFromValue.chain,
        bridgeFromValue.tokenMeta
      ),
    [
      bridgeFromValue.chain,
      bridgeFromValue.tokenMeta,
      walletCxt?.[bridgeFromValue.chain]?.accountId,
      time.format(),
    ],
    '0'
  );
  const bridgeToBalance = useAsyncMemo(
    () =>
      tokenServices.getBalance(bridgeToValue.chain, bridgeToValue.tokenMeta),
    [
      bridgeToValue.chain,
      bridgeToValue.tokenMeta,
      walletCxt?.[bridgeToValue.chain]?.accountId,
      time.format(),
    ],
    '0'
  );

  const [slippageTolerance, setSlippageTolerance] = useState(0.5);

  const bridgeSubmitStatus = useMemo<
    | 'unConnectForm'
    | 'unConnectTo'
    | 'enterAmount'
    | 'preview'
    | 'insufficientBalance'
  >(() => {
    if (
      !(
        bridgeFromValue.accountAddress ||
        walletCxt?.[bridgeFromValue.chain]?.accountId
      )
    )
      return `unConnectForm`;
    else if (
      !(
        bridgeToValue.accountAddress ||
        walletCxt?.[bridgeToValue.chain]?.accountId ||
        bridgeToValue.customAccountAddress
      )
    )
      return `unConnectTo`;
    else if (!bridgeFromValue.amount) return `enterAmount`;
    else if (
      new Big(bridgeFromBalance).eq(0) ||
      new Big(bridgeFromBalance).lt(bridgeFromValue.amount)
    )
      return `insufficientBalance`;
    else return `preview`;
  }, [
    bridgeFromValue.accountAddress,
    bridgeFromValue.chain,
    bridgeFromValue.amount,
    walletCxt,
    bridgeToValue.accountAddress,
    bridgeToValue.chain,
    bridgeToValue.customAccountAddress,
    bridgeFromBalance,
  ]);

  const bridgeSubmitStatusText = useMemo(() => {
    switch (bridgeSubmitStatus) {
      case `unConnectForm`:
        return `Connect Wallet`;
      case `unConnectTo`:
        return `Connect / Enter destination address`;
      case `enterAmount`:
        return `Enter amount`;
      case `insufficientBalance`:
        return `Insufficient balance`;
      case `preview`:
        return `Preview`;
      default:
        return ``;
    }
  }, [bridgeSubmitStatus]);

  const gasWarning = useMemo(() => {
    if (!bridgeFromValue.amount || new Big(bridgeFromBalance).eq(0))
      return false;
    if (
      (bridgeFromValue.chain === 'ETH' &&
        bridgeFromValue.tokenMeta?.symbol === 'ETH') ||
      (bridgeFromValue.chain === 'NEAR' &&
        bridgeFromValue.tokenMeta?.symbol === 'NEAR')
    )
      return new Big(bridgeFromValue.amount).eq(bridgeFromBalance);
    return false;
  }, [
    bridgeFromValue.amount,
    bridgeFromValue.chain,
    bridgeFromValue.tokenMeta?.symbol,
    bridgeFromBalance,
  ]);

  function changeBridgeChain(
    type: 'from' | 'to',
    chain: BridgeModel.BridgeSupportChain
  ) {
    exchangeChain(true);
  }

  function exchangeChain(restToken?: boolean) {
    const {
      chain: fromChain,
      tokenMeta: fromTokenMeta,
      accountAddress: fromAccount,
    } = bridgeFromValue;
    const {
      chain: toChain,
      tokenMeta: toTokenMeta,
      accountAddress: toAccount,
    } = bridgeToValue;

    const fromValue = {
      chain: toChain,
      tokenMeta: toTokenMeta,
      accountAddress: toAccount,
    };
    const toValue = {
      chain: fromChain,
      tokenMeta: fromTokenMeta,
      accountAddress: fromAccount,
      isCustomAccountAddress: false,
      customAccountAddress: undefined,
    };

    if (restToken) {
      const tokenMeta = getTokenBySymbol(fromValue.chain);
      fromValue.tokenMeta = tokenMeta;
      toValue.tokenMeta = tokenMeta;
    }

    setBridgeFromValue(fromValue);
    setBridgeToValue(toValue);
  }

  return {
    bridgeFromValue,
    setBridgeFromValue,
    bridgeFromBalance,
    bridgeToValue,
    setBridgeToValue,
    bridgeToBalance,
    changeBridgeChain,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    gasWarning,
    slippageTolerance,
    setSlippageTolerance,
    estimatedGasFee,
  };
}
