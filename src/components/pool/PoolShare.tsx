import { getVEPoolId } from 'src/pages/ReferendumPage';
import getConfig from 'src/services/config';
import { openUrl } from 'src/services/commonV3';
import {
  ONLY_ZEROS,
  percent,
  scientificNotationToString,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from 'src/utils/numbers';
import { LOVE_TOKEN_DECIMAL } from 'src/state/referendum';
import { FormattedMessage } from 'react-intl';
import { VEARROW } from 'src/components/icon/Referendum';
import { isStablePool } from 'src/services/near';
import { getStablePoolDecimal } from 'src/pages/stable/StableSwapEntry';
import React, { useContext } from 'react';
import {
  useFarmerSeedsStore,
  useShadowRecordStore,
  useStakeListStore,
} from 'src/stores/liquidityStores';
import { BigNumber } from 'bignumber.js';
import { useFarmStake } from 'src/state/farm';
import { Link } from 'react-router-dom';
import getConfigV2 from 'src/services/configV2';
import {
  getPoolAvailableShare,
  INewPool,
  useFarmStakeAmount,
  useNewPoolData,
} from 'src/components/pool/useNewPoolData';
import { LinkIcon } from 'src/components/icon/Portfolio';
const configV2 = getConfigV2();

export const PoolFarmAmount = ({
  poolId,
  onlyEndedFarmV2,
  linkClass,
  textContainerClassName,
  textClassName,
  farmVersion,
  styleType,
}: {
  poolId: number;
  farmVersion?: 'v1' | 'v2';
  onlyEndedFarmV2?: boolean;
  linkClass?: string;
  textContainerClassName?: string;
  textClassName?: string;
  styleType?: 'portfolio';
}) => {
  const farmStakeAmount = useFarmStakeAmount({ poolId, farmVersion });
  const isShadowPool = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    poolId?.toString()
  );

  let link = '';
  if (isShadowPool && farmVersion !== 'v1') {
    link = `/v2farms/${poolId}-${onlyEndedFarmV2 ? 'e' : 'r'}`;
  } else {
    switch (farmVersion) {
      case 'v1':
        link = '/farms';
        break;
      case 'v2':
        link = `/v2farms/${poolId}-${onlyEndedFarmV2 ? 'e' : 'r'}`;
        break;
    }
  }

  if (!Number(farmStakeAmount)) {
    return null;
  }

  const farmStakeText =
    farmVersion === 'v1' ? (
      'Legacy Farms'
    ) : (
      <FormattedMessage id="classic_farms" />
    );
  const decimal = isStablePool(poolId) ? getStablePoolDecimal(poolId) : 24;

  let containerStyle,
    linkIconNode = <VEARROW />;
  if (styleType === 'portfolio') {
    containerStyle = {
      color: '#fff',
    };
    linkIconNode = (
      <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
    );
  }

  return (
    <Link
      to={link}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={containerStyle}
      className={linkClass !== undefined ? linkClass : 'text-primaryText flex'}
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
          textContainerClassName !== undefined
            ? textContainerClassName
            : 'flex items-center hover:text-gradientFrom flex-shrink-0'
        }
      >
        <span
          className={textClassName !== undefined ? textClassName : 'underline'}
        >
          {farmStakeText}
        </span>

        <span className="ml-1">{linkIconNode}</span>
      </div>
    </Link>
  );
};

export const PoolShareYourLiquidityV1 = ({
  supportFarmV1,
  endedFarmV1,
  farmStakeV1,
  supportFarmV2,
  endedFarmV2,
  farmStakeV2,
  onlyEndedFarmV2,

  pool,
  lptAmount,
  shares,
}) => {
  const isShadowPool = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    pool.id?.toString()
  );
  const { newPool } = useNewPoolData({ pool, shares });

  const { availableShare, availableShareNonDivisible, farmShare } =
    newPool || {};

  let classicFarmNode = null;
  if (isShadowPool) {
    classicFarmNode = (
      <PoolFarmAmount
        poolId={pool.id}
        onlyEndedFarmV2={onlyEndedFarmV2}
        farmVersion={'v2'}
      />
    );
  } else {
    classicFarmNode = (
      <>
        {(supportFarmV1 > endedFarmV1 || Number(farmStakeV1) > 0) && (
          <PoolFarmAmount poolId={pool.id} farmVersion={'v1'} />
        )}
        {(supportFarmV2 > endedFarmV2 || Number(farmStakeV2) > 0) && (
          <PoolFarmAmount
            poolId={pool.id}
            onlyEndedFarmV2={onlyEndedFarmV2}
            farmVersion={'v2'}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={'mb-1.5'}>{classicFarmNode}</div>

      {Number(getVEPoolId()) === Number(pool.id) &&
      !!getConfig().REF_VE_CONTRACT_ID ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openUrl('/referendum');
          }}
          className="text-primaryText mb-1.5 flex whitespace-nowrap items-center"
        >
          <span>
            {toPrecision(
              ONLY_ZEROS.test(
                toNonDivisibleNumber(
                  LOVE_TOKEN_DECIMAL,
                  toReadableNumber(24, lptAmount || '0')
                )
              )
                ? '0'
                : toReadableNumber(24, lptAmount || '0'),
              2
            )}
          </span>
          <span className="mx-1">
            <FormattedMessage id="locked" defaultMessage={'locked'} />
          </span>
          <span className="mr-1">
            <FormattedMessage id="in" defaultMessage={'in'} />
          </span>
          <div className="text-primaryText flex items-center hover:text-gradientFrom flex-shrink-0">
            <span className="underline">
              <FormattedMessage id="vote_capital" defaultMessage={'VOTE'} />
            </span>
            <span className="ml-0.5">
              <VEARROW />
            </span>
          </div>
        </div>
      ) : null}

      <ShadowInBurrowAmount
        poolId={pool.id}
        linkClass={
          'text-primaryText flex whitespace-nowrap items-center mb-1.5'
        }
        shadowRecordsKey={'shadow_in_burrow'}
      />

      {ONLY_ZEROS.test(availableShare) ||
      (supportFarmV1 === 0 && supportFarmV2 === 0) ? null : (
        <div>
          <span
            className={'text-gradientFrom'}
            title={availableShareNonDivisible}
          >
            {Number(availableShare) < 0.01
              ? '<0.01'
              : toPrecision(availableShare, 2)}
          </span>

          <span className="ml-1">
            <FormattedMessage id="available" />
          </span>
        </div>
      )}
    </>
  );
};

export const ShadowInBurrowAmount = ({
  poolId,
  textClassName,
  linkClass,
  textContainerClassName,
  shadowRecordsKey = 'shadow_in_burrow',
  onlyEndedFarmV2,
  styleType,
}: {
  poolId: number;
  linkClass?: string;
  textClassName?: string;
  textContainerClassName?: string;
  onlyEndedFarmV2?: boolean;
  shadowRecordsKey?: 'shadow_in_burrow' | 'shadow_in_farm';
  styleType?: 'portfolio';
}) => {
  const shadowRecords = useShadowRecordStore((state) => state.shadowRecords);
  const inBurrow = shadowRecords?.[Number(poolId)]?.[shadowRecordsKey];
  const decimal = isStablePool(poolId) ? getStablePoolDecimal(poolId) : 24;
  if (!inBurrow) return null;

  let prefixNode;
  let suffixNode;
  let link;
  if (shadowRecordsKey === 'shadow_in_burrow') {
    prefixNode = (
      <span className="lowercase">
        <FormattedMessage id="Supplied" defaultMessage={'supplied'} />
        &nbsp;
      </span>
    );

    suffixNode = 'Burrow';
    link = `https://app.burrow.finance/tokenDetail/shadow_ref_v1-${poolId}`;
  } else {
    link = `/v2farms/${poolId}-${onlyEndedFarmV2 ? 'e' : 'r'}`;
    suffixNode = <FormattedMessage id="classic_farms" />;
  }

  let containerStyle,
    linkIconNode = <VEARROW />;
  if (styleType === 'portfolio') {
    containerStyle = {
      color: '#fff',
    };
    linkIconNode = (
      <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        openUrl(link);
      }}
      className={
        linkClass
          ? linkClass
          : 'text-primaryText flex whitespace-nowrap items-center'
      }
      style={containerStyle}
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
      &nbsp;
      {prefixNode}
      <span className="mr-1">
        <FormattedMessage id="in" defaultMessage={'in'} />
      </span>
      <div
        className={
          textContainerClassName !== undefined
            ? textContainerClassName
            : 'flex items-center hover:text-gradientFrom flex-shrink-0'
        }
      >
        <span
          className={
            textClassName !== undefined
              ? textClassName
              : 'underline cursor-pointer'
          }
        >
          {suffixNode}
        </span>
        <span className="ml-0.5">{linkIconNode}</span>
      </div>
    </div>
  );
};

export const PoolAvailableAmount = ({ pool, shares, className = '' }) => {
  const { newPool } = useNewPoolData({ pool, shares });
  return (
    <span className={className} title={newPool?.availableShareNonDivisible}>
      {toPrecision(newPool?.availableShare, 2)}
    </span>
  );
};

export const PoolAvailablePercent = ({ pool, shares, denominator }) => {
  const shadowRecords = useShadowRecordStore((state) => state.shadowRecords);
  const { availableShare, availableShareNonDivisible } = getPoolAvailableShare({
    pool,
    shadowRecords,
    shares,
  });
  const sharePercent = percent(
    availableShareNonDivisible || '0',
    denominator || '1'
  );
  let node = toPrecision(sharePercent?.toString() || '0', 2);
  if (Number(sharePercent) > 0 && Number(sharePercent) < 0.01) {
    node = '<0.01';
  }
  return <span>{node}</span>;
};
