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
import { canFarm } from '~services/pool';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { isMobile } from '~utils/device';

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
      className={`items-center inline-flex text-xs text-gradientFrom rounded-full py-0.5 border border-${
        forStable ? 'gradientFrom' : 'transparent'
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

export const ShareInFarmV2 = ({
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
    <div className={`flex items-center  text-xs ml-4 xs:ml-2`}>
      <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" />
      <div className="self-start whitespace-nowrap flex items-center">
        <span className="text-farmText">
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? '< 0.1'
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{' '}
        </span>
        &nbsp;
        <span className="mx-1 text-farmText">
          <FormattedMessage id="in" defaultMessage="in" />
        </span>
        <Link
          to={'/farms'}
          target="_blank"
          className="flex items-center cursor-pointer"
        >
          <span className="text-gradientFrom mr-1">
            <FormattedMessage id="farm" defaultMessage="farm" />
          </span>
          <span>
            <HiOutlineExternalLink color="#00c6a2" />
          </span>
        </Link>
      </div>
    </div>
  );
};
