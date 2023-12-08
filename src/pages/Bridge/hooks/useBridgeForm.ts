import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import useBridgeToken from './useBridgeToken';
import { useAsyncMemo, useStorageState } from './useHooks';
import Big from 'big.js';
import { debounce } from 'lodash';
import { ethServices, tokenServices } from '../services/contract';
import { BridgeConfig } from '../config';

export default function useBridgeForm() {
  const { getTokenBySymbol } = useBridgeToken();

  const [storageState, setStorageState] = useStorageState<{
    fromChain: BridgeModel.BridgeSupportChain;
    toChain: BridgeModel.BridgeSupportChain;
    fromToken: string;
    toToken: string;
  }>('REF_BRIDGE_FORM', {
    fromChain: 'ETH',
    toChain: 'NEAR',
    fromToken: 'NEAR',
    toToken: 'NEAR',
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
        fromChain: bridgeFromValue.chain,
        fromToken: bridgeFromValue.tokenMeta?.symbol,
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
        toChain: bridgeToValue.chain,
        toToken: bridgeToValue.tokenMeta?.symbol,
      });
    },
    []
  );

  const countEstimateOutAmount = useCallback(
    debounce(async () => {
      const amountOut = bridgeFromValue.amount;

      setBridgeToValue({
        ...bridgeToValue,
        amount: amountOut,
      });
    }, 500),
    [bridgeFromValue.amount]
  );
  useEffect(() => {
    countEstimateOutAmount();
  }, [countEstimateOutAmount]);

  const estimatedGasFee = useAsyncMemo(
    () => ethServices.calculateGasInUSD(BridgeConfig.Rainbow.gas),
    [BridgeConfig.Rainbow.gas],
    '0'
  );

  const bridgeFromBalance = useAsyncMemo(
    () =>
      tokenServices.getBalance(
        bridgeFromValue.chain,
        bridgeFromValue.tokenMeta
      ),
    [bridgeFromValue.chain, bridgeFromValue.tokenMeta],
    '0'
  );
  const bridgeToBalance = useAsyncMemo(
    () =>
      tokenServices.getBalance(bridgeToValue.chain, bridgeToValue.tokenMeta),
    [bridgeToValue.chain, bridgeToValue.tokenMeta],
    '0'
  );

  const [slippageTolerance, setSlippageTolerance] = useState(0.5);

  const bridgeSubmitStatus = useMemo<
    | 'unConnectForm'
    | 'unConnectTo'
    | 'enterAmount'
    | 'preview'
    | 'insufficientBalance'
    | 'noEnoughGas'
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
        walletCxt?.[bridgeFromValue.chain]?.accountId ||
        bridgeToValue.customAccountAddress
      )
    )
      return `unConnectTo`;
    else if (!bridgeFromValue.amount) return `enterAmount`;
    else if (new Big(bridgeFromBalance).eq(0)) return `insufficientBalance`;
    else if (new Big(bridgeFromBalance).lt(bridgeFromValue.amount))
      return `noEnoughGas`;
    else return `preview`;
  }, [
    bridgeFromValue.accountAddress,
    bridgeFromValue.chain,
    bridgeFromValue.amount,
    walletCxt,
    bridgeToValue.accountAddress,
    bridgeToValue.customAccountAddress,
    bridgeFromBalance,
  ]);

  const bridgeSubmitStatusText = useMemo(() => {
    switch (bridgeSubmitStatus) {
      case `unConnectForm`:
        return `Connect your wallet`;
      case `unConnectTo`:
        return `Connect / Enter destination address`;
      case `enterAmount`:
        return `Enter amount`;
      case `insufficientBalance`:
      case `noEnoughGas`:
        return `Insufficient balance`;
      case `preview`:
        return `Preview`;
      default:
        return ``;
    }
  }, [bridgeSubmitStatus]);

  function exchangeChain() {
    const { chain: fromChain, tokenMeta: fromTokenMeta } = bridgeFromValue;
    const { chain: toChain, tokenMeta: toTokenMeta } = bridgeToValue;
    setBridgeFromValue({
      ...bridgeFromValue,
      chain: toChain,
      tokenMeta: toTokenMeta,
    });
    setBridgeToValue({
      ...bridgeToValue,
      chain: fromChain,
      tokenMeta: fromTokenMeta,
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
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    slippageTolerance,
    setSlippageTolerance,
    estimatedGasFee,
  };
}
