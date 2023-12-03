import React, { useState } from 'react';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';

import SvgIcon from './SvgIcon';
import Button from './Button';
import useRainbowBridge from '../hooks/useRainbowBridge';
import { useRouter } from '../hooks/useRouter';
import { useBridgeFormContext } from '../providers/bridgeForm';
import { useWalletConnectContext } from '../providers/walletConcent';

export default function BridgePreviewModal({
  toggleOpenModal,
  ...props
}: Modal.Props & { toggleOpenModal: () => void }) {
  const [isOpenStatusModal, setIsOpenStatusModal] = useState(false);

  const { transferLoading, transfer } = useRainbowBridge();

  const { bridgeFromValue, bridgeToValue } = useBridgeFormContext();
  const wallet = useWalletConnectContext();

  async function handleTransfer() {
    const { tokenMeta, amount, chain: from } = bridgeFromValue;
    const { chain: to } = bridgeToValue;

    const res = await transfer({
      token: tokenMeta,
      amount: (amount ?? 1).toString(),
      from,
      recipient: wallet[to]?.accountId,
      sender: wallet[from]?.accountId,
    });
    console.log('handleTransfer', res);
  }
  return (
    <>
      <Modal {...props} onRequestClose={toggleOpenModal}>
        <div className="bridge-modal" style={{ width: '428px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-base text-white font-medium">Preview</span>
            <div className="flex items-center">
              <Button size="small" className="mr-4" plain>
                <SvgIcon name="IconRefresh" />
              </Button>
              <Button text onClick={toggleOpenModal}>
                <SvgIcon name="IconClose" />
              </Button>
            </div>
          </div>
          <div>
            <div className="text-center mb-3">You will send</div>
            <div className="flex items-center justify-center text-white mb-4">
              <div className="w-7 h-7 bg-white rounded-full mr-3" />1 ETH
            </div>
            <div className="flex items-center gap-5 mb-7">
              <div
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
              >
                <div className="mb-2">
                  From <span className="text-white">Ethereum</span>
                </div>
                <div className="text-white">0x3bCB...7AB717</div>
              </div>
              <div
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(126, 138, 147, 0.10)' }}
              >
                <div className="mb-2">
                  To <span className="text-white">NEAR</span>
                </div>
                <div className="text-white">0x3bCB...7AB717</div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between">
                <div>Est. Output</div>
                <div>
                  <div className="text-white text-right">0.00035 ETH</div>
                  <div className="text-xs text-right">(~$1885.23)</div>
                </div>
              </div>
              <div className="flex justify-between">
                <div>Bridge Fee</div>
                <div>
                  <div className="text-white text-right">0.00035 ETH</div>
                  <div className="text-xs text-right">
                    <span
                      className="underline cursor-pointer ml-1"
                      data-for="bridge-gas-fee"
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-html={true}
                      data-tip={`<div>$2.52 Gas + </div><div>$0.73 Stargate fee</div>`}
                    >
                      ($3.25)
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
                  <div className="text-white text-right">0.00035 ETH</div>
                  <div className="text-xs text-right">(~$1885.23)</div>
                </div>
              </div>
              <div className="flex justify-between">
                <div>Cost Time</div>
                <div>
                  <div className="text-white text-right">{`< 5 mins`}</div>
                </div>
              </div>
              <div>
                <Button
                  type="primary"
                  size="large"
                  className="w-full"
                  disabled={transferLoading}
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
