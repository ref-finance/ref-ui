import { useMemo, useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';

export default function useBridgeForm() {
  const walletCxt = useWalletConnectContext();

  const [bridgeFromValue, setBridgeFromValue] =
    useState<BridgeModel.BridgeTransaction>({
      chain: 'ETH',
      amount: undefined,
      token: undefined,
      isCustomToken: false,
      customTokenAddress: undefined,
    });

  const [bridgeToValue, setBridgeToValue] =
    useState<BridgeModel.BridgeTransaction>({
      chain: 'NEAR',
      amount: undefined,
      token: undefined,
      isCustomToken: false,
      customTokenAddress: undefined,
    });

  const [slippageTolerance, setSlippageTolerance] = useState(0.5);

  const bridgeSubmitStatus = useMemo<
    'unConnectForm' | 'unConnectTo' | 'enterAmount' | 'preview'
  >(() => {
    if (!walletCxt[bridgeFromValue.chain].isSignedIn) return `unConnectForm`;
    else if (
      !walletCxt[bridgeToValue.chain].isSignedIn ||
      (!bridgeToValue.isCustomToken && !bridgeToValue.token) ||
      (bridgeToValue.isCustomToken && !bridgeToValue.customTokenAddress)
    )
      return `unConnectTo`;
    else if (!bridgeFromValue.amount) return `enterAmount`;
    else return `preview`;
  }, [walletCxt, bridgeFromValue, bridgeToValue]);

  const bridgeSubmitStatusText = useMemo(() => {
    switch (bridgeSubmitStatus) {
      case `unConnectForm`:
        return `Connect your wallet`;
      case `unConnectTo`:
        return `Connect / Enter destination address`;
      case `enterAmount`:
        return `Enter amount`;
      case `preview`:
        return `Preview`;
      default:
        return ``;
    }
  }, [bridgeSubmitStatus]);

  function exchangeChain() {
    const temp = {
      ...bridgeFromValue,
      isCustomToken: false,
      customTokenAddress: undefined,
    };
    setBridgeFromValue({
      ...bridgeToValue,
      isCustomToken: false,
      customTokenAddress: undefined,
    });
    setBridgeToValue(temp);
  }

  return {
    bridgeFromValue,
    setBridgeFromValue,
    bridgeToValue,
    setBridgeToValue,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    slippageTolerance,
    setSlippageTolerance,
  };
}
