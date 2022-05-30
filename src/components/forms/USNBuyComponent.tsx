import React, { useEffect, useState, useContext } from 'react';
import { USNIcon } from '~components/icon/Common';
import { FormattedMessage } from 'react-intl';

export default function USNBuyComponent({ hover }: { hover?: boolean }) {
  return (
    <div className="flex items-end cursor-pointer">
      <div
        className={`flex items-center text-xs text-chartBg  rounded-full xs:hidden ${
          hover
            ? 'bg-gradient-to-b from-senderHot to-gradientFrom'
            : 'bg-gradientFrom'
        }      
         h-5 -mr-4 pl-2 pr-5 relative`}
        style={{
          bottom: '2px',
        }}
      >
        <FormattedMessage id="get" defaultMessage="Get"></FormattedMessage>
      </div>
      <div className="relative z-10 flex items-center justify-center bg-black xs:w-7 xs:h-7 w-6 h-6 rounded-full overflow-hidden border border-greenColor">
        <USNIcon></USNIcon>
      </div>
    </div>
  );
}
