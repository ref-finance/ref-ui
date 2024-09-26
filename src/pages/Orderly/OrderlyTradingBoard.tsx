import * as React from 'react';
import { PerpOrderlyTip, PerpOrderlyTipMobile } from './components/PerpHeader';
import { useClientMobile } from '../../utils/device';
export default function OrderBookSpot() {
  const isMobile = useClientMobile();
  return (
    <>
      <div className="mx-auto relative xs:bottom-6 bottom-9">
        {/* todo  */}
        {!isMobile && <PerpOrderlyTip />}
      </div>
      {/* todo  */}
      {isMobile && <PerpOrderlyTipMobile></PerpOrderlyTipMobile>}
    </>
  );
}
