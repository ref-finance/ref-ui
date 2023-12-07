import React, { useState } from 'react';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';

import Button from './Button';
import SvgIcon from './SvgIcon';
import LogoRainbow from './../assets/logo-rainbow.png';
import { SupportBridgeChannels, BridgeConfig } from './../config';
import { useBridgeFormContext } from '../providers/bridgeForm';
import { formatUSDCurrency } from '../utils/format';

function BridgeRouteItem({ className }: { className?: string }) {
  const { bridgeFromValue, estimatedGasFee } = useBridgeFormContext();
  return (
    <div
      className={`bg-opacity-10 rounded-xl p-4 ${className ?? ''}`}
      style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg">
            <img src={LogoRainbow} alt="" />
          </div>
          <div className="text-slate-500 text-base font-medium ">Rainbow</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-black rounded-md">
            <div className="text-10px " style={{ color: '#6AFFE4' }}>
              Best Return
            </div>
          </div>
          <div className="px-2 py-0.5 bg-black rounded-md">
            <div className="text-10px " style={{ color: '#5077FF' }}>
              Fastest
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-white text-sm font-medium">
          ~{bridgeFromValue.amount} {bridgeFromValue.tokenMeta.symbol}
        </div>
        <div className="text-right text-slate-500 text-xs font-normal ">
          {BridgeConfig.Rainbow.wait} mins ｜Bridge fee{' '}
          <span
            className="underline cursor-pointer ml-1"
            data-for="bridge-gas-fee"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class="reactTip"
            data-html={true}
            data-tip={`<div>${formatUSDCurrency(
              estimatedGasFee
            )} Gas + </div><div>$0.00 Rainbow fee</div>`}
          >
            {formatUSDCurrency(estimatedGasFee)}
            <ReactTooltip
              id="bridge-gas-fee"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
              textColor="#C6D1DA"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

function BridgeSelectRoutesModal({
  toggleOpenModal,
  ...props
}: Modal.Props & { toggleOpenModal: () => void }) {
  return (
    <Modal {...props} onRequestClose={toggleOpenModal}>
      <div className="bridge-modal" style={{ width: '428px' }}>
        <div className="flex items-center justify-between">
          <span className="text-base text-white font-medium">
            {SupportBridgeChannels.length} Bridge Routes
          </span>
          <Button text onClick={toggleOpenModal}>
            <SvgIcon name="IconClose" />
          </Button>
        </div>
        <div>
          <BridgeRouteItem className="mt-4" />
        </div>
      </div>
    </Modal>
  );
}

function BridgeRoutes() {
  const [isOpen, setIsOpen] = useState(false);
  function toggleOpenModal() {
    setIsOpen(!isOpen);
  }
  const { bridgeFromValue } = useBridgeFormContext();

  const hasAmount = bridgeFromValue.amount && bridgeFromValue.amount !== '0';

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span>Select Bridge Route</span>
          <Button
            className="inline-flex items-center text-xs"
            size="small"
            text
            onClick={toggleOpenModal}
          >
            {hasAmount ? `${SupportBridgeChannels.length} Routes` : '-'}
            <SvgIcon
              name="IconArrowDown"
              className="transform -rotate-90 ml-2"
            />
          </Button>
        </div>
        {hasAmount && <BridgeRouteItem className="mt-4" />}
      </div>
      <BridgeSelectRoutesModal
        isOpen={isOpen}
        toggleOpenModal={toggleOpenModal}
      />
    </>
  );
}

export default BridgeRoutes;
