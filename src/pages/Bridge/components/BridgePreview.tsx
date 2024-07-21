import React, { useMemo, useState } from 'react';
import Modal from 'react-modal';

import SvgIcon from './SvgIcon';
import Button from './Button';
import useBridge from '../hooks/useBridge';
import { useBridgeFormContext } from '../providers/bridgeForm';
import {
  formatAmount,
  formatChainName,
  formatNumber,
  formatSortAddress,
  formatUSDCurrency,
} from '../utils/format';
import { BridgeConfig } from '../config';
import { useBridgeTransactionContext } from '../providers/bridgeTransaction';
import { useAutoResetState } from '../hooks/useHooks';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import Big from 'big.js';
import { toast } from 'react-toastify';
import { storageStore } from '../utils/common';

export default function BridgePreviewModal({
  toggleOpenModal,
  ...props
}: Modal.Props & { toggleOpenModal: () => void }) {
  const { actionLoading, transfer } = useBridge();

  const {
    fromAccountAddress,
    toAccountAddress,
    bridgeFromValue,
    bridgeToValue,
    bridgeChannel,
    estimatedGasFee,
    channelInfoMap,
    slippageTolerance,
  } = useBridgeFormContext();

  const [loading, setLoading] = useAutoResetState(false, 1000);

  const { openBridgeTransactionStatusModal } = useBridgeTransactionContext();

  const sender = fromAccountAddress;
  const recipient = toAccountAddress;

  const confirmInfo = useMemo(
    () => ({
      tokenMeta: bridgeFromValue?.tokenMeta,
      amount: bridgeFromValue?.amount,
      from: bridgeFromValue?.chain,
      to: bridgeToValue?.chain,
      recipient,
      sender,
      constTime: BridgeConfig[bridgeChannel]?.wait,
      bridgeFee: new Big(estimatedGasFee)
        .plus(channelInfoMap?.[bridgeChannel]?.usdFee || 0)
        .toString(),
      minimumReceived: formatAmount(
        channelInfoMap?.[bridgeChannel]?.minAmount,
        bridgeFromValue.tokenMeta?.decimals
      ),
    }),
    [
      bridgeFromValue,
      bridgeToValue,
      bridgeChannel,
      estimatedGasFee,
      channelInfoMap,
      sender,
      recipient,
    ]
  );

  async function handleTransfer() {
    if (new Big(channelInfoMap?.[bridgeChannel]?.minAmount || 0).eq(0)) {
      toast.error(`Minimum Received is 0, can't transfer`);
      return;
    }
    const params = {
      tokenIn: bridgeFromValue.tokenMeta,
      tokenOut: bridgeToValue.tokenMeta,
      amount: bridgeFromValue.amount,
      from: bridgeFromValue.chain,
      to: bridgeToValue.chain,
      recipient,
      sender,
      channel: bridgeChannel,
      slippage: slippageTolerance,
    };
    storageStore().set('bridgeTransferParams', params);
    const result = await transfer(params).catch((err) => {
      console.error(err.message);
      storageStore().remove('bridgeTransferParams');
    });

    if (typeof result === 'string') {
      openBridgeTransactionStatusModal(params, result);
    }
    toggleOpenModal();
  }
  return (
    <>
      <Modal
        {...props}
        overlayClassName="modal-overlay"
        onRequestClose={toggleOpenModal}
      >
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
              {formatNumber(confirmInfo?.amount)}{' '}
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
                <div>Bridge Fee</div>
                <div>
                  <div className="text-white text-right">
                    <span
                      className="underline cursor-pointer ml-1"
                      data-tooltip-id="bridge-gas-fee"
                      data-place="right"
                      data-class="reactTip"
                      data-tooltip-html={`
                        <div>${formatUSDCurrency(
                          estimatedGasFee,
                          '0.01'
                        )} Gas + </div>
                        <div>${formatUSDCurrency(
                          channelInfoMap?.[bridgeChannel]?.usdFee || 0
                        )} ${bridgeChannel} fee</div>`}
                    >
                      {formatUSDCurrency(confirmInfo.bridgeFee, '0.01')}
                      <CustomTooltip id="bridge-gas-fee" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div>Minimum Received</div>
                <div>
                  <div className="text-white text-right">
                    {confirmInfo.minimumReceived}{' '}
                    {confirmInfo.tokenMeta?.symbol}
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
