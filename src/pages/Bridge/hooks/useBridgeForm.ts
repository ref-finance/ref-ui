import { useEffect, useMemo, useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import { useDebouncedEffect, useRequest, useStorageState } from './useHooks';
import Big from 'big.js';
import { evmServices, tokenServices } from '../services/contract';
import { SupportChains, EVMConfig, BridgeTokenRoutes } from '../config';
import { logger } from '../utils/common';
import { getTokenMeta } from '../utils/token';
import bridgeServices from '../services/bridge';
import { formatAmount } from '../utils/format';

interface BridgeForm {
  fromChain: BridgeModel.BridgeSupportChain;
  toChain: BridgeModel.BridgeSupportChain;
  fromToken: string;
  toToken: string;
}

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
    tokenMeta: getTokenMeta('NEAR'),
    amount: undefined,
    isCustomAccountAddress: false,
    customAccountAddress: undefined,
  });

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

  const supportToTokenSymbols = useMemo(() => {
    if (
      bridgeFromValue.chain === 'Ethereum' &&
      bridgeToValue.chain === 'NEAR' &&
      bridgeFromValue.tokenMeta?.symbol === 'USDC'
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

  const { data: estimatedGasFee = '0' } = useRequest(() =>
    evmServices.calculateGasInUSD('336847')
  );

  const { data: channelInfoMap, loading: channelInfoMapLoading } = useRequest(
    async () => {
      const result = {} as Record<
        BridgeModel.BridgeSupportChannel,
        Awaited<ReturnType<typeof bridgeServices.query>>
      >;
      setBridgeToValue({ ...bridgeToValue, amount: undefined });
      for (const channel of supportBridgeChannels) {
        result[channel] = await bridgeServices.query({
          tokenIn: bridgeFromValue.tokenMeta,
          tokenOut: bridgeToValue.tokenMeta,
          amount: bridgeFromValue.amount,
          from: bridgeFromValue.chain,
          to: bridgeToValue.chain,
          recipient:
            bridgeToValue.isCustomAccountAddress &&
            bridgeToValue.customAccountAddress
              ? bridgeToValue.customAccountAddress
              : bridgeToValue.accountAddress,
          sender: bridgeFromValue.accountAddress,
          channel,
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
      ],
      debounceOptions: 500,
    }
  );

  const {
    getWallet,
    EVM: { setChain },
  } = useWalletConnectContext();

  useDebouncedEffect(
    () => {
      const fromValue = { ...bridgeFromValue };
      const toValue = { ...bridgeToValue };

      if (fromValue.chain !== 'NEAR')
        setChain(EVMConfig[fromValue.chain]?.chainId);
      else if (toValue.chain !== 'NEAR')
        setChain(EVMConfig[toValue.chain]?.chainId);

      logger.log('useBridgeForm', fromValue, toValue);

      // sync account address
      if (getWallet(fromValue.chain)?.accountId)
        fromValue.accountAddress = getWallet(fromValue.chain)?.accountId;
      if (getWallet(bridgeToValue.chain)?.accountId)
        toValue.accountAddress = getWallet(bridgeToValue.chain)?.accountId;

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
    () =>
      tokenServices.getBalance(
        bridgeFromValue.chain,
        bridgeFromValue.tokenMeta,
        true
      ),
    {
      refreshDeps: [bridgeFromValue.chain, bridgeFromValue.tokenMeta],
      before: () =>
        !!bridgeFromValue.chain &&
        !!bridgeFromValue.tokenMeta &&
        !!getWallet(bridgeFromValue.chain)?.accountId,
      debounceOptions: 200,
      pollingInterval: 10000,
    }
  );

  const { data: bridgeToBalance = '0' } = useRequest(
    () =>
      tokenServices.getBalance(
        bridgeToValue.chain,
        bridgeToValue.tokenMeta,
        true
      ),
    {
      refreshDeps: [bridgeToValue.chain, bridgeToValue.tokenMeta],
      before: () =>
        !!bridgeToValue.chain &&
        !!bridgeToValue.tokenMeta &&
        !!getWallet(bridgeToValue.chain)?.accountId,
      debounceOptions: 200,
      pollingInterval: 10000,
    }
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
        getWallet(bridgeFromValue.chain)?.accountId
      )
    )
      return `unConnectForm`;
    else if (
      !(
        bridgeToValue.accountAddress ||
        getWallet(bridgeToValue.chain)?.accountId ||
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
      (bridgeFromValue.chain === 'Ethereum' &&
        bridgeFromValue.tokenMeta?.symbol === 'Ethereum') ||
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
    const { chain: oldFromChain, tokenMeta: oldFromTokenMeta } =
      bridgeFromValue;
    const { chain: oldToChain, tokenMeta: oldToTokenMeta } = bridgeToValue;
    if (type === 'from') {
      if (oldToChain === chain) exchangeChain(true);
      else {
        setBridgeFromValue({
          chain,
          tokenMeta: oldFromTokenMeta,
          accountAddress: getWallet(chain)?.accountId,
          amount: undefined,
        });
        setBridgeToValue({
          chain: chain === 'NEAR' ? SupportChains[0] : 'NEAR',
          tokenMeta: oldToTokenMeta,
          accountAddress: getWallet(
            chain === 'NEAR' ? SupportChains[0] : 'NEAR'
          )?.accountId,
          amount: undefined,
          isCustomAccountAddress: false,
          customAccountAddress: undefined,
        });
      }
    } else {
      if (oldFromChain === chain) exchangeChain(true);
      else {
        setBridgeToValue({
          chain,
          tokenMeta: oldToTokenMeta,
          accountAddress: getWallet(chain)?.accountId,
          amount: undefined,
          isCustomAccountAddress: false,
          customAccountAddress: undefined,
        });
        setBridgeFromValue({
          chain: chain === 'NEAR' ? SupportChains[0] : 'NEAR',
          tokenMeta: oldFromTokenMeta,
          accountAddress: getWallet(
            chain === 'NEAR' ? SupportChains[0] : 'NEAR'
          )?.accountId,
          amount: undefined,
        });
      }
    }
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
    estimatedGasFee,
    channelInfoMap,
    channelInfoMapLoading,
  };
}
