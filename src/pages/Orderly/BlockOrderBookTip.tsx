import * as React from 'react';

import { isMobile } from 'src/utils/device';
import { OrderlyUnderMaintainIcon } from './components/Common/Icons';
const disbaledWallet = ['okx-wallet'];
export default function BlockOrderBookTip() {
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const isBlock = disbaledWallet.includes(selectedWalletId);
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ marginTop: 'calc(100% - 90%)' }}
    >
      <OrderlyUnderMaintainIcon removeText={true}></OrderlyUnderMaintainIcon>
      <div className="text-white text-base gotham_bold text-center">
        This wallet doesn't support Orderbook.
      </div>
    </div>
  );
}
