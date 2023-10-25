import React, { useState } from 'react';
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
import { HiOutlineExternalLink } from '../reactIcons';
import { Link } from 'react-router-dom';
import { isMobile } from 'src/utils/device';

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

  const [hover, setHovet] = useState<boolean>(false);

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
      className={`items-center inline-flex text-xs  rounded-full py-0.5 border  ${
        hover
          ? 'border-gradientFrom text-gradientFrom'
          : 'border-transparent text-gradientFrom'
      }  px-2 cursor-pointer`}
      onMouseEnter={() => setHovet(true)}
      onMouseLeave={() => setHovet(false)}
    >
      <FarmDot inFarm={Number(farmShare) > 0} className="mr-1 flex-shrink-0" />
      <div
        className={`self-start whitespace-nowrap w-full flex items-center ${
          forStable ? `${hover ? 'text-white' : 'text-primaryText'}` : ''
        }`}
      >
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

        {hover && forStable && (
          <span className="ml-0.5">
            <HiOutlineExternalLink />
          </span>
        )}
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
  onlyEndedFarm,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  poolId?: number;
  onlyEndedFarm?: boolean;
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
          to={
            poolId
              ? `/v2farms/${poolId}-${onlyEndedFarm ? 'e' : 'r'}`
              : '/farms'
          }
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center cursor-pointer justify-end"
        >
          {version && (
            <span className="mr-1 text-gradientFrom  text-left">{version}</span>
          )}
          <span className="text-gradientFrom mr-1">
            <FormattedMessage id="farms" defaultMessage="Farms" />
          </span>

          <span className="text-right">
            <HiOutlineExternalLink color="#00c6a2" />
          </span>
        </Link>
      </div>
    </div>
  );
};
