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
  }>('REF_BRIDGE_FORM', {
    fromChain: SupportChains[0],
    toChain: SupportChains[1],
    fromToken: 'ETH',
    toToken: 'ETH',
  });

  const [bridgeFromValue, _setBridgeFromValue] = useState<
    BridgeModel.BridgeTransferFormData['from']
  >(() => ({
    chain: storageState.fromChain,
    tokenMeta: getTokenBySymbol(storageState.fromToken),
    amount: undefined,
  }));

  const [bridgeToValue, _setBridgeToValue] = useState<
    BridgeModel.BridgeTransferFormData['to']
  >(() => ({
    chain: storageState.toChain,
    tokenMeta: getTokenBySymbol(storageState.toToken),
    amount: undefined,
    isCustomAccountAddress: false,
    customAccountAddress: undefined,
  }));

  const walletCxt = useWalletConnectContext();

  const setBridgeFromValue = useCallback(
    (value: BridgeModel.BridgeTransferFormData['from']) => {
      if (walletCxt?.[value.chain]?.accountId)
        value.accountAddress = walletCxt?.[value.chain]?.accountId;
      _setBridgeFromValue(value);
      setStorageState({
        ...storageState,
        fromChain: value.chain,
        fromToken: value.tokenMeta?.symbol,
      });
    },
    []
  );

  const setBridgeToValue = useCallback(
    (value: BridgeModel.BridgeTransferFormData['to']) => {
      if (walletCxt?.[value.chain]?.accountId)
        value.accountAddress = walletCxt?.[value.chain]?.accountId;
      _setBridgeToValue(value);
      setStorageState({
        ...storageState,
        toChain: value.chain,
        toToken: value.tokenMeta?.symbol,
      });
      console.log('to value', value);
    },
    []
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

  useDebouncedEffect(
    async () => {
      const amountOut = bridgeFromValue.amount;
      setBridgeToValue({
        ...bridgeToValue,
        amount: amountOut,
      });
    },
    [bridgeFromValue.amount],
    1500
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
        return `Connect wallet`;
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
    if (!bridgeFromValue.amount || !bridgeFromBalance) return false;
    if (
      (bridgeFromValue.chain === 'ETH' &&
        bridgeFromValue.tokenMeta?.symbol === 'ETH') ||
      (bridgeFromValue.chain === 'NEAR' &&
        bridgeFromValue.tokenMeta?.symbol === 'NEAR')
    )
      return new Big(bridgeFromValue.amount).gte(bridgeFromBalance);
    return false;
  }, [
    bridgeFromValue.amount,
    bridgeFromValue.chain,
    bridgeFromValue.tokenMeta?.symbol,
    bridgeFromBalance,
  ]);

  function changeFromChain(chain: BridgeModel.BridgeSupportChain) {
    if (bridgeToValue.chain === chain) exchangeChain();
    else
      setBridgeFromValue({
        ...bridgeFromValue,
        chain,
      });
  }

  function changeToChain(chain: BridgeModel.BridgeSupportChain) {
    if (bridgeFromValue.chain === chain) exchangeChain();
    else
      setBridgeToValue({
        ...bridgeToValue,
        chain,
      });
  }

  function exchangeChain() {
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
    setBridgeFromValue({
      chain: toChain,
      tokenMeta: toTokenMeta,
      accountAddress: toAccount,
    });
    setBridgeToValue({
      chain: fromChain,
      tokenMeta: fromTokenMeta,
      accountAddress: fromAccount,
      isCustomAccountAddress: false,
      customAccountAddress: undefined,
    });
  }

  return {
    bridgeFromValue,
    setBridgeFromValue,
    bridgeFromBalance,
    bridgeToValue,
    setBridgeToValue,
    bridgeToBalance,
    changeFromChain,
    changeToChain,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    gasWarning,
    slippageTolerance,
    setSlippageTolerance,
    estimatedGasFee,
  };
}
