import React from 'react';
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
import { LP_TOKEN_DECIMALS } from '~services/m-token';
import { FarmInfo } from '~services/farm';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import { isMobile } from '~utils/device';
import { useTokens } from '~state/token';

export default function CalcModel(
  props: ReactModal.Props & {
    farms: FarmInfo[];
    tokenPriceList: Record<string, string>;
  }
) {
  const { farms, tokenPriceList } = props;
  const [usd, setUsd] = useState('');
  const [lpTokenNum, setLpTokenNum] = useState('');
  const [usdDisplay, setUsdDisplay] = useState('');
  const [lpTokenNumDisplay, setLpTokenNumDisplay] = useState('');
  const [userLpTokenNum, setUserLpTokenNum] = useState('');
  const [userLpTokenNumActual, setUserLpTokenNumActual] = useState('');
  const [inputType, setInputType] = useState(true);
  const tokens = useTokens(farms[0].tokenIds) || [];
  const [symbols, setSymbols] = useState('');
  useEffect(() => {
    getUserLpTokenInPool();
  }, []);
  useEffect(() => {
    const symbolList: string[] = [];
    tokens.forEach((token) => {
      symbolList.push(token.symbol);
    });
    setSymbols(symbolList.join('-'));
  }, [tokens]);
  useEffect(() => {
    if (!props.isOpen) {
      setLpTokenNum('');
      setUsd('');
      setLpTokenNumDisplay('');
      setUsdDisplay('');
    }
  }, [props.isOpen]);
  const cardWidth = isMobile() ? '90vw' : '30vw';
  async function getUserLpTokenInPool() {
    if (wallet.isSignedIn()) {
      const b = await mftGetBalance(getMftTokenId(farms[0].lpTokenId));
      const num = toReadableNumber(LP_TOKEN_DECIMALS, b);
      setUserLpTokenNum(toPrecision(num, 6));
      setUserLpTokenNumActual(num);
    } else {
      setUserLpTokenNum('0');
      setUserLpTokenNumActual('0');
    }
  }
  function changeLp(e: any) {
    const lpNum = e.currentTarget.value;
    const { shares_total_supply, tvl } = farms[0].pool;
    const totalShares = Number(toReadableNumber(24, shares_total_supply));
    const shareUsd = new BigNumber((lpNum * tvl) / totalShares).toFixed();
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
    const { shares_total_supply, tvl } = farms[0].pool;
    const totalShares = Number(toReadableNumber(24, shares_total_supply));
    const shareV = new BigNumber((usdV * totalShares) / tvl).toFixed();
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
                    : 'text-framBorder border-framBorder')
                }
              >
                MAX
              </label>
              <span className="text-primaryText text-xs ml-2">
                <FormattedMessage id="my_shares" />: {userLpTokenNum}
              </span>
            </div>
          </div>
          <div className="mt-7 xs:mt-4 md:mt-4">
            <CalcEle
              farms={farms}
              tokenPriceList={tokenPriceList}
              lpTokenNum={lpTokenNum}
              usd={usd}
            ></CalcEle>
          </div>
          <div className="mt-5 xs:mt-3 md:mt-3">
            <LinkPool pooId={farms[0].pool.id}></LinkPool>
          </div>
        </div>
      </Card>
    </Modal>
  );
}
export function CalcEle(props: {
  farms: FarmInfo[];
  tokenPriceList: Record<string, string>;
  lpTokenNum: string;
  usd?: string;
}) {
  const { farms, tokenPriceList, lpTokenNum, usd } = props;
  const intl = useIntl();
  const [selecteDate, setSelecteDate] = useState('day_2');
  const [totalApr, setTotalApr] = useState('');
  const [rewardData, setRewardData] = useState<Record<string, any>>({});
  const [dateList] = useState({
    day_1: {
      v: intl.formatMessage({ id: 'day_1' }),
      day: '1',
    },
    day_2: {
      v: intl.formatMessage({ id: 'day_2' }),
      day: '7',
    },
    day_3: {
      v: intl.formatMessage({ id: 'day_3' }),
      day: '30',
    },
    day_4: {
      v: intl.formatMessage({ id: 'day_4' }),
      day: '90',
    },
  });
  useEffect(() => {
    const rewardTemp: { tokenList: any[]; tokenTotalPrice: string } = {
      tokenList: [],
      tokenTotalPrice: '',
    };
    farms.forEach((farm) => {
      const tokenTemp: any = Object.assign({}, farm.rewardToken);
      if (!lpTokenNum || new BigNumber(lpTokenNum).isEqualTo('0')) {
        rewardTemp.tokenList.push(tokenTemp);
      } else {
        const { rewardsPerWeek, seedAmount } = farm;
        const totalStake = new BigNumber(lpTokenNum)
          .plus(toReadableNumber(24, seedAmount))
          .toString();
        const day = dateList[selecteDate].day;
        const perDayAndLp = new BigNumber(rewardsPerWeek).dividedBy(
          new BigNumber(totalStake).multipliedBy(7)
        );
        let rewardTokenNum;
        if (perDayAndLp.isEqualTo('0')) {
          // totalStake reach to the max limit
          rewardTokenNum = new BigNumber(rewardsPerWeek)
            .dividedBy(7)
            .multipliedBy(day);
        } else {
          rewardTokenNum = perDayAndLp
            .multipliedBy(day)
            .multipliedBy(lpTokenNum);
        }
        const priceData: any = tokenPriceList[tokenTemp.id];
        let tokenPrice = '0';
        if (priceData.price) {
          tokenPrice = new BigNumber(rewardTokenNum)
            .multipliedBy(priceData.price)
            .toString();
        }
        let resultRewardTokenNum;
        if (new BigNumber('0.001').isGreaterThan(rewardTokenNum)) {
          resultRewardTokenNum = '<0.001';
        } else {
          resultRewardTokenNum = toInternationalCurrencySystem(
            rewardTokenNum.toString(),
            3
          );
        }
        tokenTemp.num = resultRewardTokenNum;
        tokenTemp.tokenPrice = tokenPrice;
        rewardTemp.tokenList.push(tokenTemp);
        rewardTemp.tokenTotalPrice = new BigNumber(
          rewardTemp.tokenTotalPrice || '0'
        )
          .plus(tokenPrice)
          .toString();
      }
    });
    // handle tokenTotalPrice display
    const tokenTotalPriceActual = rewardTemp.tokenTotalPrice;
    if (rewardTemp.tokenTotalPrice) {
      if (new BigNumber('0.001').isGreaterThan(rewardTemp.tokenTotalPrice)) {
        rewardTemp.tokenTotalPrice = '<$ 0.001';
      } else {
        rewardTemp.tokenTotalPrice = `~ $${toInternationalCurrencySystem(
          rewardTemp.tokenTotalPrice,
          3
        )}`;
      }
    }
    setRewardData(rewardTemp);
    // get Apr
    if (lpTokenNum && lpTokenNum !== '0') {
      const { shares_total_supply, tvl } = farms[0].pool;
      const totalShares = Number(toReadableNumber(24, shares_total_supply));
      const shareUsd = new BigNumber(lpTokenNum)
        .multipliedBy(tvl)
        .dividedBy(totalShares)
        .toFixed();
      let aprActual = new BigNumber(tokenTotalPriceActual)
        .dividedBy(usd || shareUsd)
        .multipliedBy(100);
      let aprDisplay;
      if (new BigNumber('0.001').isGreaterThan(aprActual)) {
        aprDisplay = '<0.001%';
      } else {
        aprDisplay = aprActual.toFixed(3, 1) + '%';
      }
      setTotalApr(aprDisplay);
    } else {
      setTotalApr('- %');
    }
  }, [lpTokenNum, selecteDate]);

  // function getTotalApr() {
  //   let apr = 0;
  //   farms.forEach(function (item) {
  //     apr += Number(item.apr);
  //   });
  //   setTotalApr(toPrecision(apr.toString(), 2));
  // }
  function changeDate(e: any) {
    const dateId = e.currentTarget.dataset.id;
    setSelecteDate(dateId);
  }
  function getMyShare() {
    if (!lpTokenNum || new BigNumber(lpTokenNum).isEqualTo('0')) {
      return '- (-%)';
    }
    const totalStake = new BigNumber(lpTokenNum).plus(
      toReadableNumber(24, farms[0].seedAmount)
    );
    let percent = new BigNumber(lpTokenNum)
      .dividedBy(totalStake)
      .multipliedBy(100);
    let resultPercent;
    if (new BigNumber('0.001').isGreaterThan(percent)) {
      resultPercent = '<0.001';
    } else {
      resultPercent = percent.toFixed(3, 1).toString();
    }
    let resultLpToken;
    if (new BigNumber('0.001').isGreaterThan(lpTokenNum)) {
      resultLpToken = '<0.001';
    } else {
      resultLpToken = handleNumber(lpTokenNum);
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
  return (
    <div>
      <div>
        <label className="text-sm text-farmText">
          <FormattedMessage id="stake_for"></FormattedMessage>
        </label>
        <div className="flex items-center bg-datebg bg-opacity-40 rounded-md h-7 xs:h-6 md:h-6 mt-2.5">
          {Object.entries(dateList).map(([id, { v }]) => {
            return (
              <label
                onClick={changeDate}
                data-id={id}
                className={
                  'flex items-center justify-center flex-grow text-sm rounded-md cursor-pointer h-full ' +
                  (selecteDate == id
                    ? 'bg-gradientFromHover text-chartBg'
                    : 'text-farmText')
                }
                key={id}
              >
                {v}
              </label>
            );
          })}
        </div>
      </div>
      <div className="mt-7 xs:mt-4 md:mt-4">
        <div className="flex justify-between">
          <label className="text-sm text-farmText">
            <FormattedMessage id="cur_apr"></FormattedMessage>
          </label>
          <label className="text-sm text-farmText">{totalApr}</label>
        </div>
        <div className="flex flex-col rounded p-5 xs:px-3.5 md:px-3.5 bg-black bg-opacity-25 mt-2.5">
          <p className="flex justify-between">
            <label className="text-sm text-farmText mr-2">
              <FormattedMessage id="my_shares"></FormattedMessage>
            </label>
            <label
              className="text-sm text-farmText text-right break-all"
              title={lpTokenNum}
            >
              {getMyShare()}
            </label>
          </p>
          <p className="flex justify-between mt-5">
            <label className="text-sm text-farmText mr-2">
              <FormattedMessage id="value_rewards_token"></FormattedMessage>
            </label>
            <label className="text-sm text-farmText text-right break-all">
              {rewardData.tokenTotalPrice || '$ -'}
            </label>
          </p>
          <div className="mt-5">
            <label className="text-sm text-farmText">
              <FormattedMessage id="reward_token"></FormattedMessage>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(rewardData.tokenList || []).map((item: any) => {
                return (
                  <div className="flex items-center" key={item.symbol}>
                    <img
                      className="w-6 h-6 xs:w-5 xs:h-5 md:w-5 md:h-5 rounded-full border border-gradientFromHover"
                      src={item.icon}
                    ></img>
                    <label className="ml-2 text-sm text-farmText">
                      {item.num || '-'}
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
        <FormattedMessage id="my_shares" />
      </label>
    </div>
  );
}
