import React, { useContext } from 'react';
import { ModalClose, SwitchBtn, HandIcon, LinkIcon } from '~components/icon';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useEffect, useRef } from 'react';
import { BigNumber } from 'bignumber.js';
import { wallet } from '~services/near';
import { mftGetBalance } from '~services/mft-contract';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { getMftTokenId } from '~utils/token';
import { Card } from '~components/card/Card';
import { LP_TOKEN_DECIMALS, LP_STABLE_TOKEN_DECIMALS } from '~services/m-token';
import { FarmBoost, Seed, get_config, BoostConfig } from '~services/farm';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import { isMobile } from '~utils/device';
import { useTokens } from '~state/token';
import getConfig from '~services/config';
import { TokenMetadata, unWrapToken } from '../../services/ft-contract';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
import { LightningIcon, ForbiddenIcon } from '~components/icon/FarmBoost';
import ReactTooltip from 'react-tooltip';

const config = getConfig();
const { STABLE_POOL_IDS, FARM_LOCK_SWITCH } = config;

export default function CalcModelBooster(
  props: ReactModal.Props & {
    seed: Seed;
    tokenPriceList: Record<string, string>;
    loveSeed?: Seed;
    boostConfig: BoostConfig;
  }
) {
  const { seed, tokenPriceList, loveSeed, boostConfig } = props;
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
            <label className="text-sm text-farmText">
              {symbols} <FormattedMessage id="lp_staked"></FormattedMessage>
            </label>
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
            ></CalcEle>
          </div>
          <div className="mt-5 xs:mt-3 md:mt-3">
            <LinkPool pooId={seed.pool.id}></LinkPool>
          </div>
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
}) {
  const { seed, tokenPriceList, lpTokenNumAmount, loveSeed, boostConfig } =
    props;
  const [selecteDate, setSelecteDate] = useState<MonthData>();
  const [ROI, setROI] = useState('');
  const [rewardData, setRewardData] = useState<Record<string, any>>({});
  let [lpTokenNum, setLpTokenNum] = useState(lpTokenNumAmount);
  const [dateList, setDateList] = useState<MonthData[]>([]);
  const [accountType, setAccountType] = useState('free');
  const { farmList: farms, pool, min_locking_duration_sec } = seed;
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;

  const intl = useIntl();
  useEffect(() => {
    get_all_date_list();
  }, []);
  useEffect(() => {
    if (!selecteDate) return;
    if (accountType == 'cd' || seedRadio) {
      const rate = selecteDate.rate || seedRadio;
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
  }, [lpTokenNumAmount, selecteDate, accountType]);

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
    if (min_locking_duration_sec == 0 || FARM_LOCK_SWITCH == 0) {
      setDateList(date_list);
      setSelecteDate(date_list[0]);
    } else {
      get_config().then((config) => {
        const { min_locking_duration_sec } = seed;
        const { maximum_locking_duration_sec, max_locking_multiplier } = config;
        date_list.forEach((item: MonthData) => {
          if (
            item.second >= min_locking_duration_sec &&
            item.second <= maximum_locking_duration_sec
          ) {
            const locking_multiplier =
              ((max_locking_multiplier - 10000) * item.second) /
              (maximum_locking_duration_sec * 10000);
            item.rate = locking_multiplier + 1;
          }
        });
        setDateList(date_list);
        setSelecteDate(date_list[0]);
      });
    }
  };
  function switchAccountType(type: string) {
    setAccountType(type);
    if (type == 'cd') {
      if (!selecteDate.rate) {
        const newSelectdate = dateList.find((date: MonthData) => {
          if (date.rate) return date;
        });
        setSelecteDate(newSelectdate);
      }
    }
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
  function getForbiddenTip() {
    const txt = intl.formatMessage({ id: 'forbiddenTip' });
    return `<div class="text-xs text-farmText w-44 text-left">${txt}</div>`;
  }
  function getRate() {
    if (accountType == 'free') {
      return `x ${toPrecision(seedRadio, 3)}`;
    } else if (accountType == 'cd') {
      return `${
        selecteDate?.rate?.toString()
          ? toPrecision(selecteDate?.rate?.toString(), 2)
          : '-'
      }`;
    }
  }
  function getBoostMutil() {
    const { affected_seeds, booster_decimal } = boostConfig;
    const { seed_id, user_seed } = seed;
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    if (base && hasUserStaked) {
      const { free_amount = 0, locked_amount = 0 } = loveSeed.user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        booster_decimal,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      const result = new BigNumber(1)
        .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
        .toFixed();
      return result;
    }
    return '';
  }
  const seedRadio = getBoostMutil();
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
                  if (!(accountType == 'cd' && !date.rate)) {
                    changeDate(date);
                  }
                }}
                className={
                  `flex items-center justify-center flex-grow text-sm rounded-md h-full ${
                    accountType == 'cd' && !date.rate
                      ? 'cursor-not-allowed '
                      : 'cursor-pointer '
                  }` +
                  (selecteDate?.day == date.day
                    ? 'bg-gradientFromHover text-chartBg'
                    : 'text-farmText')
                }
                key={date.text}
              >
                {accountType == 'cd' && !date.rate ? (
                  <div
                    className="text-white text-right ml-1"
                    data-class="reactTip"
                    data-for={`fobiddenId${index}`}
                    data-place="top"
                    data-html={true}
                    data-tip={getForbiddenTip()}
                  >
                    <span className="flex items-center text-farmText">
                      <ForbiddenIcon className="mr-1"></ForbiddenIcon>{' '}
                      {date.text}
                    </span>
                    <ReactTooltip
                      id={`fobiddenId${index}`}
                      backgroundColor="#1D2932"
                      border
                      borderColor="#7e8a93"
                      effect="solid"
                    />
                  </div>
                ) : (
                  <>{date.text}</>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        {min_locking_duration_sec == 0 || FARM_LOCK_SWITCH == 0 ? null : (
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
                <FormattedMessage id="ordinary"></FormattedMessage>
              </span>
            </div>
            <div className="flex items-center justify-center w-1/2">
              <span
                onClick={() => {
                  switchAccountType('cd');
                }}
                className={`flex items-center justify-center h-10  w-4/5 text-sm cursor-pointer ${
                  accountType == 'cd'
                    ? 'border-b border-greenColor text-white'
                    : 'text-primaryText'
                }`}
              >
                <FormattedMessage id="locking_stake"></FormattedMessage>
              </span>
            </div>
          </div>
        )}
        <div className="flex flex-col rounded p-5 xs:px-3.5 md:px-3.5 bg-black bg-opacity-25">
          {accountType == 'cd' || seedRadio ? (
            <p className={`flex justify-between mb-4`}>
              <label className="text-sm text-farmText mr-2">
                <FormattedMessage id="booster"></FormattedMessage>
              </label>
              <span className="flex items-center text-sm text-senderHot text-right break-all">
                {getRate()}
                <LightningIcon></LightningIcon>
              </span>
            </p>
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
