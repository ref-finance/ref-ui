import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '../../services/ft-contract';
import { toRealSymbol } from '../../utils/token';
import { shareToUserTotal } from './RemoveLiquidity';
import { Card } from '../card/Card';
import { QuestionTip } from '../../components/layout/TipWrapper';
import BigNumber from 'bignumber.js';
import { useCanFarm } from '../../state/farm';
import { useFarmStake } from '../../state/farm';
import { Pool } from '../../services/pool';
import { Link, useHistory } from 'react-router-dom';
import { FarmDot } from '~components/icon';
import { ShareInFarmV2 } from '../layout/ShareInFarm';

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

export const Images = ({ tokens }: { tokens: TokenMetadata[] }) => {
  return (
    <div className="flex items-center">
      {tokens.map((token, index) => {
        const { icon, id } = token;
        if (icon)
          return (
            <img
              key={id}
              className={
                'inline-block h-10 w-10 rounded-full border border-gradientFromHover -ml-1 bg-cardBg'
              }
              src={icon}
            />
          );
        return (
          <div
            key={id}
            className={
              'inline-block h-10 w-10 rounded-full bg-cardBg border border-gradientFromHover -ml-1'
            }
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
}: {
  withArrow?: boolean;
  tokens: TokenMetadata[];
  size?: string;
}) => {
  return (
    <div
      className={`text-white font-bold ${
        withArrow ? 'cursor-pointer' : null
      } ${size}`}
    >
      {tokens.map((token, index) => (
        <span key={token.id}>
          {index ? '/' : ''}
          {toRealSymbol(token.symbol)}
        </span>
      ))}
      {withArrow ? <span className="ml-1.5">{'>'}</span> : null}
    </div>
  );
};

export function SharesCard({
  shares,
  userTotalShare,
  stakeList,
  pool,
}: {
  shares: string;
  userTotalShare: BigNumber;
  stakeList: Record<string, string>;
  pool: Pool;
}) {
  const canFarm = useCanFarm(pool.id);

  const farmStake = useFarmStake({
    poolId: pool.id,
    stakeList,
  });

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
          canFarm,
        })}
        {canFarm > 0 ? (
          <ShareInFarmV2
            farmStake={farmStake}
            userTotalShare={userTotalShare}
          />
        ) : null}
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
