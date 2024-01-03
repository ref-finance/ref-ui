import React, { useContext } from 'react';
import {
  ModalClose,
  SwitchBtn,
  HandIcon,
  LinkIcon,
} from '../../components/icon';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useEffect, useRef } from 'react';
import { BigNumber } from 'bignumber.js';
import { wallet } from '../../services/near';
import { mftGetBalance } from '../../services/mft-contract';
import Modal from 'react-modal';
import { Link, useHistory } from 'react-router-dom';
import { getMftTokenId } from '../../utils/token';
import { Card } from '../../components/card/Card';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../../services/m-token';
import {
  FarmBoost,
  Seed,
  get_config,
  BoostConfig,
  UserSeedInfo,
} from '../../services/farm';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { isMobile } from '../../utils/device';
import { useTokens } from '../../state/token';
import getConfig from '../../services/config';
import { TokenMetadata, unWrapToken } from '../../services/ft-contract';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import {
  LightningIcon,
  ForbiddenIcon,
  BoostOptIcon,
} from '../../components/icon/FarmBoost';
import { getLoveAmount } from '../../services/referendum';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import { VEARROW } from '../icon/Referendum';
import { openUrl } from '../../services/commonV3';

const config = getConfig();
const { STABLE_POOL_IDS, FARM_LOCK_SWITCH, REF_VE_CONTRACT_ID } = config;

export default function CalcModelBooster(
  props: ReactModal.Props & {
    seed: Seed;
    tokenPriceList: Record<string, string>;
    loveSeed?: Seed;
    boostConfig: BoostConfig;
    user_seeds_map: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map: Record<string, any>;
    user_unclaimed_map: Record<string, any>;
  }
) {
  const {
    seed,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
  } = props;
  const [usd, setUsd] = useState('');
  const [lpTokenNum, setLpTokenNum] = useState('');
  const [usdDisplay, setUsdDisplay] = useState('');
  const [lpTokenNumDisplay, setLpTokenNumDisplay] = useState('');
  const [userLpTokenNum, setUserLpTokenNum] = useState('');
  const [userLpTokenNumActual, setUserLpTokenNumActual] = useState('');
  const [inputType, setInputType] = useState(true);
  const [symbols, setSymbols] = useState('');
  const pool = seed.pool;
  const { token_account_ids } = pool;
  const tokens = useTokens(token_account_ids) || [];
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  useEffect(() => {
    getUserLpTokenInPool();
  }, []);
  useEffect(() => {
    const symbolList: string[] = [];
    tokens.forEach((token) => {
      symbolList.push(unWrapToken(token, true).symbol);
    });
    setSymbols(symbolList.join('-'));
  }, [tokens]);
  const cardWidth = isMobile() ? '90vw' : '30vw';
  async function getUserLpTokenInPool() {
    if (isSignedIn) {
      const lpTokenId = pool.id.toString();
      const b = await mftGetBalance(getMftTokenId(lpTokenId));
      const num = toReadableNumber(DECIMALS, b);
      setUserLpTokenNum(toPrecision(num, 6));
      setUserLpTokenNumActual(num);
    } else {
      setUserLpTokenNum('0');
      setUserLpTokenNumActual('0');
    }
  }
  function changeLp(e: any) {
    const lpNum = e.currentTarget.value;
    const { shares_total_supply, tvl } = seed.pool;
    const totalShares = Number(toReadableNumber(DECIMALS, shares_total_supply));
    const shareUsd = Number(tvl)
      ? new BigNumber((lpNum * tvl) / totalShares).toFixed()
      : '0';
    let actualUsd;
    let displayUsd;
    let displayLp;
    if (!lpNum) {
      actualUsd = displayUsd = displayLp = '';
    } else if (new BigNumber(0).isEqualTo(lpNum)) {
      actualUsd = displayUsd = displayLp = '0';
    } else if (new BigNumber('0.001').isGreaterThan(shareUsd)) {
      displayUsd = '<0.001';
      actualUsd = shareUsd;
    } else {
      displayUsd = handleNumber(shareUsd);
      actualUsd = shareUsd;
    }
    if (new BigNumber(0.001).isGreaterThan(lpNum)) {
      displayLp = '<0.001';
    } else {
      displayLp = handleNumber(lpNum);
    }
    setLpTokenNum(lpNum);
    setUsd(actualUsd);
    setLpTokenNumDisplay(displayLp);
    setUsdDisplay(displayUsd);
  }
  function changeUsd(e: any) {
    const usdV = e.currentTarget.value;
    const { shares_total_supply, tvl } = seed.pool;
    const totalShares = Number(toReadableNumber(DECIMALS, shares_total_supply));
    const shareV = Number(tvl)
      ? new BigNumber((usdV * totalShares) / tvl).toFixed()
      : '0';
    let actualLp;
    let displayLp;
    let displayUsd;
    if (!usdV) {
      actualLp = displayLp = displayUsd = '';
    } else if (new BigNumber(0).isEqualTo(usdV)) {
      actualLp = displayLp = displayUsd = '0';
    } else if (new BigNumber('0.001').isGreaterThan(shareV)) {
      displayLp = '<0.001';
      actualLp = shareV;
    } else {
      displayLp = handleNumber(shareV);
      actualLp = shareV;
    }
    if (new BigNumber('0.001').isGreaterThan(usdV)) {
      displayUsd = '<0.001';
    } else {
      displayUsd = handleNumber(usdV);
    }
    setLpTokenNum(actualLp);
    setUsd(usdV);
    setLpTokenNumDisplay(displayLp);
    setUsdDisplay(displayUsd);
  }
  function showMaxLp() {
    changeLp({ currentTarget: { value: userLpTokenNumActual } });
    setInputType(false);
  }
  function switchInputSort() {
    setInputType(!inputType);
  }
  function goPool() {
    const poolId = seed.pool.id;
    if (poolId) {
      openUrl(`/pool/${poolId}`);
    }
  }
  return (
    <Modal {...props}>
      <Card
        style={{ width: cardWidth, maxHeight: '95vh' }}
        className="outline-none border border-gradientFrom border-opacity-50 overflow-auto xs:p-4 md:p-4"
      >
        <div className="lg:px-5 lg:py-1">
          <div className="flex justify-between items-center">
            <label className="text-base text-white">
              <FormattedMessage
                id="roi_calculator"
                defaultMessage="ROI Calculator"
              />
            </label>
            <div className="cursor-pointer" onClick={props.onRequestClose}>
              <ModalClose />
            </div>
          </div>
          <div className="mt-7 xs:mt-4 md:mt-4">
            <div className="flex  items-center xs:items-end md:items-end justify-between text-sm text-farmText">
              <div className="flex items-center xs:flex-col md:flex-col xs:items-start md:items-start">
                <span className="flex items-center gap-2 w-48">
                  {symbols} <FormattedMessage id="lp_staked"></FormattedMessage>{' '}
                </span>
              </div>
              <span
                className="flex items-center text-greenColor cursor-pointer hover:text-senderHot whitespace-nowrap"
                onClick={goPool}
              >
                <FormattedMessage id="get_lp_token"></FormattedMessage>
                <VEARROW className="ml-1.5"></VEARROW>
              </span>
            </div>
            <div className="flex items-center rounded px-5 py-2.5 xs:px-3.5 md:px-3.5 bg-black bg-opacity-25 mt-2.5">
              {inputType ? (
                <UsdInput usd={usd} changeUsd={changeUsd}></UsdInput>
              ) : (
                <LpInput lpTokenNum={lpTokenNum} changeLp={changeLp}></LpInput>
              )}
              <div
                className="cursor-pointer mx-10 xs:mx-6 md:mx-6"
                onClick={switchInputSort}
              >
                <SwitchBtn></SwitchBtn>
              </div>
              {inputType ? (
                <LpInput
                  lpTokenNum={lpTokenNumDisplay}
                  changeLp={changeLp}
                  disabled={true}
                  type="text"
                  title={lpTokenNum}
                ></LpInput>
              ) : (
                <UsdInput
                  usd={usdDisplay}
                  changeUsd={changeUsd}
                  disabled={true}
                  type="text"
                  title={usd}
                ></UsdInput>
              )}
            </div>
            <div className="mt-2.5">
              <label
                onClick={showMaxLp}
                style={{ zoom: 0.8 }}
                className={
                  ' text-xs border  rounded px-1 cursor-pointer ' +
                  (userLpTokenNum == lpTokenNum
                    ? 'border-gray-400 text-gray-400'
                    : 'text-greenColor border-greenColor')
                }
              >
                MAX
              </label>
              <span className="text-primaryText text-xs ml-2">
                <FormattedMessage id="lp_Token" />: {userLpTokenNum}
              </span>
            </div>
          </div>
          <div className="mt-7 xs:mt-4 md:mt-4">
            <CalcEle
              seed={seed}
              tokenPriceList={tokenPriceList}
              lpTokenNumAmount={lpTokenNum}
              loveSeed={loveSeed}
              boostConfig={boostConfig}
              user_seeds_map={user_seeds_map}
              user_unclaimed_map={user_unclaimed_map}
              user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
            ></CalcEle>
          </div>
          {/* <div className="mt-5 xs:mt-3 md:mt-3">
            <LinkPool pooId={seed.pool.id}></LinkPool>
          </div> */}
        </div>
      </Card>
    </Modal>
  );
}
export function CalcEle(props: {
  seed: Seed;
  tokenPriceList: Record<string, string>;
  lpTokenNumAmount: string;
  loveSeed?: Seed;
  boostConfig?: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
}) {
  const {
    seed,
    tokenPriceList,
    lpTokenNumAmount,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
  } = props;
  const [selecteDate, setSelecteDate] = useState<MonthData>();
  const [ROI, setROI] = useState('');
  const [rewardData, setRewardData] = useState<Record<string, any>>({});
  let [lpTokenNum, setLpTokenNum] = useState(lpTokenNumAmount);
  const [dateList, setDateList] = useState<MonthData[]>([]);
  const [accountType, setAccountType] = useState('free');
  const [loveTokenBalance, setLoveTokenBalance] = useState<string>('0');
  const [amount, setAmount] = useState('');
  const { farmList: farms, pool } = seed;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;

  const intl = useIntl();
  useEffect(() => {
    get_all_date_list();
    getLoveTokenBalance();
  }, []);
  useEffect(() => {
    if (!selecteDate) return;
    if (accountType == 'cd') {
      const rate = seedRadio;
      const power = new BigNumber(rate)
        .multipliedBy(+lpTokenNumAmount)
        .toFixed();
      lpTokenNum = power;
      setLpTokenNum(power);
    } else {
      lpTokenNum = lpTokenNumAmount;
      setLpTokenNum(lpTokenNumAmount);
    }
    const rewardsTemp: { tokenList: any[]; tokenTotalPrice: string } = {
      tokenList: [],
      tokenTotalPrice: '',
    };
    farms.forEach((farm: FarmBoost) => {
      const tokenTemp: TokenMetadata = Object.assign({}, farm.token_meta_data);
      if (!lpTokenNum || new BigNumber(lpTokenNum).isEqualTo('0')) {
        rewardsTemp.tokenList.push(tokenTemp);
      } else {
        const dailyReward = toReadableNumber(
          tokenTemp.decimals,
          farm.terms.daily_reward
        );
        const seedPower = toReadableNumber(DECIMALS, seed.total_seed_power);
        const totalStakePower = new BigNumber(lpTokenNum)
          .plus(seedPower)
          .toString();
        const day = selecteDate.day;
        const perDayAndLp = new BigNumber(dailyReward).dividedBy(
          new BigNumber(totalStakePower)
        );

        let rewardTokenNum;
        if (perDayAndLp.isEqualTo('0')) {
          // totalStake reach to the max limit
          rewardTokenNum = new BigNumber(dailyReward).multipliedBy(day);
        } else {
          rewardTokenNum = perDayAndLp
            .multipliedBy(day)
            .multipliedBy(lpTokenNum);
        }
        const priceData: any = tokenPriceList[tokenTemp.id];
        let tokenPrice = '0';
        if (priceData && priceData.price) {
          tokenPrice = new BigNumber(rewardTokenNum)
            .multipliedBy(priceData.price)
            .toString();
        }
        rewardsTemp.tokenList.push({
          ...tokenTemp,
          num: rewardTokenNum.toString(),
        });
        rewardsTemp.tokenTotalPrice = new BigNumber(
          rewardsTemp.tokenTotalPrice || '0'
        )
          .plus(tokenPrice)
          .toString();
      }
    });
    // handle tokenTotalPrice display
    const tokenTotalPriceActual = rewardsTemp.tokenTotalPrice;
    if (rewardsTemp.tokenTotalPrice) {
      if (new BigNumber('0').isEqualTo(rewardsTemp.tokenTotalPrice)) {
        rewardsTemp.tokenTotalPrice = '$ -';
      } else if (
        new BigNumber('0.001').isGreaterThan(rewardsTemp.tokenTotalPrice)
      ) {
        rewardsTemp.tokenTotalPrice = '<$ 0.001';
      } else {
        rewardsTemp.tokenTotalPrice = `~ $${toInternationalCurrencySystem(
          rewardsTemp.tokenTotalPrice,
          3
        )}`;
      }
    }
    // remove repeated rewards
    const tokenMap = {};
    rewardsTemp.tokenList.forEach((token: TokenMetadata & { num: string }) => {
      const curToken = tokenMap[token.id];
      if (curToken) {
        curToken.num = Number(curToken.num) + Number(token.num);
      } else {
        tokenMap[token.id] = token;
      }
    });
    rewardsTemp.tokenList = Object.values(tokenMap);
    setRewardData(rewardsTemp);
    // get ROI
    if (lpTokenNumAmount && lpTokenNumAmount !== '0') {
      const { shares_total_supply, tvl } = pool;
      const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
        ? LP_STABLE_TOKEN_DECIMALS
        : LP_TOKEN_DECIMALS;
      const totalShares = Number(
        toReadableNumber(DECIMALS, shares_total_supply)
      );
      const shareUsd = new BigNumber(lpTokenNumAmount)
        .multipliedBy(tvl)
        .dividedBy(totalShares)
        .toFixed();
      let aprActual = new BigNumber(tokenTotalPriceActual)
        .dividedBy(shareUsd)
        .multipliedBy(100);
      let aprDisplay;
      if (new BigNumber('0.001').isGreaterThan(aprActual)) {
        aprDisplay = '<0.001%';
      } else {
        aprDisplay = aprActual.toFixed(3, 1) + '%';
      }
      setROI(aprDisplay);
    } else {
      setROI('- %');
    }
  }, [lpTokenNumAmount, selecteDate, accountType, amount]);

  function changeDate(v: MonthData) {
    setSelecteDate(v);
  }
  function getMyShare() {
    if (!lpTokenNumAmount || new BigNumber(lpTokenNumAmount).isEqualTo('0')) {
      return '- (-%)';
    }
    const seedAmount = toReadableNumber(DECIMALS, seed.total_seed_amount);
    const totalStake = new BigNumber(lpTokenNumAmount).plus(seedAmount);
    let percent = new BigNumber(lpTokenNumAmount)
      .dividedBy(totalStake)
      .multipliedBy(100);
    let resultPercent;
    if (new BigNumber('0.001').isGreaterThan(percent)) {
      resultPercent = '<0.001';
    } else {
      resultPercent = percent.toFixed(3, 1).toString();
    }
    let resultLpToken;
    if (new BigNumber('0.001').isGreaterThan(lpTokenNumAmount)) {
      resultLpToken = '<0.001';
    } else {
      resultLpToken = handleNumber(lpTokenNumAmount);
    }
    return (
      <span className="flex flex-wrap justify-end">
        <label className="w-32 lg:w-36 overflow-hidden whitespace-nowrap overflow-ellipsis">
          {resultLpToken}
        </label>
        <label>({resultPercent}%)</label>
      </span>
    );
  }
  const get_all_date_list = async () => {
    // get date list
    const month_list = [1, 3, 6, 12];
    const date_list: MonthData[] = month_list.map((duration: number) => {
      return {
        text: `${duration}M`,
        second: duration * 2592000,
        m: duration,
        day: duration * 30,
      };
    });
    setDateList(date_list);
    setSelecteDate(date_list[0]);
  };
  function switchAccountType(type: string) {
    setAccountType(type);
  }
  function displayNum(num: string) {
    if (!num) return '-';
    let resultRewardTokenNum;
    if (new BigNumber('0.001').isGreaterThan(num)) {
      resultRewardTokenNum = '<0.001';
    } else {
      resultRewardTokenNum = toInternationalCurrencySystem(num.toString(), 3);
    }
    return resultRewardTokenNum;
  }
  function getRate() {
    return `x ${toPrecision(seedRadio.toString(), 2)}`;
  }
  function getBoostMutil() {
    let lastObj: any = {
      radio: '1',
    };
    if (!boostConfig || !isSignedIn) return lastObj;
    const { affected_seeds, booster_decimal } = boostConfig;
    const { seed_id } = seed;
    const user_seed: UserSeedInfo = user_seeds_map[seed_id];
    if (user_seed && user_seed.free_amount) {
      lastObj.amount = user_seed.free_amount;
    }
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    if (base && loveSeed) {
      lastObj.base = base;
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount_pre = toReadableNumber(
        booster_decimal,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      const totalStakeLoveAmount = new BigNumber(totalStakeLoveAmount_pre)
        .plus(amount || 0)
        .toFixed();
      if (+totalStakeLoveAmount > 0) {
        let result;
        if (+totalStakeLoveAmount < 1) {
          result = 1;
        } else {
          result = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed(2);
        }
        lastObj.radio = result;
        return lastObj;
      }
      return lastObj;
    }
    return lastObj;
  }
  function changeAmount(value: string) {
    setAmount(value);
  }
  async function getLoveTokenBalance() {
    // get LoveToken balance
    if (REF_VE_CONTRACT_ID && isSignedIn) {
      const loveBalance = await getLoveAmount();
      setLoveTokenBalance(toReadableNumber(LOVE_TOKEN_DECIMAL, loveBalance));
    }
  }
  const { radio: seedRadio, amount: seed_free_amount, base } = getBoostMutil();
  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-farmText">
            <FormattedMessage id="stake_for"></FormattedMessage>
          </label>
        </div>
        <div className="flex items-center bg-datebg bg-opacity-40 rounded-md h-7 xs:h-6 md:h-6 mt-3 mb-4">
          {dateList.map((date: MonthData, index) => {
            return (
              <div
                onClick={() => {
                  changeDate(date);
                }}
                className={
                  `flex items-center justify-center flex-grow text-sm rounded-md h-full cursor-pointer ` +
                  (selecteDate?.day == date.day
                    ? 'bg-gradientFromHover text-chartBg'
                    : 'text-farmText')
                }
                key={date.text}
              >
                {date.text}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        {!base ? null : (
          <div className="flex items-center">
            <div className="flex items-center justify-center w-1/2">
              <span
                onClick={() => {
                  switchAccountType('free');
                }}
                className={`flex items-center justify-center h-10 text-sm w-4/5  cursor-pointer ${
                  accountType == 'free'
                    ? 'border-b border-greenColor text-white'
                    : 'text-primaryText'
                }`}
              >
                <FormattedMessage id="nonBoosted"></FormattedMessage>
              </span>
            </div>
            <div className="flex items-center justify-center w-1/2">
              <div
                onClick={() => {
                  switchAccountType('cd');
                }}
                className={`flex items-center justify-center h-10  w-4/5 text-sm cursor-pointer ${
                  accountType == 'cd'
                    ? 'border-b border-greenColor text-white'
                    : 'text-primaryText'
                }`}
              >
                <BoostOptIcon
                  className={`mr-1 ${accountType == 'cd' ? '' : 'opacity-40'}`}
                ></BoostOptIcon>
                <FormattedMessage id="boosted"></FormattedMessage>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col rounded p-5 xs:px-3.5 md:px-3.5 bg-black bg-opacity-25">
          {accountType == 'cd' ? (
            <>
              <div className="flex items-center justify-between mb-4 mt-5">
                <label className="text-sm text-farmText mr-8 xs:mr-2 md:mr-2 whitespace-nowrap">
                  <FormattedMessage id="love_staked"></FormattedMessage>
                </label>
                <div className="relative flex flex-col flex-grow">
                  <span className="absolute text-xs text-primaryText right-0 -top-5">
                    <label className="mr-1">
                      +<FormattedMessage id="balance" />:
                    </label>
                    {toPrecision(loveTokenBalance, 6)}
                  </span>
                  <div className="flex justify-between items-center h-9 px-3 bg-black bg-opacity-20 rounded-lg">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={({ target }) => changeAmount(target.value)}
                      className="text-white text-sm focus:outline-non appearance-none leading-tight"
                    ></input>
                    <div className="flex items-center ml-2">
                      <span
                        onClick={() => {
                          changeAmount(loveTokenBalance);
                        }}
                        className={`text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
                          amount == loveTokenBalance
                            ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                            : 'border-maxBorderColor'
                        }`}
                      >
                        Max
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`flex justify-between mb-4`}>
                <label className="text-sm text-farmText mr-2">
                  <FormattedMessage id="booster"></FormattedMessage>
                </label>
                <span
                  className={`flex items-center text-sm text-right break-all text-senderHot`}
                >
                  {getRate()}
                  <LightningIcon></LightningIcon>
                </span>
              </p>
            </>
          ) : null}
          <p className="flex justify-between">
            <label className="text-sm text-farmText mr-2">
              <FormattedMessage id="cur_apr"></FormattedMessage>
            </label>
            <label className="text-sm text-farmText text-right break-all">
              {ROI}
            </label>
          </p>
          <p className="flex justify-between mt-4">
            <label className="text-sm text-farmText mr-2">
              <FormattedMessage id="value_rewards_token"></FormattedMessage>
            </label>
            <label className="text-sm text-farmText text-right break-all">
              {rewardData.tokenTotalPrice || '$ -'}
            </label>
          </p>
          <div className="mt-4">
            <label className="text-sm text-farmText">
              <FormattedMessage id="reward_token"></FormattedMessage>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(rewardData.tokenList || []).map((item: any) => {
                const token = unWrapToken(item, true);
                return (
                  <div className="flex items-center" key={token.symbol}>
                    <img
                      className="w-6 h-6 xs:w-5 xs:h-5 md:w-5 md:h-5 rounded-full border border-gradientFromHover"
                      src={token.icon}
                    ></img>
                    <label className="ml-2 text-sm text-farmText">
                      {displayNum(item.num)}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function LinkPool(props: { pooId: number }) {
  const { pooId } = props;
  const intl = useIntl();
  return (
    <div className="flex justify-center items-center">
      <Link
        title={intl.formatMessage({ id: 'view_pool' })}
        to={{
          pathname: `/pool/${pooId}`,
          state: { backToFarms: true },
        }}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="flex items-center"
      >
        <HandIcon></HandIcon>
        <label className="mx-2 text-sm text-framBorder cursor-pointer">
          <FormattedMessage id="get_lp_token"></FormattedMessage>
        </label>
        <LinkIcon></LinkIcon>
      </Link>
    </div>
  );
}
function handleNumber(number: string) {
  const temp = toInternationalCurrencySystem(number, 3);
  const length = temp.length;
  const left = temp.substring(0, length - 1);
  const right = temp.substring(length - 1);
  let result = temp;
  if (['K', 'M', 'B'].indexOf(right) > -1) {
    result = new BigNumber(left).toFixed() + right;
  }
  return result;
}
function UsdInput(props: {
  changeUsd: any;
  usd: string;
  disabled?: boolean;
  type?: string;
  title?: string;
}) {
  const { changeUsd, usd, disabled, type, title } = props;
  const usdRef = useRef(null);
  useEffect(() => {
    if (usdRef && !disabled) {
      usdRef.current.focus();
    }
  }, [usdRef, disabled]);
  return (
    <div className="flex flex-col flex-grow w-1/5" title={title}>
      <span
        className={
          'flex items-center text-lg ' +
          (disabled ? 'text-farmText' : 'text-white')
        }
      >
        <label>$</label>
        <input
          onChange={changeUsd}
          className={
            'text-lg ml-2 ' + (disabled ? 'text-farmText' : 'text-white')
          }
          type={type || 'number'}
          value={usd}
          disabled={disabled}
          placeholder="0.0"
          ref={usdRef}
        ></input>
      </span>
      <label className="text-sm text-farmText">
        <FormattedMessage id="usd" />
      </label>
    </div>
  );
}
function LpInput(props: {
  changeLp: any;
  lpTokenNum: string;
  disabled?: boolean;
  type?: string;
  title?: string;
}) {
  const { changeLp, lpTokenNum, disabled, type, title } = props;
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef && !disabled) {
      inputRef.current.focus();
    }
  }, [inputRef, disabled]);
  return (
    <div className="flex flex-col flex-grow w-1/5" title={title}>
      <span>
        <input
          type={type || 'number'}
          className={'text-lg ' + (disabled ? 'text-farmText' : 'text-white')}
          value={lpTokenNum}
          onChange={changeLp}
          disabled={disabled}
          placeholder="0.0"
          ref={inputRef}
        ></input>
      </span>
      <label className="text-sm text-farmText">
        <FormattedMessage id="lp_Token" />
      </label>
    </div>
  );
}

interface MonthData {
  text: string;
  m: number;
  day: number;
  second: number;
  rate?: number;
}
