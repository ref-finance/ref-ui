import { FormattedMessage, useIntl } from 'react-intl';
import React, { useContext, useState } from 'react';
import { FilterIcon } from 'src/components/icon/PoolFilter';
import { ArrowDownLarge } from 'src/components/icon';
import { useShadowRecord } from 'src/stores/liquidityStores';
import {
  ONLY_ZEROS,
  scientificNotationToString,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from 'src/utils/numbers';
import { openUrl } from 'src/services/commonV3';
import { VEARROW } from 'src/components/icon/Referendum';
import { isStablePool } from 'src/services/near';
import { getStablePoolDecimal } from 'src/pages/stable/StableSwapEntry';
import { Link } from 'react-router-dom';
import { useFarmStake } from 'src/state/farm';
import { StakeListContext } from 'src/components/pool/YourLiquidityV1';

export const PoolIdNotExist = () => {
  const intl = useIntl();
  return (
    <span className="relative right-6  bottom-px whitespace-nowrap text-redwarningColor">
      {intl.formatMessage({
        id: 'poolIdNotExist',
        defaultMessage: 'does not exist!',
      })}
    </span>
  );
};

export function SelectUi({
  onChange,
  list,
  curvalue,
  shrink,
  className,
}: {
  onChange: (e: any) => void;
  list: any;
  curvalue: string;
  shrink?: string;
  className?: string;
}) {
  const [showSelectBox, setShowSelectBox] = useState(false);
  const switchSelectBoxStatus = () => {
    setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  return (
    <div
      className={`relative flex ${
        shrink ? 'items-end' : 'items-center '
      } lg:mr-5 outline-none`}
    >
      <span className="lg:hidden mr-2">
        <FilterIcon onShow={showSelectBox} />
      </span>
      <span className="text-white text-sm mr-2.5 xs:hidden md:hidden">
        <FormattedMessage id="filter_by" defaultMessage="Filter by" />
      </span>

      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={`flex items-center justify-between min-w-24 h-5 rounded-full px-2 box-border border cursor-pointer text-xs outline-none ${
          shrink ? 'xs:w-8 md:w-8' : ''
        } ${
          showSelectBox
            ? 'border-greenColor text-white'
            : 'border-farmText text-farmText'
        }`}
      >
        <label
          className={`whitespace-nowrap lg:text-white ${
            shrink ? 'xs:hidden md:hidden' : ''
          }`}
        >
          {curvalue ? list[curvalue] : null}
        </label>
        <ArrowDownLarge />
      </span>
      <div
        className={`absolute z-50 top-8 right-0 border border-farmText bg-cardBg rounded-md min-w-24 ${
          showSelectBox ? '' : 'hidden'
        }`}
      >
        {Object.entries(list).map((item: any, index) => (
          <p
            key={item[0] + item[1]}
            onMouseDown={() => {
              onChange(item[0]);
            }}
            className={`flex items-center p-4 text-xs h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-white hover:bg-opacity-10 hover:text-opacity-100
            ${
              item[0] == curvalue
                ? 'bg-white bg-opacity-10 text-opacity-100'
                : ''
            }
            `}
          >
            {item[1]}
          </p>
        ))}
      </div>
    </div>
  );
}

export const ShadowRecordLockedAmount = ({
  poolId,
  textClassName,
  linkClass,
  textContainerClassName,
}: {
  poolId: number;
  linkClass?: string;
  textClassName?: string;
  textContainerClassName?: string;
}) => {
  const shadowRecords = useShadowRecord((state) => state.shadowRecords);
  const inBurrow = shadowRecords?.[Number(poolId)]?.shadow_in_burrow;
  const decimal = isStablePool(poolId) ? getStablePoolDecimal(poolId) : 24;
  if (!inBurrow) return null;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        openUrl('https://app.burrow.finance');
      }}
      className={
        linkClass
          ? linkClass
          : 'text-primaryText flex whitespace-nowrap items-center'
      }
    >
      <span>
        {toPrecision(
          toReadableNumber(
            decimal,
            scientificNotationToString(inBurrow.toString())
          ),
          2
        )}
      </span>
      <span className="mx-1 lowercase">
        <FormattedMessage id="Supplied" defaultMessage={'supplied'} />
      </span>
      <span className="mr-1">
        <FormattedMessage id="in" defaultMessage={'in'} />
      </span>
      <div
        className={
          textContainerClassName
            ? textContainerClassName
            : 'text-primaryText flex items-center hover:text-gradientFrom flex-shrink-0'
        }
      >
        <span
          className={textClassName !== undefined ? textClassName : 'underline'}
        >
          Burrow
        </span>
        <span className="ml-0.5">
          <VEARROW />
        </span>
      </div>
    </div>
  );
};

export const ClassicFarmAmount = ({
  poolId,
  onlyEndedFarmV2,
  linkClass = '',
  textContainerClassName = '',
  textClassName,
  farmVersion,
}: {
  poolId: number;
  farmVersion: 'v1' | 'v2';
  onlyEndedFarmV2?: boolean;
  linkClass?: string;
  textContainerClassName?: string;
  textClassName?: string;
}) => {
  const { stakeList, v2StakeList, finalStakeList } =
    useContext(StakeListContext);
  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });
  const farmStakeAmount = farmVersion === 'v1' ? farmStakeV1 : farmStakeV2;
  const farmStakeText =
    farmVersion === 'v1' ? (
      'Legacy Farms'
    ) : (
      <FormattedMessage id="classic_farms" />
    );
  const decimal = isStablePool(poolId) ? getStablePoolDecimal(poolId) : 24;

  const link =
    farmVersion === 'v1'
      ? '/farms'
      : `/v2farms/${poolId}-${onlyEndedFarmV2 ? 'e' : 'r'}`;

  return (
    <Link
      to={link}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={linkClass ? linkClass : 'text-primaryText mb-1.5 flex'}
    >
      <span>
        {toPrecision(
          toReadableNumber(
            decimal,
            scientificNotationToString(farmStakeAmount.toString())
          ),
          2
        )}
      </span>
      <span className="mx-1">
        <FormattedMessage id="in" defaultMessage={'in'} />
      </span>
      <div
        className={
          textContainerClassName
            ? textContainerClassName
            : 'text-primaryText flex items-center hover:text-gradientFrom flex-shrink-0'
        }
      >
        <span
          className={textClassName !== undefined ? textClassName : 'underline'}
        >
          {farmStakeText}
        </span>

        <span className="ml-0.5">
          <VEARROW />
        </span>
      </div>
    </Link>
  );
};

export const ClassicFarmAmountMobile = ({ poolId, onlyEndedFarmV2 }) => {
  const { stakeList, v2StakeList, finalStakeList } =
    useContext(StakeListContext);
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });
  const decimal = isStablePool(poolId) ? getStablePoolDecimal(poolId) : 24;

  return (
    <Link
      to={{ pathname: `/v2farms/${poolId}-${onlyEndedFarmV2 ? 'e' : 'r'}` }}
      // target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="text-primaryText mb-1.5 flex items-center text-xs"
    >
      <span>
        {toPrecision(
          toReadableNumber(
            decimal,
            scientificNotationToString(farmStakeV2.toString())
          ),
          2
        )}
      </span>
      <span className="mx-1">
        <FormattedMessage id="in" defaultMessage={'in'} />
      </span>
      <span className="border-b border-primaryText">
        <FormattedMessage id="classic_farms" />
      </span>
      <span className="text-gradientFrom ml-0.5">
        <VEARROW />
      </span>
    </Link>
  );
};
