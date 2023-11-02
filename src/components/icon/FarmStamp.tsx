import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FarmMiningIcon } from './FarmMining';

export const FarmStamp = () => {
  return (
    <div className="px-1 rounded border border-gradientFrom text-gradientFrom text-xs">
      <FormattedMessage id="farms" defaultMessage="Farms" />
    </div>
  );
};

export const FarmStampNew = ({ multi }: { multi: boolean }) => {
  return (
    <div className="px-1.5 ml-2 rounded-lg border flex items-center border-gradientFrom text-gradientFrom text-xs">
      <span className="whitespace-nowrap">
        <FormattedMessage id="farms" defaultMessage="Farms" />
      </span>

      {multi && (
        <span className="ml-1">
          <FarmMiningIcon w={14} h={14} />
        </span>
      )}
    </div>
  );
};

export const FarmStampNewDCL = ({ multi }: { multi: boolean }) => {
  return (
    <div className="px-1.5 py-px ml-2 rounded-lg border flex items-center border-gradientFrom text-gradientFrom text-xs">
      <span className="whitespace-nowrap">
        <FormattedMessage id="farms" defaultMessage="Farms" />
      </span>

      {multi && (
        <span className="ml-1">
          <FarmMiningIcon w={14} h={14} />
        </span>
      )}
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
