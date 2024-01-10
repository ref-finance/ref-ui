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
  inStr,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  inStr?: string;
}) => {
  if (Number(farmStake) === 0) return null;
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
          }% `}
        </span>
        &nbsp;
        <span>
          {inStr ? (
            inStr
          ) : (
            <FormattedMessage id="in_farm" defaultMessage="in Farm" />
          )}
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
  shadowBurrowShare,
  forStable,
  version,
  poolId,
  onlyEndedFarm,
  className,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  shadowBurrowShare?: any;
  forStable?: boolean;
  version?: string;
  poolId?: number;
  onlyEndedFarm?: boolean;
  className?: string;
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
    <div className={className}>
      <SharePercentNode
        share={farmShare}
        sharePercent={farmSharePercent}
        link={
          poolId ? `/v2farms/${poolId}-${onlyEndedFarm ? 'e' : 'r'}` : '/farms'
        }
        version={version}
      />

      {Number(shadowBurrowShare?.stakeAmount) !== 0 && (
        <SharePercentNode
          share={shadowBurrowShare?.stakeAmount}
          sharePercent={shadowBurrowShare?.sharePercent}
          link={'https://app.burrow.finance/'}
          version={''}
          isInBurrow={true}
        />
      )}
    </div>
  );
};

const SharePercentNode = ({
  share,
  sharePercent,
  link,
  version,
  isInBurrow = false,
}) => {
  return (
    <div className={`flex items-center  text-xs ml-4 xs:ml-2`}>
      <FarmDot inFarm={Number(share) > 0} className="mr-1" />
      <div className="self-start whitespace-nowrap flex items-center">
        <span className="text-farmText w-10 text-right">
          {`${
            Number(sharePercent) < 0.1 && Number(sharePercent) > 0
              ? '< 0.1'
              : toPrecision(sharePercent, 2, false, false)
          }% `}{' '}
        </span>
        &nbsp;
        <span className="mx-1 text-farmText text-left">
          <FormattedMessage id="in" defaultMessage="in" />
        </span>
        <Link
          to={link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center cursor-pointer justify-end"
        >
          {version && (
            <span className="mr-1 text-gradientFrom  text-left">{version}</span>
          )}
          <span className="text-gradientFrom mr-1">
            {isInBurrow ? (
              'Burrow'
            ) : (
              <FormattedMessage id="farms" defaultMessage="Farms" />
            )}
          </span>

          <span className="text-right">
            <HiOutlineExternalLink color="#00c6a2" />
          </span>
        </Link>
      </div>
    </div>
  );
};
