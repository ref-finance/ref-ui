import React, { useState } from 'react';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';

import { IconArrowDown, IconClose } from '../assets';
import Button from './Button';

function BridgeRouteItem({ className }: { className?: string }) {
  return (
    <div
      className={`bg-opacity-10 rounded-xl p-4 ${className ?? ''}`}
      style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg" />
          <div className="text-slate-500 text-base font-medium ">Stargate</div>
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
        <div className="text-white text-sm font-medium">~0.99997 ETH</div>
        <div className="text-right text-slate-500 text-xs font-normal ">
          ~1 min｜Bridge fee
          <span
            data-for="bridge-gas-fee"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class="reactTip"
            data-html={true}
            data-tip={`<div>$2.52 Gas + </div><div>$0.73 Stargate fee</div>`}
          >
            $3.25
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
            3 Bridge Routes
          </span>
          <Button text onClick={toggleOpenModal}>
            <IconClose />
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
            3 Routes
            <IconArrowDown className="transform -rotate-90 ml-2" />
          </Button>
        </div>
        <BridgeRouteItem className="mt-4" />
      </div>
      <BridgeSelectRoutesModal
        isOpen={isOpen}
        toggleOpenModal={toggleOpenModal}
      />
    </>
  );
}

export default BridgeRoutes;
