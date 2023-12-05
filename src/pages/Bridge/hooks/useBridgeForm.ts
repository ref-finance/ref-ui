import { useEffect, useMemo, useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import useBridgeToken from './useBridgeToken';
import { useAsyncMemo } from './useHooks';
import Big from 'big.js';

export default function useBridgeForm() {
  const { getTokenBySymbol } = useBridgeToken();

  const defaultTokenMeta = useMemo(
    () => getTokenBySymbol('NEAR'),
    [getTokenBySymbol]
  );

  const [bridgeFromValue, setBridgeFromValue] = useState<
    BridgeModel.BridgeTransferFormData['from']
  >({
    chain: 'ETH',
    tokenMeta: defaultTokenMeta,
    amount: undefined,
  });

  const [bridgeToValue, setBridgeToValue] = useState<
    BridgeModel.BridgeTransferFormData['to']
  >({
    chain: 'NEAR',
    tokenMeta: defaultTokenMeta,
    amount: undefined,
    isCustomAccountAddress: false,
    customAccountAddress: undefined,
  });

  const walletCxt = useWalletConnectContext();
  // sync account address from wallet context

  useEffect(() => {
    setBridgeFromValue({
      ...bridgeFromValue,
      accountAddress: walletCxt?.[bridgeFromValue.chain]?.accountId,
    });
    setBridgeToValue({
      ...bridgeToValue,
      accountAddress: walletCxt?.[bridgeToValue.chain]?.accountId,
    });
  }, [
    bridgeFromValue.chain,
    bridgeToValue.chain,
    walletCxt.ETH.accountId,
    walletCxt.NEAR.accountId,
  ]);

  const { getTokenBalance } = useBridgeToken();
  const bridgeFromBalance = useAsyncMemo(
    () => getTokenBalance(bridgeFromValue.chain, bridgeFromValue.tokenMeta),
    [bridgeFromValue.chain, bridgeFromValue.tokenMeta]
  );
  const bridgeToBalance = useAsyncMemo(
    () => getTokenBalance(bridgeToValue.chain, bridgeToValue.tokenMeta),
    [bridgeToValue.chain, bridgeToValue.tokenMeta]
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
    if (!bridgeFromValue.accountAddress) return `unConnectForm`;
    else if (
      !(bridgeToValue.accountAddress || bridgeToValue.customAccountAddress)
    )
      return `unConnectTo`;
    else if (!bridgeFromValue.amount) return `enterAmount`;
    else if (new Big(bridgeFromBalance).eq(0)) return `insufficientBalance`;
    else if (new Big(bridgeFromBalance).lt(bridgeFromValue.amount))
      return `noEnoughGas`;
    else return `preview`;
  }, [bridgeFromValue, bridgeToValue, bridgeFromBalance]);

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

  useEffect(
    () => console.log('bridgeFromValue', bridgeFromValue),
    [bridgeFromValue]
  );
  useEffect(() => console.log('bridgeToValue', bridgeToValue), [bridgeToValue]);

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
  };
}
