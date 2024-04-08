import React from 'react';
import { isMobile } from '../../utils/device';
function LimitHeight({ children, maxHeight }: any) {
  if (isMobile()) {
    return (
      <div
        style={{ maxHeight: maxHeight || '40vh' }}
        className="overflow-auto transparentScrollbar"
      >
        {children}
      </div>
    );
  }
  return <div>{children}</div>;
}

export default LimitHeight;
