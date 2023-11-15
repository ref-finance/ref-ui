import React, { useContext, useEffect, useState } from 'react';
import Loading from '../../components/layout/Loading';
import TokenReserves, {
  calculateTotalStableCoins,
} from '../../components/stableswap/TokenReserves';
import { StableSwapLogo } from '../../components/icon/StableSwap';
import { Link, useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Pool } from '../../services/pool';
import { Card } from '../../components/card/Card';
import { TokenMetadata, ftGetTokenMetadata } from '../../services/ft-contract';
import { AllStableTokenIds, NEARX_POOL_ID } from '../../services/near';
import BigNumber from 'bignumber.js';
import { toReadableNumber, percent } from '../../utils/numbers';
import { ShareInFarm } from '../../components/layout/ShareInFarm';
import {
  STABLE_LP_TOKEN_DECIMALS,
  RATED_POOL_LP_TOKEN_DECIMALS,
} from '../../components/stableswap/AddLiquidity';
import {
  toInternationalCurrencySystem,
  toPrecision,
  scientificNotationToString,
} from '../../utils/numbers';
import { ConnectToNearBtn, SolidButton } from '../../components/button/Button';
import { OutlineButton } from '../../components/button/Button';
import { Images, Symbols } from '../../components/stableswap/CommonComp';
import { FarmMiningIcon } from '../../components/icon';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import { PoolData, useAllStablePoolData } from '../../state/sauce';
import { useYourliquidity } from '../../state/pool';
import { useCanFarmV1, useCanFarmV2 } from '../../state/farm';
import {
  STABLE_POOL_TYPE,
  isStablePool,
  isRatedPool,
} from '../../services/near';
import {
  STABLE_TOKEN_IDS,
  STABLE_TOKEN_USN_IDS,
  USD_CLASS_STABLE_POOL_IDS,
  BTC_CLASS_STABLE_POOL_IDS,
  NEAR_CLASS_STABLE_POOL_IDS,
} from '../../services/near';
import { useClientMobile } from 'src/utils/device';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { REF_FI_POOL_ACTIVE_TAB } from '../pools/utils';
import {
  ForbiddenIcon,
  ForbiddenIconLarge,
} from '../../components/icon/FarmBoost';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

export const getStablePoolDecimal = (id: string | number) => {
  if (isRatedPool(id)) return RATED_POOL_LP_TOKEN_DECIMALS;
  else if (isStablePool(id)) return STABLE_LP_TOKEN_DECIMALS;
};

export const RenderDisplayTokensAmounts = ({
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
              <span className="mr-1.5 flex-shrink-0">
                <img
                  src={token.icon}
                  alt=""
                  className="w-4 h-4 border border-gradientFrom rounded-full"
                />
              </span>

              <span
                className="text-white text-sm"
                title={toPrecision(
                  scientificNotationToString(coinsAmounts[token.id].toString()),
                  0
                )}
              >
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

export function formatePoolData({
  pool,
  userTotalShare,
  farmStake,
  tokens,
  shares,
  poolTVL,
}: PoolData) {
  const isSignedIn = getCurrentWallet()?.wallet?.isSignedIn();

  const tokensMap: {
    [id: string]: TokenMetadata;
  } = tokens.reduce((pre, cur) => ({ ...pre, [cur.id]: cur }), {});

  const { coinsAmounts } = calculateTotalStableCoins([pool], tokensMap);

  const parsedUsertotalShare = scientificNotationToString(
    userTotalShare.toString()
  );

  const displayTVL =
    poolTVL === undefined
      ? '-'
      : `$${toInternationalCurrencySystem(poolTVL?.toString() || '0', 2)}`;

  const TVLtitle =
    poolTVL === undefined ? '-' : `${toPrecision(poolTVL.toString(), 2)}`;

  const displayMyShareAmount = isSignedIn
    ? toPrecision(
        toReadableNumber(getStablePoolDecimal(pool.id), parsedUsertotalShare),
        2,
        true
      )
    : '-';

  const sharePercentValue = scientificNotationToString(
    percent(parsedUsertotalShare, pool.shareSupply).toString()
  );

  const sharePercent =
    Number(sharePercentValue) > 0 && Number(sharePercentValue) < 0.01
      ? '< 0.01%'
      : `${toPrecision(sharePercentValue, 2)}%`;

  const displaySharePercent = isSignedIn ? sharePercent : '';

  return {
    displayTVL,
    coinsAmounts,
    displayMyShareAmount,
    displaySharePercent,
    shares,
    TVLtitle,
    pool,
  };
}

function StablePoolCard({
  stablePool,
  tokens,
  poolData,
  index,
  chosenState,
  setChosesState,
}: {
  stablePool: Pool;
  tokens: TokenMetadata[];
  index: number;
  chosenState: number;
  setChosesState: (index: number) => void;
  poolData: {
    displayTVL: string | JSX.Element;
    coinsAmounts: { [id: string]: BigNumber };
    displayMyShareAmount: string | JSX.Element;
    displaySharePercent: string | JSX.Element;
    shares: string;
    TVLtitle: string;
  };
}) {
  const history = useHistory();

  const { shares, farmStakeV1, farmStakeV2, userTotalShare } = useYourliquidity(
    stablePool.id
  );

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const { farmCount: countV1, endedFarmCount: endedFarmCountV1 } = useCanFarmV1(
    stablePool.id,
    true
  );
  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    stablePool.id,
    true
  );

  const haveFarm =
    !!(countV1 > endedFarmCountV1) || !!(countV2 > endedFarmCountV2);

  const multiMining =
    countV2 > 0
      ? countV2 - endedFarmCountV2 > 1
      : countV1 - endedFarmCountV1 > 1;

  const onlyEndedFarmsV2 = endedFarmCountV2 === countV2;

  const needForbidden = Number(stablePool.id) === Number(NEARX_POOL_ID);

  const intl = useIntl();

  function getForbiddenTip() {
    const tip = intl.formatMessage({
      id: 'pool_stop_tip',
      defaultMessage: 'This pool has been stopped.',
    });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }

  return (
    <div
      className={`w-full flex flex-col relative overflow-hidden rounded-2xl mb-4

      ${needForbidden ? 'stablePoolEnd' : ''}

      ${
        chosenState === index
          ? needForbidden
            ? 'border border-primaryText'
            : 'border border-gradientFrom'
          : 'border border-transparent'
      }

      `}
      onTouchEnd={() => {
        if (chosenState !== index) setChosesState(index);
      }}
    >
      <Card
        width="w-full"
        padding="px-6 pt-8 pb-4 xs:px-4 md:px-4"
        rounded="rounded-2xl"
        className={`flex flex-col`}
        onMouseEnter={() => setChosesState(index)}
        onMouseLeave={() => setChosesState(null)}
      >
        <span
          className={`${
            !haveFarm ? 'hidden' : ''
          } pl-3 absolute -right-5 -top-8 pr-8 pt-8   rounded-2xl text-black text-xs ${
            needForbidden ? 'bg-primaryText' : 'bg-gradientFrom'
          }   `}
        >
          <Link
            to={
              countV2
                ? `/v2farms/${stablePool.id}-${onlyEndedFarmsV2 ? 'e' : 'r'}`
                : '/farms'
            }
            target={'_blank'}
            className="flex items-center"
          >
            <span className="relative top-px">
              <FormattedMessage
                id={multiMining ? 'multi_rewards' : 'farms'}
                defaultMessage={multiMining ? 'Multi-Rewards' : 'Farms'}
              />
            </span>
            <span className={!multiMining ? 'hidden' : 'relative top-px'}>
              <FarmMiningIcon color="black" w="20" h="20" />
            </span>
          </Link>
        </span>

        <div className="flex items-center justify-between pb-6">
          <Images tokens={tokens} />
          <div
            className=" text-white"
            data-type="info"
            data-place="top"
            data-multiline={true}
            data-tooltip-html={getForbiddenTip()}
            data-tooltip-id={'forbiddenTip' + 'sauce_' + stablePool.id}
            data-class="reactTip"
          >
            <Link
              to={{
                pathname: `/sauce/${stablePool.id}`,
                state: {
                  shares,
                  pool: stablePool,
                },
              }}
              onClick={(e) => {
                if (needForbidden) {
                  e.preventDefault();
                }
              }}
              className="inline-flex items-center"
            >
              <Symbols withArrow={!needForbidden} tokens={tokens} />
              <span className="ml-2">
                {needForbidden ? <ForbiddenIconLarge /> : null}
              </span>
            </Link>
            {needForbidden ? (
              <CustomTooltip id={'forbiddenTip' + 'sauce_' + stablePool.id} />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-10 xs:flex xs:flex-col">
          <div className="col-span-7 text-left">
            <span className="flex flex-col xs:flex-row xs:justify-between">
              <span className="text-sm text-farmText xs:relative xs:top-1">
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
              <div className="flex flex-col xs:items-end">
                <span
                  className="text-lg lg:w-1/5 whitespace-nowrap text-white md:py-2 lg:py-2 xs:pb-2"
                  title={poolData.TVLtitle}
                >
                  {poolData.displayTVL}
                </span>
                <span>
                  <RenderDisplayTokensAmounts
                    tokens={tokens}
                    coinsAmounts={poolData.coinsAmounts}
                  />
                </span>
              </div>
            </span>
          </div>

          <div className="col-span-3 xs:pt-4">
            <span className="flex flex-col xs:flex-row xs:justify-between">
              <span className="text-sm text-farmText md:pl-2 lg:pl-2 xs:relative xs:top-1">
                <FormattedMessage id="my_shares" defaultMessage="Shares" />
              </span>
              <div className="flex flex-col xs:flex-row xsm:flex-wrap xsm:justify-end">
                <span className="flex items-center pl-2 md:py-2 lg:py-2 xs:pb-2 xs:pr-2">
                  <span className="text-lg text-white ">
                    {poolData.displayMyShareAmount}
                  </span>
                  <span className="text-sm text-farmText pl-3">
                    {poolData.displaySharePercent}
                  </span>
                </span>

                <div className="flex flex-col">
                  {(countV1 > endedFarmCountV1 || Number(farmStakeV1) > 0) && (
                    <Link to={'/farms'} target="_blank">
                      <ShareInFarm
                        farmStake={farmStakeV1}
                        userTotalShare={userTotalShare}
                        forStable
                        version="V1"
                      />
                    </Link>
                  )}
                  {(countV2 > endedFarmCountV2 || Number(farmStakeV2) > 0) && (
                    <Link
                      to={`/v2farms/${stablePool.id}-${
                        onlyEndedFarmsV2 ? 'e' : 'r'
                      }`}
                      target="_blank"
                    >
                      <ShareInFarm
                        farmStake={farmStakeV2}
                        userTotalShare={userTotalShare}
                        forStable
                        version="V2"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </span>
          </div>
        </div>
        <div
          className={`w-full  bg-cardBg flex items-center xs:justify-between pt-6 pb-2 ${
            chosenState === index && isSignedIn ? 'block' : 'hidden'
          }`}
        >
          <SolidButton
            className={`w-full text-center  flex items-center justify-center py-3 mr-2 text-sm`}
            disabled={stablePool.id === Number(NEARX_POOL_ID)}
            style={{
              color: needForbidden ? 'rbga(255,255,255,0.2)' : '',
              background: needForbidden ? '#314351' : '',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/sauce/${stablePool.id}`, {
                stableTab: 'add_liquidity',
                shares,
                pool: stablePool,
              });
            }}
          >
            <FormattedMessage
              id="add_liquidity"
              defaultMessage="Add Liquidity"
            />
          </SolidButton>
          <OutlineButton
            className="w-full py-3 ml-2 text-sm h-11"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/sauce/${stablePool.id}`, {
                stableTab: 'remove_liquidity',
                shares,
                pool: stablePool,
              });
            }}
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </OutlineButton>
        </div>
        <div
          className={` ${
            isSignedIn || chosenState !== index ? 'hidden' : ''
          } px-6 pt-6 pb-2 bg-cardBg `}
        >
          <ConnectToNearBtn />
        </div>
      </Card>
    </div>
  );
}

const SauceSelector = ({
  reserveType,
  setReserveType,
}: {
  reserveType: STABLE_POOL_TYPE;
  setReserveType: (reserveType: STABLE_POOL_TYPE) => void;
}) => {
  const TYPES = [
    STABLE_POOL_TYPE.USD,
    STABLE_POOL_TYPE.BTC,
    STABLE_POOL_TYPE.NEAR,
  ];

  return (
    <div className="bg-cardBg rounded-2xl p-1 flex mb-4">
      {TYPES.map((type, i) => {
        return (
          <div
            className={`rounded-xl  ${
              reserveType === TYPES[i]
                ? 'bg-tabChosen'
                : 'cursor-pointer text-primaryText'
            }  text-white text-lg w-full text-center py-2`}
            onClick={() => setReserveType(TYPES[i])}
          >
            {type.toString()}
          </div>
        );
      })}
    </div>
  );
};

const REF_SAUCE_PAGE_STABLE_CLASS_KEY = 'REF_SAUCE_PAGE_STABLE_CLASS_VALUE';

export default function StableSwapPageEntry() {
  const [reserveType, setReserveType] = useState<STABLE_POOL_TYPE>(
    STABLE_POOL_TYPE[
      localStorage.getItem(REF_SAUCE_PAGE_STABLE_CLASS_KEY)?.toString()
    ] || STABLE_POOL_TYPE.USD
  );

  const history = useHistory();

  localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'stable');
  history.push('/pools');

  const allStablePoolData = useAllStablePoolData();

  const [chosenState, setChosesState] = useState<number>();

  const [allStableTokens, setAllStableTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    Promise.all(AllStableTokenIds.map((id) => ftGetTokenMetadata(id))).then(
      setAllStableTokens
    );
  }, []);
  useEffect(() => {
    setChosesState(null);
    localStorage.setItem(
      REF_SAUCE_PAGE_STABLE_CLASS_KEY,
      reserveType.toString()
    );
  }, [reserveType]);

  if (
    !allStableTokens ||
    !allStablePoolData ||
    allStablePoolData.some((pd) => !pd)
  )
    return <Loading />;

  const formattedPools = allStablePoolData.map((pd) => formatePoolData(pd));

  const displayPoolData =
    reserveType === STABLE_POOL_TYPE.USD
      ? formattedPools.filter((pd) =>
          USD_CLASS_STABLE_POOL_IDS.includes(pd.pool.id.toString())
        )
      : reserveType === STABLE_POOL_TYPE.BTC
      ? formattedPools.filter((pd) =>
          BTC_CLASS_STABLE_POOL_IDS.includes(pd.pool.id.toString())
        )
      : formattedPools.filter((pd) =>
          NEAR_CLASS_STABLE_POOL_IDS.includes(pd.pool.id.toString())
        );

  const displayPools =
    reserveType === STABLE_POOL_TYPE.USD
      ? allStablePoolData.filter((pd) =>
          USD_CLASS_STABLE_POOL_IDS.includes(pd.pool.id.toString())
        )
      : reserveType === STABLE_POOL_TYPE.BTC
      ? allStablePoolData.filter((pd) =>
          BTC_CLASS_STABLE_POOL_IDS.includes(pd.pool.id.toString())
        )
      : allStablePoolData.filter((pd) =>
          NEAR_CLASS_STABLE_POOL_IDS.includes(pd.pool.id.toString())
        );

  const displayPoolRaw = displayPools.map((pd) => pd.pool);

  return (
    <div className="m-auto lg:w-580px md:w-5/6 xs:w-full xs:p-2 flex flex-col">
      <div className="flex justify-center -mt-6 mb-2 ">
        <StableSwapLogo />
      </div>

      <span className="text-sm text-primaryText mb-6 text-center">
        <FormattedMessage
          id="sauce_note"
          defaultMessage="SAUCE is designed for liquidity pools with pegged assets, delivering optimal prices."
        />
      </span>
      <SauceSelector
        reserveType={reserveType}
        setReserveType={setReserveType}
      />

      {displayPoolData.map((poolData, i) => {
        return (
          <StablePoolCard
            stablePool={displayPools[i].pool}
            tokens={displayPools[i].tokens}
            poolData={poolData}
            index={i}
            key={i}
            chosenState={chosenState}
            setChosesState={setChosesState}
          />
        );
      })}

      <TokenReserves
        tokens={allStableTokens}
        pools={displayPoolRaw}
        hiddenMag={true}
        className="pt-6"
        type={reserveType}
        setType={setReserveType}
      />
    </div>
  );
}
