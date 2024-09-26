import * as React from 'react';
import { PerpOrderlyTip, PerpOrderlyTipMobile } from './components/PerpHeader';
import { useClientMobile } from '../../utils/device';
export default function OrderBookPerp() {
  const isMobile = useClientMobile();
  return (
    <div className=" relative" style={{ zIndex: 20 }}>
      <div className="mx-auto relative xs:bottom-6 bottom-9">
        {/* todo  */}
        {!isMobile && <PerpOrderlyTip />}
      </div>
      {/* todo  */}
      {isMobile && <PerpOrderlyTipMobile />}
    </div>
  );
}
