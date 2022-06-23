import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '../../services/ft-contract';
import { toRealSymbol } from '../../utils/token';
import { shareToUserTotal } from './RemoveLiquidity';
import { Card } from '../card/Card';
import { QuestionTip } from '../../components/layout/TipWrapper';
import BigNumber from 'bignumber.js';
import { useCanFarm, useCanFarmV1, useCanFarmV2 } from '../../state/farm';
import { useFarmStake } from '../../state/farm';
import { Pool, canFarmV1, canFarmV2 } from '../../services/pool';
import { Link, useHistory } from 'react-router-dom';
import { FarmDot } from '~components/icon';
import { ShareInFarmV2 } from '../layout/ShareInFarm';
import { useYourliquidity } from '../../state/pool';

export function BackToStablePoolList() {
  const history = useHistory();

  return (
    <div className="flex items-center text-base text-farmText ">
      <span
        onClick={() => history.push('/sauce')}
        className="hover:text-white  cursor-pointer"
      >
        <span className="pr-1.5">{'<'}</span>
        <span>
          <FormattedMessage id="sauce" defaultMessage="Sauce" />
        </span>
      </span>
    </div>
  );
}

export const Images = ({
  tokens,
  size,
  className,
}: {
  tokens: TokenMetadata[];
  size?: string;
  className?: string;
}) => {
  return (
    <div className={`${className} flex items-center flex-shrink-0`}>
      {tokens?.map((token, index) => {
        const icon = token?.icon;
        const id = token?.id;
        if (icon)
          return (
            <img
              key={id || 0 + index}
              className={`inline-block h-${size || 10} w-${
                size || 10
              } rounded-full border border-gradientFromHover -ml-1 bg-cardBg`}
              src={icon}
            />
          );
        return (
          <div
            key={id || 0 + index}
            className={`inline-block h-${size || 10} w-${
              size || 10
            } rounded-full bg-cardBg border border-gradientFromHover -ml-1 `}
          ></div>
        );
      })}
    </div>
  );
};

export const Symbols = ({
  withArrow,
  tokens,
  size,
  seperator,
}: {
  withArrow?: boolean;
  tokens: TokenMetadata[];
  size?: string;
  seperator?: string;
}) => {
  return (
    <div
      className={`text-white font-bold ${
        withArrow ? 'cursor-pointer' : null
      } ${size}`}
    >
      {tokens?.map((token, index) => (
        <span key={token?.id || index}>
          {index ? seperator || '/' : ''}
          {toRealSymbol(token?.symbol || '')}
        </span>
      ))}
      {withArrow ? <span className="ml-1.5">{'>'}</span> : null}
    </div>
  );
};

export function SharesCard({ shares, pool }: { shares: string; pool: Pool }) {
  const { farmCount: countV1 } = useCanFarmV1(pool.id, true);

  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    pool.id,
    true
  );

  const { farmStakeV1, farmStakeV2, userTotalShare } = useYourliquidity(
    pool.id
  );

  return (
    <Card
      padding={'px-7 xs:px-4 py-4 mb-2'}
      rounded="rounded-2xl"
      className="text-sm flex items-center justify-between"
      width="w-full"
    >
      <span className="text-primaryText flex items-center">
        <FormattedMessage id="my_shares" defaultMessage="Shares" />
        <QuestionTip id="shares_tip" />
      </span>
      <div className="flex items-center  mr-1">
        {shareToUserTotal({
          shares,
          userTotalShare,
          haveFarm: !!countV1 || !!countV2,
          pool,
        })}
        <div className="flex flex-col items-end">
          {countV1 > 0 ? (
            <ShareInFarmV2
              farmStake={farmStakeV1}
              userTotalShare={userTotalShare}
              version={'V1'}
            />
          ) : null}

          {countV2 > 0 ? (
            <ShareInFarmV2
              farmStake={farmStakeV2}
              userTotalShare={userTotalShare}
              version={'V2'}
              poolId={pool.id}
              onlyEndedFarm={endedFarmCountV2 === countV2}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export const StableTokens = ({ tokens }: { tokens: TokenMetadata[] }) => {
  return (
    <div className="flex items-center pt-6 pb-5 ml-4">
      <Images tokens={tokens} />
      <span className="ml-4">
        <Symbols tokens={tokens} size="text-2xl" />
      </span>
    </div>
  );
};
