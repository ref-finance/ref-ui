import React, { useEffect, useMemo, useState } from 'react';

import BridgeRoutes from '../components/BridgeRoutes';
import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import InputToken from '../components/InputToken';
import SlippageSelector from '../components/StableSlipSelector';
import { SelectTokenButton } from '../components/TokenSelector';
import { useBridgeFormContext } from '../providers/bridgeForm';
import { useTokenSelectorContext } from '../providers/selectToken';
import SvgIcon from '../components/SvgIcon';
import { useRouter } from '../hooks/useRouter';
import { isValidEthereumAddress, isValidNearAddress } from '../utils/validate';
import { useBridgeTransactionContext } from '../providers/bridgeTransaction';
import { useAutoResetState } from '../hooks/useHooks';
import { useWalletConnectContext } from '../providers/walletConcent';

function FormHeader() {
  const { slippageTolerance, setSlippageTolerance } = useBridgeFormContext();
  const [loading, setLoading] = useAutoResetState(false, 1000);
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="text-base text-white">Bridge</div>
      <div className="flex items-center gap-3">
        <Button size="small" plain onClick={() => setLoading(true)}>
          <SvgIcon
            name="IconRefresh"
            className={loading ? 'animate-spin text-primary' : ''}
          />
        </Button>
        <SlippageSelector
          slippageTolerance={slippageTolerance}
          onChange={(val) => setSlippageTolerance(val)}
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
  const [isValidCustomAddress, setIsValidCustomAddress] = useState(false);

  function handleChangeAddress(value: string) {
    const isValid =
      !value ||
      (bridgeToValue.chain === 'ETH'
        ? isValidEthereumAddress(value)
        : isValidNearAddress(value));
    setCustomAccountAddress(value);
    setIsValidCustomAddress(isValid);
    if (isValid) {
      setBridgeToValue({
        ...bridgeToValue,
        customAccountAddress: value,
      });
    }
  }

  function handlePasteAddress() {
    navigator.clipboard
      .readText()
      .then((text) => {
        handleChangeAddress(text);
      })
      .catch((err) => {
        console.warn('Failed to read clipboard contents: ', err);
      });
  }

  return (
    <div className="my-5">
      <label className="flex items-center select-none mb-3">
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
            onChange={(e) => handleChangeAddress(e.target.value)}
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
              <SvgIcon
                name={
                  isValidCustomAddress
                    ? 'IconSuccessCircleFill'
                    : 'IconErrorCircleFill'
                }
              />
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
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    openPreviewModal,
  } = useBridgeFormContext();

  const { open: selectToken } = useTokenSelectorContext();

  const { unclaimedTransactions, openBridgeTransactionStatusModal } =
    useBridgeTransactionContext();

  async function openTokenSelector(
    params: Parameters<typeof selectToken>[number]
  ) {
    const tokenMeta = await selectToken(params);
    setBridgeFromValue({ ...bridgeFromValue, tokenMeta });
    setBridgeToValue({ ...bridgeToValue, tokenMeta });
  }

  const router = useRouter();
  function handleOpenHistory() {
    router.push('/bridge/history');
  }

  const walletCtx = useWalletConnectContext();
  function handleConfirm() {
    if (bridgeSubmitStatus === 'unConnectForm')
      return walletCtx?.[bridgeFromValue.chain]?.open();
    else if (bridgeSubmitStatus === 'unConnectTo')
      return walletCtx?.[bridgeToValue.chain]?.open();
    else openPreviewModal();
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
            onChangeChain={() => exchangeChain()}
          />
        </div>
        <InputToken
          model={bridgeFromValue}
          balance={bridgeFromBalance}
          isError={bridgeSubmitStatus === 'noEnoughGas'}
          onChange={setBridgeFromValue}
        >
          <SelectTokenButton
            token={bridgeFromValue.tokenMeta}
            onClick={() =>
              openTokenSelector({
                chain: bridgeFromValue.chain,
                chains: [bridgeFromValue.chain, bridgeToValue.chain],
                token: bridgeFromValue.tokenMeta,
              })
            }
          />
        </InputToken>

        <div className="flex justify-center my-3">
          <Button text onClick={exchangeChain}>
            <SvgIcon name="IconExchange" />
          </Button>
        </div>
        <div className="flex items-center mb-3">
          <span className="mr-3">To</span>
          <ConnectWallet
            currentChain={bridgeToValue.chain}
            className="flex-1 justify-between"
            onChangeChain={() => exchangeChain()}
          />
        </div>
        <InputToken
          model={bridgeToValue}
          balance={bridgeToBalance}
          style={{ backgroundColor: 'transparent' }}
          inputReadonly
          onChange={setBridgeToValue}
        >
          <SelectTokenButton
            token={bridgeToValue.tokenMeta}
            onClick={() =>
              openTokenSelector({
                chain: bridgeToValue.chain,
                chains: [bridgeFromValue.chain, bridgeToValue.chain],
                token: bridgeToValue.tokenMeta,
              })
            }
          />
        </InputToken>
        <CustomAccountAddress />
        <BridgeRoutes />
        <Button
          type="primary"
          size="large"
          className="w-full"
          disabled={[
            'insufficientBalance',
            'enterAmount',
            'noEnoughGas',
          ].includes(bridgeSubmitStatus)}
          onClick={handleConfirm}
        >
          {bridgeSubmitStatusText}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between">
        <Button text onClick={handleOpenHistory}>
          Bridge Transaction History
        </Button>
        {unclaimedTransactions.length ? (
          <div
            className="flex items-center rounded-lg px-2 py-1 cursor-pointer"
            style={{
              color: '#EBF479',
              backgroundColor: 'rgba(235, 244, 121, 0.2)',
            }}
            onClick={() =>
              unclaimedTransactions.length === 1
                ? openBridgeTransactionStatusModal(unclaimedTransactions[0])
                : handleOpenHistory()
            }
          >
            <SvgIcon name="IconInfo" className="mr-2" />
            {unclaimedTransactions.length} transactions to be claimed
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default BridgeEntry;
