import React, { useEffect, useMemo, useState } from 'react';

import BridgeRoutes from '../components/BridgeRoutes';
import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import InputToken from '../components/InputToken';
import SlippageSelector from '../components/StableSlipSelector';
import { TokenSelector } from '../components/TokenSelector';
import { useBridgeFormContext } from '../providers/bridgeForm';
import SvgIcon from '../components/SvgIcon';
import { useRouter } from '../hooks/useRouter';
import { isValidEthereumAddress, isValidNearAddress } from '../utils/validate';

import { getTokenMeta } from '../utils/token';
import { useWalletConnectContext } from '../providers/walletConcent';

function FormHeader() {
  const {
    slippageTolerance,
    setSlippageTolerance,
    channelInfoMapLoading,
    refreshChannelInfoMap,
  } = useBridgeFormContext();
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="text-base text-white">Bridge</div>
      <div className="flex items-center gap-3">
        <Button size="small" plain onClick={refreshChannelInfoMap}>
          <SvgIcon
            name="IconRefresh"
            className={channelInfoMapLoading ? 'animate-spin text-primary' : ''}
          />
        </Button>
        <SlippageSelector
          slippageTolerance={(slippageTolerance || 0) * 100}
          onChange={(val) => setSlippageTolerance((val || 0) / 100)}
        >
          <Button size="small" plain>
            <SvgIcon name="IconSetting" />
          </Button>
        </SlippageSelector>
      </div>
    </div>
  );
}

function CustomAccountAddress() {
  const { bridgeToValue, setBridgeToValue } = useBridgeFormContext();
  const [customAccountAddress, setCustomAccountAddress] = useState(
    bridgeToValue.customAccountAddress
  );
  const [isFocus, setIsFocus] = useState(false);

  const isValidCustomAddress = useMemo(
    () =>
      !customAccountAddress ||
      (bridgeToValue.chain === 'NEAR'
        ? isValidNearAddress(customAccountAddress)
        : isValidEthereumAddress(customAccountAddress)),
    [customAccountAddress, bridgeToValue.chain]
  );

  useEffect(() => {
    if (isValidCustomAddress) {
      setBridgeToValue({
        ...bridgeToValue,
        customAccountAddress,
      });
    }
  }, [isValidCustomAddress, customAccountAddress]);

  function handlePasteAddress() {
    navigator.clipboard
      .readText()
      .then((text) => {
        setCustomAccountAddress(text);
      })
      .catch((err) => {
        console.warn('Failed to read clipboard contents: ', err);
      });
  }

  return (
    <div className="my-5">
      <label className="inline-flex items-center select-none mb-3 cursor-pointer">
        <input
          type="checkbox"
          className="bridge-checkbox mr-2"
          checked={bridgeToValue.isCustomAccountAddress}
          onChange={(e) =>
            setBridgeToValue({
              ...bridgeToValue,
              isCustomAccountAddress: e.target.checked,
              customAccountAddress: '',
            })
          }
        />
        I&apos;m transferring to a destination address
      </label>
      {bridgeToValue.isCustomAccountAddress && (
        <div className="relative">
          <input
            type="text"
            className="bridge-input w-full"
            placeholder="Destination address"
            value={customAccountAddress ?? ''}
            onChange={(e) => setCustomAccountAddress(e.target.value)}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
          />
          <div
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
            onClick={() => !isValidCustomAddress && setCustomAccountAddress('')}
          >
            {!customAccountAddress ? (
              <Button
                size="small"
                type="primary"
                text
                onClick={handlePasteAddress}
              >
                Paste
              </Button>
            ) : (
              !isFocus && (
                <SvgIcon
                  name={
                    isValidCustomAddress
                      ? 'IconSuccessCircleFill'
                      : 'IconErrorCircleFill'
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BridgeEntry() {
  const {
    bridgeFromValue,
    setBridgeFromValue,
    bridgeFromBalance,
    bridgeToValue,
    setBridgeToValue,
    bridgeToBalance,
    supportFromTokenSymbols,
    supportToTokenSymbols,
    changeBridgeChain,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    openPreviewModal,
    gasWarning,
    channelInfoMapLoading,
  } = useBridgeFormContext();

  const router = useRouter();
  function handleOpenHistory() {
    router.push('/bridge/history');
  }

  return (
    <div className="bridge-entry-container">
      <form className="bridge-plane shadow-4xl">
        <FormHeader />
        <div className="flex items-center mb-3">
          <span className="mr-3">From</span>
          <ConnectWallet
            currentChain={bridgeFromValue.chain}
            className="flex-1 justify-between"
            onChangeChain={(chain) => changeBridgeChain('from', chain)}
          />
        </div>
        <InputToken
          model={bridgeFromValue}
          balance={bridgeFromBalance}
          isError={gasWarning}
          onChange={setBridgeFromValue}
        >
          <TokenSelector
            value={bridgeFromValue.tokenMeta}
            chain={bridgeFromValue.chain}
            tokens={supportFromTokenSymbols.map(getTokenMeta)}
            onChange={(tokenMeta) =>
              setBridgeFromValue({ ...bridgeFromValue, tokenMeta })
            }
          />
        </InputToken>

        <div className="flex justify-center my-3">
          <Button text onClick={() => exchangeChain()}>
            <SvgIcon name="IconExchange" />
          </Button>
        </div>
        <div className="flex items-center mb-3">
          <span className="mr-3">To</span>
          <ConnectWallet
            currentChain={bridgeToValue.chain}
            className="flex-1 justify-between"
            onChangeChain={(chain) => changeBridgeChain('to', chain)}
          />
        </div>
        <InputToken
          model={bridgeToValue}
          balance={bridgeToBalance}
          style={{ backgroundColor: 'transparent' }}
          inputReadonly
          onChange={setBridgeToValue}
        >
          <TokenSelector
            value={bridgeToValue.tokenMeta}
            chain={bridgeToValue.chain}
            tokens={supportToTokenSymbols.map(getTokenMeta)}
            placeholder={
              !supportToTokenSymbols.length ? 'No token available' : ''
            }
            onChange={(tokenMeta) =>
              setBridgeToValue({ ...bridgeToValue, tokenMeta })
            }
          />
        </InputToken>
        <CustomAccountAddress />
        <BridgeRoutes />
        {['unConnectForm', 'unConnectTo'].includes(bridgeSubmitStatus) ? (
          <ConnectWallet
            hideChainSelector
            buttonProps={{
              type: 'primary',
              size: 'large',
              className: 'w-full',
              loading: channelInfoMapLoading,
            }}
            currentChain={
              bridgeSubmitStatus === 'unConnectForm'
                ? bridgeFromValue.chain
                : bridgeToValue.chain
            }
            connectPlaceholder={bridgeSubmitStatusText}
          />
        ) : (
          <Button
            type="primary"
            loading={channelInfoMapLoading}
            size="large"
            className="w-full"
            disabled={['insufficientBalance', 'enterAmount'].includes(
              bridgeSubmitStatus
            )}
            onClick={openPreviewModal}
          >
            {bridgeSubmitStatusText}
          </Button>
        )}
      </form>
      <div className="mt-4 flex items-center justify-between">
        <Button text onClick={handleOpenHistory}>
          Bridge Transaction History
        </Button>
      </div>
    </div>
  );
}
export default BridgeEntry;
