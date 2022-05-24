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
} from '../../utils/numbers';
import { FormattedMessage, useIntl } from 'react-intl';
import { FarmDot } from '../../components/icon';
import BigNumber from 'bignumber.js';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { isMobile } from '~utils/device';

export const ShareInFarm = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
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

  const hundredPercent = Number(farmSharePercent) === 100;
  const zeroPercent = Number(farmSharePercent) === 0;

  return (
    <div
      className={`items-center inline-flex text-xs text-gradientFrom rounded-full py-0.5 border border-${
        forStable ? 'gradientFrom mb-0.5' : 'transparent'
      } hover:border-gradientFrom hover:text-gradientFrom px-2 cursor-pointer`}
      style={{
        width: hundredPercent ? '130px' : zeroPercent ? '125px' : '140px',
      }}
    >
      <FarmDot inFarm={Number(farmShare) > 0} className="mr-1 flex-shrink-0" />
      <div className="self-start whitespace-nowrap w-full flex">
        <span
          className={`${
            hundredPercent ? 'w-9' : zeroPercent ? 'w-6' : 'w-11'
          } text-center`}
        >
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? '< 0.1'
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{' '}
        </span>
        <span>
          &nbsp;
          <FormattedMessage id="in_farm" defaultMessage="in Farm" />
        </span>

        {version && <span className={`ml-1 w-4`}>{version}</span>}
      </div>
    </div>
  );
};

export const ShareInFarmV2 = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
  poolId,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  poolId?: number;
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
    <div className={`flex items-center  text-xs ml-4 xs:ml-2`}>
      <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" />
      <div className="self-start whitespace-nowrap flex items-center">
        <span className="text-farmText w-10 text-right">
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? '< 0.1'
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{' '}
        </span>
        &nbsp;
        <span className="mx-1 text-farmText text-left">
          <FormattedMessage id="in" defaultMessage="in" />
        </span>
        <Link
          to={poolId ? `/farmsBoost/${poolId}-r` : '/farms'}
          target="_blank"
          className="flex items-center cursor-pointer justify-end"
          style={{
            width: '70px',
          }}
        >
          <span className="text-gradientFrom mr-1">
            <FormattedMessage id="farm" defaultMessage="farm" />
          </span>
          {version && (
            <span className="mr-1 text-gradientFrom w-4 text-left">
              {version}
            </span>
          )}
          <span className="text-right">
            <HiOutlineExternalLink color="#00c6a2" />
          </span>
        </Link>
      </div>
    </div>
  );
};
