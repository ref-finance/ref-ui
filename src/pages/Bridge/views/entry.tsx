import React from 'react';

import BridgeRoutes from '../components/BridgeRoutes';
import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import InputToken from '../components/InputToken';
import SlippageSelector from '../components/StableSlipSelector';
import { SelectTokenButton } from '../components/TokenSelector';
import { useBridgeFormContext } from '../providers/bridgeForm';
import { useRouterViewContext } from '../providers/routerView';
import { useTokenSelectorContext } from '../providers/selectToken';
import {
  IconExchange,
  IconInfo,
  IconRefresh,
  IconSetting,
  IconWarning,
} from './../assets';

function FormHeader() {
  const { slippageTolerance, setSlippageTolerance } = useBridgeFormContext();
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="text-base text-white">Bridge</div>
      <div className="flex items-center gap-3">
        <Button size="small" plain>
          <IconRefresh />
        </Button>
        <SlippageSelector
          slippageTolerance={slippageTolerance}
          onChange={(val) => setSlippageTolerance(val)}
        >
          <Button size="small" plain>
            <IconSetting />
          </Button>
        </SlippageSelector>
      </div>
    </div>
  );
}

function GasFeeWarning({ className }: { className?: string }) {
  return (
    <div className={`flex items-center text-red-400 ${className ?? ''}`}>
      <IconWarning className="mr-1" />
      Not enough gas (0.0035 ETH needed)
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
          value={bridgeToValue.customTokenAddress}
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
  const { changeRouterView } = useRouterViewContext();
  const {
    bridgeFromValue,
    setBridgeFromValue,
    bridgeToValue,
    setBridgeToValue,
    exchangeChain,
    bridgeSubmitStatus,
    bridgeSubmitStatusText,
  } = useBridgeFormContext();

  const { open: openTokenSelector } = useTokenSelectorContext();

  return (
    <div className="bridge-entry-container">
      <form className="bridge-plane shadow-4xl">
        <FormHeader />
        <div>
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
              token={bridgeFromValue.token}
              onClick={() =>
                openTokenSelector({
                  chain: bridgeFromValue.chain,
                  token: bridgeFromValue.token,
                })
              }
            />
          </InputToken>
          <GasFeeWarning className="mt-2" />
          <div className="flex justify-center my-3">
            <Button text onClick={exchangeChain}>
              <IconExchange />
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
          <InputToken model={bridgeToValue} onChange={setBridgeToValue}>
            <SelectTokenButton
              token={bridgeToValue.token}
              onClick={() =>
                openTokenSelector({
                  chain: bridgeToValue.chain,
                  token: bridgeToValue.token,
                })
              }
            />
          </InputToken>
        </div>
        <CustomToken />
        <BridgeRoutes />
        <Button
          type="primary"
          size="large"
          className="w-full"
          disabled={bridgeSubmitStatus !== 'preview'}
        >
          {bridgeSubmitStatusText}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between">
        <Button text onClick={() => changeRouterView('history')}>
          Bridge Transaction History
        </Button>
        <div
          className="flex items-center rounded-lg px-2 py-1"
          style={{
            color: '#EBF479',
            backgroundColor: 'rgba(235, 244, 121, 0.2)',
          }}
        >
          <IconInfo className="mr-2" />3 transactions to be claimed
        </div>
      </div>
    </div>
  );
}
export default BridgeEntry;
