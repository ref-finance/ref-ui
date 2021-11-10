import React from 'react';
import { FormattedMessage } from 'react-intl';

export const FarmStamp = () => {
  return (
    <div className="p-1 rounded border border-gradientFrom text-gradientFrom text-xs">
      <FormattedMessage id="farms" defaultMessage="Farms" />
    </div>
  );
};
