import * as React from 'react';

import { OrderlyUnderMaintainIcon } from './components/Common/Icons';
export default function BlockOrderBookTip() {
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
