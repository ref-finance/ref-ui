import React, { useEffect, useState, useContext } from 'react';
import { USNIcon } from '~components/icon/Common';
import { FormattedMessage } from 'react-intl';

export default function USNBuyComponent() {
  return (
    <div className="flex items-end cursor-pointer">
      <div className="relative z-10 flex items-center justify-center bg-black w-7 h-7 rounded-full overflow-hidden border-2 border-greenColor">
        <USNIcon></USNIcon>
      </div>
      <div className="flex items-center text-xs text-chartBg bg-stableTab rounded-md h-6 -ml-4 pl-5 pr-3 relative mb-px">
        <FormattedMessage id="buy"></FormattedMessage>
      </div>
    </div>
  );
}
