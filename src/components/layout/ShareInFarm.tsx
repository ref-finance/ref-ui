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
import { canFarm } from '~services/pool';

export const ShareInFarm = ({
  farmStake,
  userTotalShare,
  forStable,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
}) => {
  const farmShare = Number(farmStake).toLocaleString('fullwide', {
    useGrouping: false,
  });

  const farmSharePercent = userTotalShare.isGreaterThan(0)
    ? percent(
        farmShare,
        userTotalShare
          .toNumber()
          .toLocaleString('fullwide', { useGrouping: false })
      ).toString()
    : '0';

  return (
    <div
      className={`items-center inline-flex text-xs ${
        forStable ? 'text-primaryText' : 'text-gradientFrom'
      } rounded-full py-0.5 border border-${
        forStable ? 'primaryText' : 'transparent'
      } hover:border-gradientFrom hover:text-gradientFrom px-2 cursor-pointer`}
    >
      <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" />
      <div className="self-start whitespace-nowrap">
        <span className="">
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
