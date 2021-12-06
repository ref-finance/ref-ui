import React from 'react';
import {
  percent,
  percentLess,
  percentOf,
  subtraction,
  toInternationalCurrencySystem,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '~utils/numbers';
import { FormattedMessage, useIntl } from 'react-intl';
import { FarmDot } from '~components/icon';
import BigNumber from 'bignumber.js';

export const ShareInFarm = ({
  farmStake,
  userTotalShare,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
}) => {
  const farmShare = Number(farmStake).toLocaleString('fullwide', {
    useGrouping: false,
  });

  const farmSharePercent = percent(
    farmShare,
    userTotalShare.toNumber().toLocaleString('fullwide', { useGrouping: false })
  ).toString();

  return (
    <div className="items-center inline-flex text-xs text-gradientFrom rounded-full py-0.5 border border-transparent hover:border-gradientFrom px-2 xs:pr-0 md:pr-0 cursor-pointer">
      <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" />
      <div className="self-start">
        <span className="text-gradientFrom">
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? '< 0.1'
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{' '}
        </span>
        &nbsp;
        <FormattedMessage id="in_farm" defaultMessage="in Farm" />
      </div>
    </div>
  );
};
