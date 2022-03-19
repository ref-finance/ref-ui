import React, { useEffect, useMemo, useState } from 'react';
import Loading from '~components/layout/Loading';
import {
  useTokenBalances,
  useWhitelistStableTokens,
  useWhitelistTokens,
} from '../../state/token';
import SquareRadio from '~components/radio/SquareRadio';
import StableSwap from '~components/stableswap/StableSwap';
import AddLiquidityComponent from '~components/stableswap/AddLiquidity';
import { usePool, useStablePool } from '~state/pool';
import { isMobile } from '~utils/device';
import { RemoveLiquidityComponent } from '~components/stableswap/RemoveLiquidity';
import TokenReserves, {
  calculateTotalStableCoins,
} from '~components/stableswap/TokenReserves';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import getConfig from '~services/config';
import { StableSwapLogo } from '~components/icon/StableSwap';
import { useWalletTokenBalances } from '../../state/token';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Pool, getStablePoolFromCache } from '../../services/pool';
import { Card } from '../../components/card/Card';
import {
  TokenMetadata,
  ftGetTokensMetadata,
  ftGetTokenMetadata,
} from '../../services/ft-contract';
import { toRealSymbol } from '../../utils/token';
import {
  STABLE_POOL_USN_ID,
  STABLE_POOL_ID,
  STABLE_TOKEN_IDS,
  STABLE_TOKEN_USN_IDS,
} from '../../services/near';
import { useFarmStake } from '../../state/farm';
import BigNumber from 'bignumber.js';
import { divide, toReadableNumber } from '../../utils/numbers';
import { ShareInFarm } from '../../components/layout/ShareInFarm';
import { STABLE_LP_TOKEN_DECIMALS } from '../../components/stableswap/AddLiquidity';
import {
  toInternationalCurrencySystem,
  toPrecision,
  scientificNotationToString,
} from '../../utils/numbers';
import { SolidButton } from '~components/button/Button';
import { OutlineButton } from '../../components/button/Button';
import { Images, Symbols } from '~components/stableswap/CommonComp';

const RenderDisplayTokensAmounts = ({
  tokens,
  coinsAmounts,
}: {
  tokens: TokenMetadata[];
  coinsAmounts: { [id: string]: BigNumber };
}) => {
  return (
    <div className="flex items-center">
      {tokens.map((token, i) => {
        return (
          <span className="flex" key={token.id}>
            {i ? <span className="mx-3 text-white">+</span> : null}
            <span className="flex items-center">
              <span className="mr-1.5">
                <img
                  src={token.icon}
                  alt=""
                  className="w-4 h-4 boder border-gradientFrom rounded-full"
                />
              </span>

              <span className="text-white text-sm">
                {toInternationalCurrencySystem(
                  scientificNotationToString(coinsAmounts[token.id].toString())
                )}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

function formatePoolData({
  pool,
  userTotalShare,
  farmStake,
  tokens,
  share,
  stakeList,
}: {
  pool: Pool;
  userTotalShare: BigNumber;
  farmStake: string | number;
  tokens: TokenMetadata[];
  share: string;
  stakeList: Record<string, string>;
}) {
  const tokensMap: {
    [id: string]: TokenMetadata;
  } = tokens.reduce((pre, cur) => ({ ...pre, [cur.id]: cur }), {});

  const { totalCoins, coinsAmounts } = calculateTotalStableCoins(
    [pool],
    tokensMap
  );

  const displayTVL = `$${toInternationalCurrencySystem(totalCoins, 2)}`;

  const displayMyShareAmount = toPrecision(
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, share),
    2,
    true
  );
  const displaySharePercent = toPrecision(
    scientificNotationToString(divide(share, pool.shareSupply).toString()),
    2
  );

  const displayShareInFarm = (
    <ShareInFarm farmStake={farmStake} userTotalShare={userTotalShare} />
  );

  return {
    displayTVL,
    coinsAmounts,
    displayMyShareAmount,
    displaySharePercent,
    displayShareInFarm,
    shares: share,
    stakeList,
    farmStake,
  };
}

function StablePoolCard({
  stablePool,
  tokens,
  poolData,
}: {
  stablePool: Pool;
  tokens: TokenMetadata[];
  poolData: {
    displayTVL: string | JSX.Element;
    coinsAmounts: { [id: string]: BigNumber };
    displayMyShareAmount: string | JSX.Element;
    displaySharePercent: string | JSX.Element;
    displayShareInFarm: string | JSX.Element;
    shares: string;
    stakeList: Record<string, string>;
    farmStake: string | number;
  };
}) {
  const { shares, stakeList, farmStake } = poolData;
  const history = useHistory();
  const LiquidityButton = () => {
    return (
      <div className="w-full bg-liquidityBtb flex items-center py-4 px-6 rounded-b-2xl mb-2">
        <SolidButton
          className="w-full text-center flex items-center justify-center py-3 mr-2 text-sm"
          onClick={() =>
            history.push(`stableswap/${stablePool.id}`, {
              stableTab: 'add_liquidity',
              shares,
              stakeList,
              farmStake,
              pool: stablePool,
            })
          }
        >
          <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
        </SolidButton>
        <OutlineButton
          className="w-full py-3 ml-2 text-sm"
          onClick={() =>
            history.push(`stableswap/${stablePool.id}`, {
              stableTab: 'remove_liquidity',
              shares,
              stakeList,
              farmStake,
              pool: stablePool,
            })
          }
        >
          <FormattedMessage
            id="remove_liquidity"
            defaultMessage="Remove Liquidity"
          />
        </OutlineButton>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      <Card
        width="w-full"
        padding="px-6 pt-8 pb-4"
        rounded="rounded-t-2xl"
        className="flex flex-col"
      >
        <div className="flex items-center justify-between pb-6">
          <Images tokens={tokens} />
          <Link
            to={{
              pathname: `stableswap/${stablePool.id}`,
              state: {
                shares,
                stakeList,
                farmStake,
                pool: stablePool,
              },
            }}
          >
            <Symbols withArrow tokens={tokens} />
          </Link>
        </div>

        <div className="grid grid-cols-10">
          <div className="col-span-7 text-left">
            <span className="flex flex-col">
              <span className="text-sm text-farmText">
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
              <span className="text-lg text-white py-2">
                {poolData.displayTVL}
              </span>
              <span>
                <RenderDisplayTokensAmounts
                  tokens={tokens}
                  coinsAmounts={poolData.coinsAmounts}
                />
              </span>
            </span>
          </div>

          <div className="col-span-3">
            <span className="flex flex-col">
              <span className="text-sm text-farmText pl-2">
                <FormattedMessage id="share" defaultMessage="Share" />
              </span>
              <span className="flex items-center py-2 pl-2">
                <span className="text-lg text-white">
                  {poolData.displayMyShareAmount}
                </span>
                <span className="text-sm text-farmText pl-3">
                  {poolData.displaySharePercent}%
                </span>
              </span>

              <span>{poolData.displayShareInFarm}</span>
            </span>
          </div>
        </div>
      </Card>
      <LiquidityButton />
    </div>
  );
}

export function StableSwapPageEntry() {
  const [pool3tokens, setPool3tokens] = useState<Pool>();
  const [pool2tokens, setPool2tokens] = useState<Pool>();
  const [allStableTokens, setAllStableTokens] = useState<TokenMetadata[]>();

  const { shares: shares3token, stakeList: stakeList3token } =
    usePool(STABLE_POOL_ID);
  const { shares: shares2token, stakeList: stakeList2token } =
    usePool(STABLE_POOL_USN_ID);

  const farmStake3token = useFarmStake({
    poolId: Number(STABLE_POOL_ID),
    stakeList: stakeList3token,
  });
  const farmStake2token = useFarmStake({
    poolId: Number(STABLE_POOL_USN_ID),
    stakeList: stakeList2token,
  });

  const allStableTokensIds = new Array(
    ...new Set(STABLE_TOKEN_IDS.concat(STABLE_TOKEN_USN_IDS))
  );

  useEffect(() => {
    Promise.all(allStableTokensIds.map((id) => ftGetTokenMetadata(id))).then(
      setAllStableTokens
    );
  }, []);

  const userTotalShare3token = BigNumber.sum(shares3token, farmStake3token);

  const userTotalShare2token = BigNumber.sum(shares2token, farmStake2token);

  useEffect(() => {
    getStablePoolFromCache(STABLE_POOL_USN_ID.toString()).then((res) => {
      setPool2tokens(res[0]);
    });
    getStablePoolFromCache(STABLE_POOL_ID.toString()).then((res) => {
      setPool3tokens(res[0]);
    });
  }, []);

  const tokens2token = allStableTokens?.filter((token) =>
    STABLE_TOKEN_USN_IDS.includes(token.id)
  );

  const tokens3token = allStableTokens?.filter((token) =>
    STABLE_TOKEN_IDS.includes(token.id)
  );

  if (
    !pool3tokens ||
    !pool2tokens ||
    !shares2token ||
    !shares3token ||
    !allStableTokens ||
    !farmStake3token ||
    !farmStake2token
  )
    return <Loading />;

  const poolData2token = formatePoolData({
    pool: pool2tokens,
    userTotalShare: userTotalShare2token,
    farmStake: farmStake2token,
    tokens: tokens2token,
    share: shares2token,
    stakeList: stakeList2token,
  });

  const poolData3token = formatePoolData({
    pool: pool3tokens,
    userTotalShare: userTotalShare3token,
    farmStake: farmStake3token,
    tokens: tokens3token,
    share: shares3token,
    stakeList: stakeList3token,
  });

  return (
    <div className="m-auto lg:w-580px md:w-5/6 xs:w-full xs:p-2 flex flex-col">
      <div className="flex justify-center -mt-10 mb-2 xs:hidden md:hidden">
        <StableSwapLogo></StableSwapLogo>
      </div>
      <span className="text-sm text-primaryText mb-6">
        <FormattedMessage
          id="stable_swap_note"
          defaultMessage="SAUCE is designed for liquidity pools with pegged assets, delivering optimal prices."
        />
      </span>

      <StablePoolCard
        stablePool={pool2tokens}
        tokens={tokens2token}
        poolData={poolData2token}
      />

      <StablePoolCard
        stablePool={pool3tokens}
        tokens={tokens3token}
        poolData={poolData3token}
      />

      <TokenReserves
        tokens={allStableTokens}
        pools={[pool2tokens, pool3tokens]}
        hiddenMag={true}
        className="pt-6"
      />
    </div>
  );
}
