import React, { useMemo, useState } from 'react';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';

import SvgIcon from './SvgIcon';
import Button from './Button';
import useRainbowBridge from '../hooks/useRainbowBridge';
import { useBridgeFormContext } from '../providers/bridgeForm';
import {
  formatAmount,
  formatChainName,
  formatSortAddress,
  formatUSDCurrency,
} from '../utils/format';
import { BridgeConfig } from '../config';
import { useBridgeTransactionContext } from '../providers/bridgeTransaction';
import { useAutoResetState } from '../hooks/useHooks';

export default function BridgePreviewModal({
  toggleOpenModal,
  ...props
}: Modal.Props & { toggleOpenModal: () => void }) {
  const { actionLoading, transfer } = useRainbowBridge();

  const { bridgeFromValue, bridgeToValue, estimatedGasFee } =
    useBridgeFormContext();

  const [loading, setLoading] = useAutoResetState(false, 1000);

  const { openBridgeTransactionStatusModal } = useBridgeTransactionContext();

  const sender = bridgeFromValue?.accountAddress;
  const recipient =
    bridgeToValue.isCustomAccountAddress && bridgeToValue.customAccountAddress
      ? bridgeToValue.customAccountAddress
      : bridgeToValue.accountAddress;

  const confirmInfo = useMemo(
    () => ({
      tokenMeta: bridgeFromValue?.tokenMeta,
      amount: bridgeFromValue?.amount,
      from: bridgeFromValue?.chain,
      to: bridgeToValue?.chain,
      recipient,
      sender,
      constTime: BridgeConfig.Rainbow.wait,
      bridgeFee: formatUSDCurrency(estimatedGasFee, '0.01'),
      output: bridgeToValue.amount,
      minimumReceived: bridgeFromValue.amount,
    }),
    [
      bridgeFromValue.amount,
      bridgeFromValue?.chain,
      bridgeFromValue?.tokenMeta,
      bridgeToValue.amount,
      bridgeToValue?.chain,
      estimatedGasFee,
      recipient,
      sender,
    ]
  );

  async function handleTransfer() {
    const { tokenMeta: token, amount, chain: from } = bridgeFromValue;

    const result = await transfer({
      token,
      amount,
      from,
      recipient,
      sender,
    });
    openBridgeTransactionStatusModal(result);
    toggleOpenModal();
  }
  return (
    <>
      <Modal {...props} onRequestClose={toggleOpenModal}>
        <div className="bridge-modal" style={{ width: '428px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-base text-white font-medium">Preview</span>
            <div className="flex items-center">
              <Button size="small" plain onClick={() => setLoading(true)}>
                <SvgIcon
                  name="IconRefresh"
                  className={loading ? 'animate-spin text-primary' : ''}
                />
              </Button>
              <Button className="ml-4" text onClick={toggleOpenModal}>
                <SvgIcon name="IconClose" />
              </Button>
            </div>
          </div>
          <div>
            <div className="text-center mb-3">You will send</div>
            <div className="flex items-center justify-center text-white mb-4">
              <div className="w-7 h-7 bg-white rounded-full mr-3 overflow-hidden">
                <img src={confirmInfo?.tokenMeta?.icon} />
              </div>
              {formatAmount(confirmInfo?.amount)}{' '}
              {confirmInfo?.tokenMeta?.symbol}
            </div>
            <div className="flex items-center gap-5 mb-7">
              <div
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
              >
                <div className="mb-2">
                  From{' '}
                  <span className="text-white">
                    {formatChainName(confirmInfo?.from)}
                  </span>
                </div>
                <div className="text-white">
                  {formatSortAddress(confirmInfo.sender)}
                </div>
              </div>
              <div
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
              >
                <div className="mb-2">
                  To{' '}
                  <span className="text-white">
                    {formatChainName(confirmInfo?.to)}
                  </span>
                </div>
                <div className="text-white">{formatSortAddress(recipient)}</div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between">
                <div>Est. Output</div>
                <div>
                  <div className="text-white text-right">
                    {confirmInfo.output} {confirmInfo?.tokenMeta?.symbol}
                  </div>
                  {/* <div className="text-xs text-right">(~$1885.23)</div> */}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Bridge Fee</div>
                <div>
                  <div className="text-white text-right">
                    <span
                      className="underline cursor-pointer ml-1"
                      data-for="bridge-gas-fee"
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-html={true}
                      data-tip={`<div>${confirmInfo?.bridgeFee} Gas + </div><div>$0.00 Rainbow fee</div>`}
                    >
                      {confirmInfo?.bridgeFee}
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
              <div className="flex justify-between">
                <div>Minimum Received</div>
                <div>
                  <div className="text-white text-right">
                    {confirmInfo.minimumReceived} {confirmInfo.tokenMeta.symbol}
                  </div>
                  {/* <div className="text-xs text-right">(~$1885.23)</div> */}
                </div>
              </div>
              <div className="flex justify-between">
                <div>Cost Time</div>
                <div>
                  <div className="text-white text-right">
                    {confirmInfo.constTime} mins
                  </div>
                </div>
              </div>
              <div>
                <Button
                  type="primary"
                  size="large"
                  className="w-full"
                  loading={actionLoading}
                  onClick={handleTransfer}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
