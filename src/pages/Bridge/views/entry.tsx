import React, { useEffect } from 'react';

import BridgeRoutes from '../components/BridgeRoutes';
import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import InputToken from '../components/InputToken';
import SlippageSelector from '../components/StableSlipSelector';
import { SelectTokenButton } from '../components/TokenSelector';
import { useBridgeFormContext } from '../providers/bridgeForm';
import { useTokenSelectorContext } from '../providers/selectToken';
import SvgIcon from '../components/SvgIcon';
import useRainbowBridge from '../hooks/useRainbowBridge';
import { useWalletConnectContext } from '../providers/walletConcent';
import { useRouter } from '../hooks/useRouter';

function FormHeader() {
  const { slippageTolerance, setSlippageTolerance } = useBridgeFormContext();
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="text-base text-white">Bridge</div>
      <div className="flex items-center gap-3">
        <Button size="small" plain>
          <SvgIcon name="IconRefresh" />
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

function CustomToken() {
  const { bridgeToValue, setBridgeToValue } = useBridgeFormContext();
  return (
    <div className="my-5">
      <label className="flex items-center select-none mb-3">
        <input
          type="checkbox"
          className="bridge-checkbox mr-2"
          checked={bridgeToValue.isCustomToken}
          onChange={(e) =>
            setBridgeToValue({
              ...bridgeToValue,
              isCustomToken: e.target.checked,
            })
          }
        />
        I&apos;m transferring to a destination address
      </label>
      {bridgeToValue.isCustomToken && (
        <input
          type="text"
          className="bridge-input"
          placeholder="Destination address"
          value={bridgeToValue.customTokenAddress ?? ''}
          onChange={(e) =>
            setBridgeToValue({
              ...bridgeToValue,
              customTokenAddress: e.target.value,
            })
          }
        />
      )}
    </div>
  );
}

function BridgeEntry() {
  const {
    bridgeFromValue,
    setBridgeFromValue,
    bridgeToValue,
    setBridgeToValue,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
    openPreviewModal,
  } = useBridgeFormContext();

  const { open } = useTokenSelectorContext();

  async function openTokenSelector({
    type,
    ...rest
  }: Parameters<typeof open>[number] & { type: 'from' | 'to' }) {
    const tokenMeta = await open(rest);
    console.log('selected tokenMeta', tokenMeta);
    setBridgeFromValue({ ...bridgeFromValue, tokenMeta });
    setBridgeToValue({ ...bridgeToValue, tokenMeta });
  }

  const wallet = useWalletConnectContext();
  const { transfer, setupRainbowBridge } = useRainbowBridge();

  useEffect(() => {
    setupRainbowBridge();
  }, [setupRainbowBridge, wallet.ETH.accountId]);

  async function transferRainbowBridge() {
    const { tokenMeta, amount, chain: from } = bridgeFromValue;
    const { chain: to } = bridgeToValue;

    const res = await transfer({
      token: tokenMeta,
      amount: (amount ?? 1).toString(),
      from,
      recipient: wallet[to]?.accountId,
      sender: wallet[from]?.accountId,
    });
    console.log('transferRainbowBridge', res);
  }

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
            onChangeChain={() => exchangeChain()}
          />
        </div>
        <InputToken model={bridgeFromValue} onChange={setBridgeFromValue}>
          <SelectTokenButton
            token={bridgeFromValue.tokenMeta}
            onClick={() =>
              openTokenSelector({
                type: 'from',
                chain: bridgeFromValue.chain,
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
          style={{ backgroundColor: 'transparent' }}
          inputReadonly
          onChange={setBridgeToValue}
        >
          <SelectTokenButton
            token={bridgeToValue.tokenMeta}
            onClick={() =>
              openTokenSelector({
                type: 'to',
                chain: bridgeToValue.chain,
                token: bridgeToValue.tokenMeta,
              })
            }
          />
        </InputToken>
        <CustomToken />
        <BridgeRoutes />
        <Button
          type="primary"
          size="large"
          className="w-full"
          disabled={bridgeSubmitStatus !== 'preview'}
          onClick={openPreviewModal}
        >
          {bridgeSubmitStatusText}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between">
        <Button text onClick={handleOpenHistory}>
          Bridge Transaction History
        </Button>
        <div
          className="flex items-center rounded-lg px-2 py-1"
          style={{
            color: '#EBF479',
            backgroundColor: 'rgba(235, 244, 121, 0.2)',
          }}
        >
          <SvgIcon name="IconInfo" className="mr-2" />3 transactions to be
          claimed
        </div>
      </div>
    </div>
  );
}
export default BridgeEntry;
