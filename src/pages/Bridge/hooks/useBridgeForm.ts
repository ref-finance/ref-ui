import { useEffect, useMemo, useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import { useDebouncedEffect, useRequest, useStorageState } from './useHooks';
import Big from 'big.js';
import { tokenServices } from '../services/contract';
import { SupportChains, EVMConfig, BridgeTokenRoutes } from '../config';
import { logger } from '../utils/common';
import { getTokenMeta } from '../utils/token';
import bridgeServices from '../services/bridge';
import { formatAmount } from '../utils/format';

export default function useBridgeForm() {
  const [bridgeFromValue, setBridgeFromValue] = useStorageState<
    BridgeModel.BridgeTransferFormData['from']
  >('bridgeFromValue', {
    chain: SupportChains[0],
    tokenMeta: getTokenMeta('USDC'),
    amount: undefined,
  });

  const [bridgeToValue, setBridgeToValue] = useStorageState<
    BridgeModel.BridgeTransferFormData['to']
  >('bridgeToValue', {
    chain: SupportChains[1],
    tokenMeta: getTokenMeta('USDC'),
    amount: undefined,
    isCustomAccountAddress: false,
    customAccountAddress: undefined,
  });

  const [slippageTolerance, setSlippageTolerance] = useStorageState(
    'slippageTolerance',
    0.005
  );

  const [bridgeChannel, setBridgeChannel] =
    useState<BridgeModel.BridgeSupportChannel>();

  const evmSpecialSymbols = ['USDC.e', 'USDT.e'];

  const supportFromTokenSymbols = useMemo(() => {
    const symbols = BridgeTokenRoutes.filter(
      (route) =>
        route.from === bridgeFromValue.chain && route.to === bridgeToValue.chain
    )
      .map((v) => v.symbols)
      .flat()
      .filter((v, i, a) => a.indexOf(v) === i);
    if (bridgeFromValue.chain !== 'NEAR') {
      return symbols.filter((v) => !evmSpecialSymbols.includes(v));
    }
    return symbols;
  }, [bridgeFromValue.chain, bridgeToValue.chain]);

  const supportBridgeChannels = useMemo(() => {
    logger.log('BridgeTokenRoutes', bridgeToValue.tokenMeta?.symbol);
    const channels = BridgeTokenRoutes.filter(
      (route) =>
        route.from === bridgeFromValue.chain &&
        route.to === bridgeToValue.chain &&
        route.symbols.includes(bridgeToValue.tokenMeta?.symbol)
    );
    return channels.map((v) => v.channel);
  }, [
    bridgeFromValue.chain,
    bridgeToValue.chain,
    bridgeToValue.tokenMeta?.symbol,
  ]);

  const supportToTokenSymbols = useMemo(() => {
    if (
      bridgeFromValue.chain === 'Ethereum' &&
      bridgeToValue.chain === 'NEAR' &&
      bridgeFromValue.tokenMeta?.symbol === 'USDC' &&
      supportBridgeChannels.includes('Rainbow')
    ) {
      return [bridgeFromValue.tokenMeta?.symbol, 'USDC.e'];
    }
    return supportFromTokenSymbols.filter(
      (v) => v === bridgeFromValue.tokenMeta?.symbol
    );
  }, [
    bridgeFromValue.chain,
    bridgeToValue.chain,
    bridgeFromValue.tokenMeta?.symbol,
  ]);

  const {
    getWallet,
    EVM: { setChain },
  } = useWalletConnectContext();

  const fromAccountAddress = useMemo(
    () => getWallet(bridgeFromValue.chain)?.accountId,
    [getWallet(bridgeFromValue.chain)?.accountId]
  );

  const toAccountAddress = useMemo(() => {
    return bridgeToValue.isCustomAccountAddress
      ? bridgeToValue.customAccountAddress
      : getWallet(bridgeToValue.chain)?.accountId;
  }, [
    getWallet(bridgeToValue.chain)?.accountId,
    bridgeToValue.isCustomAccountAddress,
    bridgeToValue.customAccountAddress,
  ]);

  const {
    data: channelInfoMap,
    loading: channelInfoMapLoading,
    run: refreshChannelInfoMap,
  } = useRequest(
    async () => {
      const result = {} as Record<
        BridgeModel.BridgeSupportChannel,
        Awaited<ReturnType<typeof bridgeServices.query>>
      >;

      for (const channel of supportBridgeChannels) {
        result[channel] = await bridgeServices.query({
          tokenIn: bridgeFromValue.tokenMeta,
          tokenOut: bridgeToValue.tokenMeta,
          amount: bridgeFromValue.amount,
          from: bridgeFromValue.chain,
          to: bridgeToValue.chain,
          recipient: toAccountAddress,
          sender: fromAccountAddress,
          channel,
          slippage: slippageTolerance,
        });
      }
      logger.log('channelInfoMap', result);
      return result;
    },
    {
      refreshDeps: [
        bridgeFromValue.chain,
        bridgeFromValue.tokenMeta,
        bridgeFromValue.amount,
        supportBridgeChannels,
        slippageTolerance,
      ],
      debounceOptions: { wait: 500, leading: true },
    }
  );

  useDebouncedEffect(
    () => {
      const fromValue = { ...bridgeFromValue };
      const toValue = { ...bridgeToValue };

      if (fromValue.chain !== 'NEAR')
        setChain(EVMConfig[fromValue.chain]?.chainId);
      else if (toValue.chain !== 'NEAR')
        setChain(EVMConfig[toValue.chain]?.chainId);

      logger.log('useBridgeForm', fromValue, toValue);

      setBridgeFromValue(fromValue);
      setBridgeToValue(toValue);
    },
    [
      bridgeFromValue.chain,
      bridgeToValue.chain,
      getWallet(bridgeFromValue.chain)?.accountId,
      getWallet(bridgeToValue.chain)?.accountId,
    ],
    200
  );

  useEffect(() => {
    if (
      !supportFromTokenSymbols.includes(bridgeFromValue.tokenMeta?.symbol || '')
    ) {
      setBridgeFromValue({
        ...bridgeFromValue,
        tokenMeta: getTokenMeta(supportFromTokenSymbols?.[0]),
      });
    }
    if (
      !supportToTokenSymbols.includes(bridgeToValue.tokenMeta?.symbol || '')
    ) {
      setBridgeToValue({
        ...bridgeToValue,
        tokenMeta: getTokenMeta(supportToTokenSymbols?.[0]),
      });
    }
  }, [
    supportToTokenSymbols,
    bridgeToValue.tokenMeta?.symbol,
    supportFromTokenSymbols,
    bridgeFromValue.tokenMeta?.symbol,
  ]);

  useEffect(() => {
    const amountOut = bridgeChannel
      ? channelInfoMap?.[bridgeChannel]?.minAmount
      : Object.values(channelInfoMap || {})[0]?.minAmount;
    setBridgeToValue({
      ...bridgeToValue,
      amount: formatAmount(amountOut, bridgeToValue.tokenMeta?.decimals),
    });
  }, [channelInfoMap, bridgeChannel]);

  const { data: bridgeFromBalance = '0' } = useRequest(
    async () => {
      if (!getWallet(bridgeFromValue.chain)?.accountId) return '0';
      return tokenServices.getBalance(
        bridgeFromValue.chain,
        bridgeFromValue.tokenMeta,
        true
      );
    },
    {
      refreshDeps: [
        bridgeFromValue.chain,
        bridgeFromValue.tokenMeta,
        getWallet(bridgeFromValue.chain)?.accountId,
      ],
      before: () => !!bridgeFromValue.chain && !!bridgeFromValue.tokenMeta,
      debounceOptions: 200,
      pollingInterval: 10000,
    }
  );

  const { data: bridgeToBalance = '0' } = useRequest(
    async () => {
      if (!getWallet(bridgeToValue.chain)?.accountId) return '0';
      return tokenServices.getBalance(
        bridgeToValue.chain,
        bridgeToValue.tokenMeta,
        true
      );
    },
    {
      refreshDeps: [
        bridgeToValue.chain,
        bridgeToValue.tokenMeta,
        getWallet(bridgeToValue.chain)?.accountId,
      ],
      before: () => !!bridgeToValue.chain && !!bridgeToValue.tokenMeta,
      debounceOptions: 200,
      pollingInterval: 10000,
    }
  );

  const { data: gasTokenBalance = '0' } = useRequest(
    async () => {
      const res = await tokenServices.getBalance(
        bridgeFromValue.chain,
        getTokenMeta(bridgeFromValue.chain === 'NEAR' ? 'NEAR' : 'ETH'),
        true
      );
      return res;
    },
    {
      refreshDeps: [bridgeFromValue.chain],
      before: () => !!bridgeFromValue.chain,
      debounceOptions: 200,
      pollingInterval: 10000,
    }
  );

  const bridgeSubmitStatus = useMemo<
    | 'unConnectForm'
    | 'unConnectTo'
    | 'enterToAddress'
    | 'enterAmount'
    | 'preview'
    | 'insufficientBalance'
  >(() => {
    if (!fromAccountAddress) return `unConnectForm`;
    else if (!getWallet(bridgeToValue.chain).isSignedIn) return `unConnectTo`;
    else if (bridgeToValue.isCustomAccountAddress && !toAccountAddress)
      return `enterToAddress`;
    else if (!bridgeFromValue.amount) return `enterAmount`;
    else if (
      new Big(bridgeFromBalance).eq(0) ||
      new Big(bridgeFromBalance).lt(bridgeFromValue.amount)
    )
      return `insufficientBalance`;
    else return `preview`;
  }, [
    bridgeFromValue.chain,
    bridgeFromValue.amount,
    bridgeFromBalance,
    fromAccountAddress,
    toAccountAddress,
  ]);

  const bridgeSubmitStatusText = useMemo(() => {
    switch (bridgeSubmitStatus) {
      case `unConnectForm`:
        return `Connect Wallet`;
      case `unConnectTo`:
        return `Connect Wallet`;
      case `enterToAddress`:
        return `Enter Destination Address`;
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
    if (
      !getWallet(bridgeFromValue.chain).isSignedIn ||
      channelInfoMapLoading ||
      new Big(bridgeFromValue.amount || 0).eq(0)
    )
      return;
    if (
      bridgeChannel === 'Stargate' &&
      bridgeFromValue.chain === 'NEAR' &&
      new Big(channelInfoMap?.[bridgeChannel]?.readableFeeAmount || 0).gte(
        bridgeFromValue.amount
      )
    ) {
      return `Your ${bridgeFromValue.tokenMeta.symbol} cannot cover the Bridge Fee`;
    } else {
      console.log('gasWarning gasTokenBalance', gasTokenBalance);
      if (new Big(gasTokenBalance).eq(0)) return 'Not enough gas fee';
    }
  }, [
    getWallet(bridgeFromValue.chain).isSignedIn,
    bridgeFromValue.amount,
    bridgeChannel,
    bridgeFromValue.chain,
    channelInfoMap,
    gasTokenBalance,
    channelInfoMapLoading,
  ]);

  function changeBridgeChain(
    type: 'from' | 'to',
    chain: BridgeModel.BridgeSupportChain
  ) {
    const {
      chain: oldFromChain,
      tokenMeta: oldFromTokenMeta,
      amount,
    } = bridgeFromValue;
    const { chain: oldToChain, tokenMeta: oldToTokenMeta } = bridgeToValue;
    if (type === 'from') {
      if (oldToChain === chain) exchangeChain(true);
      else {
        setBridgeFromValue({
          chain,
          tokenMeta: oldFromTokenMeta,
          amount,
        });
        setBridgeToValue({
          chain: chain === 'NEAR' ? SupportChains[0] : 'NEAR',
          tokenMeta: oldToTokenMeta,
        });
      }
    } else {
      if (oldFromChain === chain) exchangeChain(true);
      else {
        setBridgeFromValue({
          chain: chain === 'NEAR' ? SupportChains[0] : 'NEAR',
          tokenMeta: oldFromTokenMeta,
          amount,
        });
        setBridgeToValue({
          chain,
          tokenMeta: oldToTokenMeta,
        });
      }
    }
  }

  function exchangeChain(restToken?: boolean) {
    const {
      chain: fromChain,
      tokenMeta: fromTokenMeta,
      amount,
    } = bridgeFromValue;
    const { chain: toChain, tokenMeta: toTokenMeta } = bridgeToValue;

    const fromValue = {
      chain: toChain,
      tokenMeta: toTokenMeta,
      amount,
    };
    const toValue = {
      chain: fromChain,
      tokenMeta: fromTokenMeta,
      isCustomAccountAddress: false,
      customAccountAddress: undefined,
    };

    if (restToken) {
      fromValue.tokenMeta = undefined;
      toValue.tokenMeta = undefined;
    }

    setBridgeFromValue(fromValue);
    setBridgeToValue(toValue);
  }

  return {
    bridgeChannel,
    setBridgeChannel,
    bridgeFromValue,
    setBridgeFromValue,
    bridgeFromBalance,
    bridgeToValue,
    setBridgeToValue,
    supportFromTokenSymbols,
    supportToTokenSymbols,
    supportBridgeChannels,
    bridgeToBalance,
    changeBridgeChain,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    gasWarning,
    slippageTolerance,
    setSlippageTolerance,
    channelInfoMap,
    channelInfoMapLoading,
    refreshChannelInfoMap,
    fromAccountAddress,
    toAccountAddress,
  };
}
