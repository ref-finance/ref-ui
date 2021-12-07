import React from 'react';
import { FormattedMessage } from 'react-intl';

export const FarmStamp = () => {
  return (
    <div className="px-1 rounded border border-gradientFrom text-gradientFrom text-xs">
      <FormattedMessage id="farms" defaultMessage="Farms" />
    </div>
  );
};

export function FarmDot({
  inFarm,
  className,
}: {
  inFarm: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full  ${
        inFarm ? 'bg-gradientFrom' : ''
      } w-2 h-2 border border-gradientFrom ${className}`}
    />
  );
}
