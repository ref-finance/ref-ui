import React, { useState } from 'react';
import { WrapNearIconDark, WrapNearIconLight } from '~components/icon';

export function WrapNearIcon() {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? <WrapNearIconLight /> : <WrapNearIconDark />}
    </div>
  );
}
