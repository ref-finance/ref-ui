import React, { useState } from 'react';
import { WrapNearIconDark, WrapNearIconLight } from 'src/components/icon';

export function WrapNearIcon() {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <WrapNearIconLight
        wrapFillColor={hover ? '' : '#404E58'}
        textColor={hover ? '' : '#9DA6AD'}
      />
    </div>
  );
}
