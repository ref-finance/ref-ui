import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';

import Button from './Button';
import SvgIcon from './SvgIcon';
import { BridgeConfig } from './../config';
import { useBridgeFormContext } from '../providers/bridgeForm';
import { formatAmount, formatUSDCurrency } from '../utils/format';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import LogoRainbow from './../assets/logo-rainbow.png';
import LogoStargate from './../assets/logo-stargate.png';
import Big from 'big.js';

const routeConfig = {
  Rainbow: { logo: LogoRainbow, ...BridgeConfig.Rainbow },
  Stargate: { logo: LogoStargate, ...BridgeConfig.Stargate },
};

function BridgeRouteItem({
  channel,
  className,
  onClick,
}: {
  channel: BridgeModel.BridgeSupportChannel;
  className?: string;
  onClick?: () => void;
}) {
  const { bridgeToValue, channelInfoMap } = useBridgeFormContext();
  const route = routeConfig[channel];

  return (
    route && (
      <div
        className={`bg-opacity-10 rounded-xl p-4 ${className ?? ''}`}
        style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg">
              <img src={route.logo} alt="" />
            </div>
            <div className="text-slate-500 text-base font-medium ">
              {channel}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-black rounded-md">
              <div className="text-10px " style={{ color: '#6AFFE4' }}>
                Optimal Path
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
            ~
            {formatAmount(
              channelInfoMap?.[channel]?.minAmount,
              bridgeToValue.tokenMeta.decimals
            )}{' '}
            {bridgeToValue.tokenMeta.symbol}
          </div>
          <div className="text-right text-slate-500 text-xs font-normal ">
            ~{route.wait} mins ｜Bridge fee{' '}
            <span className="ml-1">
              {formatUSDCurrency(channelInfoMap?.[channel]?.usdFee, '0.01')}
              <CustomTooltip id="bridge-gas-fee" />
            </span>
          </div>
        </div>
      </div>
    )
  );
}

function BridgeSelectRoutesModal({
  toggleOpenModal,
  ...props
}: Modal.Props & { toggleOpenModal: () => void }) {
  const { supportBridgeChannels, setBridgeChannel } = useBridgeFormContext();

  function handleSelectRoute(channel: BridgeModel.BridgeSupportChannel) {
    setBridgeChannel(channel);
    toggleOpenModal();
  }

  return (
    <Modal
      {...props}
      overlayClassName="modal-overlay"
      onRequestClose={toggleOpenModal}
    >
      <div className="bridge-modal" style={{ width: '428px' }}>
        <div className="flex items-center justify-between">
          <span className="text-base text-white font-medium">Bridge Route</span>
          <Button text onClick={toggleOpenModal}>
            <SvgIcon name="IconClose" />
          </Button>
        </div>
        <div>
          {supportBridgeChannels.map((channel) => (
            <BridgeRouteItem
              key={channel}
              channel={channel}
              className="mt-4"
              onClick={() => handleSelectRoute(channel)}
            />
          ))}
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
  const {
    bridgeFromValue,
    bridgeChannel,
    setBridgeChannel,
    supportBridgeChannels,
    channelInfoMapLoading,
  } = useBridgeFormContext();

  const showRoute = useMemo(
    () =>
      !channelInfoMapLoading &&
      bridgeFromValue.amount &&
      bridgeFromValue.amount !== '0',
    [channelInfoMapLoading, bridgeFromValue.amount]
  );

  useEffect(() => {
    if (!supportBridgeChannels.includes(bridgeChannel)) {
      setBridgeChannel(supportBridgeChannels[0]);
    }
  }, [supportBridgeChannels, bridgeChannel, setBridgeChannel]);

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
            {showRoute
              ? `${supportBridgeChannels.length} Route${
                  supportBridgeChannels.length > 1 ? 's' : ''
                } 
            `
              : '-'}
            <SvgIcon
              name="IconArrowDown"
              className="transform -rotate-90 ml-2"
            />
          </Button>
        </div>
        {showRoute && supportBridgeChannels.length > 0 && (
          <BridgeRouteItem channel={bridgeChannel} className="mt-4" />
        )}
      </div>
      <BridgeSelectRoutesModal
        isOpen={isOpen}
        toggleOpenModal={toggleOpenModal}
      />
    </>
  );
}

export default BridgeRoutes;
