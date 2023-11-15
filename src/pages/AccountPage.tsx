import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Card } from '../components/card/Card';
import { IoCloseOutline, TiArrowSortedUp } from '../components/reactIcons';
import { TokenMetadata } from '../services/ft-contract';
import {
  ButtonTextWrapper,
  GradientButton,
  GreenLButton,
} from '../components/button/Button';
import {
  useTokenBalances,
  useTokenPriceList,
  useUserRegisteredTokensAllAndNearBalance,
} from '../state/token';
import Loading, { BeatLoading } from '../components/layout/Loading';
import { NEARXIDS, TOKEN_BLACK_LIST } from '../services/near';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ArcIcon,
  MappingAccountIcon,
  NearIcon,
  RefIcon,
  WalletIcon,
} from '../components/icon/Common';
import {
  scientificNotationToString,
  toInternationalCurrencySystem,
  toInternationalCurrencySystemNature,
  toPrecision,
  toReadableNumber,
} from '../utils/numbers';
import BigNumber from 'bignumber.js';
import OldInputAmount from '../components/forms/OldInputAmount';
import {
  batchWithdraw,
  batchWithdrawDCL,
  deposit,
  withdraw,
} from '../services/token';
import { nearMetadata, wrapNear } from '../services/wrap-near';
import { STORAGE_PER_TOKEN } from '../services/creators/storage';
import QuestionMark from '../components/farm/QuestionMark';
import { useHistory } from 'react-router';
import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import { Checkbox, CheckboxSelected, Near } from '../components/icon';
import { CloseIcon } from '../components/icon/Actions';
import { AccountTipMan } from '../components/icon/AccountTipMan';
import {
  auroraAddr,
  batchWithdrawFromAurora,
  useAuroraBalancesNearMapping,
  useDCLAccountBalance,
} from '../services/aurora/aurora';
import {
  AuroraIconWhite,
  ConnectDot,
  CopyIcon,
} from '../components/icon/CrossSwapIcons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useWalletSelector } from '../context/WalletSelectorContext';
import {
  NewProIcon,
  ProIconClick,
  ProIconHover,
} from '../components/icon/swapV3';
import Big from 'big.js';
import { REF_FI_SWAP_SWAPPAGE_TAB_KEY } from 'src/constants';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

const ACCOUNT_PAGE_AURORA_SHOW = REF_FI_SWAP_SWAPPAGE_TAB_KEY;
const REF_ACCOUNT_WITHDRAW_TIP = 'REF_ACCOUNT_WITHDRAW_TIP';
const AURORA_ACCOUNT_WITHDRAW_TIP = 'AURORA_ACCOUNT_WITHDRAW_TIP';

const ACCOUNTTAB_KEY = 'REF_FI_ACCOUNT_TAB_KEY';

const ACCOUNTTAB_KEY_AURORA = 'REF_FI_ACCOUNT_TAB_AURORA_KEY';

interface ParamTypes {
  tab: string;
}

function RefAccountTipMan({
  setShowTip,
  tab,
}: {
  setShowTip: (show: boolean) => void;
  tab: string;
}) {
  return (
    <div
      className="absolute RefAccountTipMan"
      style={{
        top: '-70px',
        right: '210px',
      }}
    >
      {/* <span>
        <em></em>
      </span> */}
      <div
        className="relative flex items-center border bg-cardBg rounded-lg border-gradientFrom pl-4 pr-8 py-2 text-sm text-white"
        style={{
          width: '430px',
          minHeight: '58px',
          zIndex: 60,
        }}
      >
        {tab == 'aurora' ? (
          <FormattedMessage
            id="aurora_account_tip_4"
            defaultMessage="To withdraw token(s) from your Mapping Account to your NEAR Wallet, please select and withdraw"
          />
        ) : (
          <FormattedMessage
            id="ref_account_tip_3"
            defaultMessage="To withdraw token(s) from your REF Account to your NEAR Wallet, please select and withdraw"
          />
        )}
        .
        <div
          className="absolute pl-1 cursor-pointer"
          onClick={() => {
            setShowTip(false);
            if (tab == 'ref') {
              localStorage.setItem(REF_ACCOUNT_WITHDRAW_TIP, '1');
            }
            if (tab == 'aurora') {
              localStorage.setItem(AURORA_ACCOUNT_WITHDRAW_TIP, '1');
            }
          }}
          style={{
            right: '10px',
            top: '10px',
          }}
        >
          <CloseIcon />
        </div>
      </div>

      <AccountTipMan />
    </div>
  );
}

const withdraw_number_at_once = 4;
const accountSortFun = (
  by: string,
  currentSort: string,
  userTokens: TokenMetadata[]
) => {
  const sortBy = by || 'near';

  const sortDirection = currentSort.split('-')[1] == 'down' ? 'up' : 'down';

  userTokens.sort((token1: TokenMetadata, token2: TokenMetadata) => {
    const { near: near1, ref: ref1, aurora: aurora1, dcl: dcl1 } = token1;
    const { near: near2, ref: ref2, aurora: aurora2, dcl: dcl2 } = token2;
    const near1Balance = new BigNumber(near1);
    const ref1Balance = new BigNumber(ref1);
    const aurora1Balance = new BigNumber(aurora1);
    const dcl1Balance = new BigNumber(dcl1);

    const near2Balance = new BigNumber(near2);
    const ref2Balance = new BigNumber(ref2);
    const aurora2Balance = new BigNumber(aurora2);

    const dcl2Balance = new BigNumber(dcl2);

    const a =
      sortBy == 'near'
        ? near1Balance
        : sortBy === 'ref'
        ? ref1Balance
        : sortBy == 'dcl'
        ? dcl1Balance
        : aurora1Balance;
    const b =
      sortBy == 'near'
        ? near2Balance
        : sortBy === 'ref'
        ? ref2Balance
        : sortBy == 'dcl'
        ? dcl2Balance
        : aurora2Balance;

    if (sortDirection == 'down') {
      if (a.isGreaterThan(b)) {
        return -1;
      } else if (a.isLessThan(b)) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (a.isLessThan(b)) {
        return -1;
      } else if (a.isGreaterThan(b)) {
        return 1;
      } else {
        return 0;
      }
    }
  });
  return {
    sortUserTokens: userTokens,
    curSort: sortBy + '-' + sortDirection,
  };
};
const getRefBalance = (item: TokenMetadata) => {
  const { ref } = item;
  const bigRef = new BigNumber(ref);
  if (bigRef.isEqualTo('0')) {
    return '-';
  } else if (bigRef.isLessThan(0.01)) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystemNature(bigRef.toString());
  }
};

const getDCLBalance = (item: TokenMetadata) => {
  const { dcl } = item;
  const bigDCL = new BigNumber(dcl);
  if (bigDCL.isEqualTo('0')) {
    return '-';
  } else if (bigDCL.isLessThan(0.01)) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystemNature(bigDCL.toString());
  }
};

const getAuroraBalance = (item: TokenMetadata) => {
  const { aurora } = item;
  const bigAurora = new BigNumber(aurora);

  if (bigAurora.isEqualTo('0')) {
    return '-';
  } else if (bigAurora.isLessThan(0.01)) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystemNature(bigAurora.toString());
  }
};

const getWalletBalance = (item: TokenMetadata) => {
  const { near } = item;
  const bigNear = new BigNumber(near);
  if (bigNear.isEqualTo('0')) {
    return '-';
  } else if (bigNear.isLessThan(0.01)) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystemNature(near.toString());
  }
};
export const NearTip = () => {
  const intl = useIntl();
  const tip = intl.formatMessage({
    id: 'deposit_near_tip_0.5',
    defaultMessage: 'To deposit, keep at least 0.5 NEAR to cover gas fee',
  });
  const result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
  return (
    <div
      className="ml-1.5"
      data-type="info"
      data-place="right"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={result}
      data-tooltip-id="nearId"
    >
      <QuestionMark />
      <CustomTooltip className="w-20" id="nearId" />
    </div>
  );
};
const WithdrawTip = () => {
  const intl = useIntl();
  const tip = intl.formatMessage({ id: 'over_tip' });
  const result: string = `<div class="text-navHighLightText text-xs w-52 text-left font-normal">${tip}</div>`;
  return (
    <div
      className="ml-2"
      data-type="info"
      data-place="right"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={result}
      data-tooltip-id="WithdrawTipId"
    >
      <QuestionMark />
      <CustomTooltip id="WithdrawTipId" />
    </div>
  );
};

function AccountTable(props: any) {
  const {
    userTokens,
    showCrossBalance,
    hasRefBalanceOver,
    hasMapBalanceOver,
    hasDCLBalanceOver,
    refAccountTokenNumber,
    mapAccountTokenNumber,
    DCLAccountTokenNumber,
    defaultTab,
  } = props;

  const [tokensSort, setTokensSort] = useState(userTokens);
  let [currentSort, setCurrentSort] = useState('');
  const [checkedMap, setCheckedMap] = useState({});
  const [checkAll, setCheckALl] = useState(false);
  const [checkedAuroraMap, setCheckedAuroraMap] = useState({});
  const [checkAuroraAll, setCheckAuroraALl] = useState(false);

  const tokenPriceList = useTokenPriceList();

  const storageTab = localStorage.getItem(
    showCrossBalance ? ACCOUNTTAB_KEY_AURORA : ACCOUNTTAB_KEY
  );

  const [accountTab, setAccountTab] = useState<
    'near' | 'ref' | 'dcl' | 'aurora'
  >(defaultTab || storageTab || 'near');

  useEffect(() => {
    if (showCrossBalance) return;
    setCheckALl(false);
    setCheckedMap({});
  }, [accountTab, showCrossBalance]);

  useEffect(() => {
    localStorage.setItem(
      showCrossBalance ? ACCOUNTTAB_KEY_AURORA : ACCOUNTTAB_KEY,
      accountTab
    );
  }, [accountTab]);

  useEffect(() => {
    if (accountTab === 'ref' && refAccountTokenNumber == 0) {
      localStorage.setItem(
        showCrossBalance ? ACCOUNTTAB_KEY_AURORA : ACCOUNTTAB_KEY,
        'near'
      );
      setAccountTab('near');
    }
    if (accountTab === 'dcl' && DCLAccountTokenNumber == 0) {
      localStorage.setItem(
        showCrossBalance ? ACCOUNTTAB_KEY_AURORA : ACCOUNTTAB_KEY,
        'near'
      );
      setAccountTab('near');
    }
    if (accountTab === 'aurora' && mapAccountTokenNumber == 0) {
      localStorage.setItem(
        showCrossBalance ? ACCOUNTTAB_KEY_AURORA : ACCOUNTTAB_KEY,
        'near'
      );
      setAccountTab('near');
    }
  }, [
    refAccountTokenNumber,
    mapAccountTokenNumber,
    DCLAccountTokenNumber,
    accountTab,
  ]);

  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  useEffect(() => {
    if (accountTab === 'aurora') {
      sort(null, 'aurora');
    } else if (accountTab === 'ref') {
      sort(null, 'ref');
    } else if (accountTab === 'dcl') {
      sort(null, 'dcl');
    } else {
      sort(null, 'near');
    }
  }, [accountTab]);

  useEffect(() => {
    if (showCrossBalance) {
      if (mapAccountTokenNumber > 0) {
        setAccountTab('aurora');
      } else setAccountTab('near');
    }
    if (accountTab === 'aurora' && !showCrossBalance) {
      localStorage.setItem(ACCOUNTTAB_KEY, 'near');
      setAccountTab('near');
    }
  }, [showCrossBalance, mapAccountTokenNumber]);

  const sort = (e?: any, by?: string) => {
    const sortBy = by || e?.currentTarget.dataset.sort || 'near';
    if (currentSort.indexOf(sortBy) == -1 || by) {
      currentSort = sortBy + '-' + 'up';
    }
    const { sortUserTokens, curSort } = accountSortFun(
      sortBy,
      currentSort,
      userTokens
    );
    setTokensSort(Array.from(sortUserTokens));
    setCurrentSort(curSort);
  };
  function clickAllCheckbox() {
    const newStatus = showCrossBalance ? !checkAuroraAll : !checkAll;
    let newCheckedMap = {};
    let count = 0;

    if (newStatus) {
      for (let i = 0; i < tokensSort.length; i++) {
        const { id, ref, aurora, decimals, dcl } = tokensSort[i];

        if (
          (accountTab === 'ref' && Number(ref) == 0) ||
          (accountTab === 'dcl' && Number(dcl) == 0) ||
          (accountTab === 'aurora' && Number(aurora) == 0)
        ) {
          continue;
        }

        if (count >= withdraw_number_at_once) {
          break;
        } else if (accountTab === 'ref') {
          ++count;
          newCheckedMap[id] = {
            id,
            decimals,
            amount: ref,
          };
        } else if (accountTab === 'dcl') {
          ++count;
          newCheckedMap[id] = {
            id,
            decimals,
            amount: dcl,
          };
        } else if (accountTab === 'aurora') {
          ++count;
          newCheckedMap[id] = {
            id,
            decimals,
            amount: aurora,
          };
        }
      }
    } else {
      newCheckedMap = {};
    }

    if (showCrossBalance) {
      setCheckAuroraALl(newStatus);
      setCheckedAuroraMap(newCheckedMap);
    } else {
      setCheckALl(newStatus);
      setCheckedMap(newCheckedMap);
    }
  }
  function clickCheckbox(token: TokenMetadata) {
    if (!showCrossBalance) {
      const { id, ref, dcl, decimals } = token;
      if (accountTab === 'ref') {
        if (checkedMap[id] || Number(ref) == 0) {
          delete checkedMap[id];
        } else if (Object.keys(checkedMap).length < withdraw_number_at_once) {
          checkedMap[id] = {
            id,
            decimals,
            amount: ref,
          };
        }

        if (
          Object.keys(checkedMap).length ==
          Math.min(withdraw_number_at_once, refAccountTokenNumber)
        ) {
          setCheckALl(true);
        } else {
          setCheckALl(false);
        }
      }

      if (accountTab === 'dcl') {
        if (checkedMap[id] || Number(dcl) == 0) {
          delete checkedMap[id];
        } else if (Object.keys(checkedMap).length < withdraw_number_at_once) {
          checkedMap[id] = {
            id,
            decimals,
            amount: dcl,
          };
        }

        if (
          Object.keys(checkedMap).length ==
          Math.min(withdraw_number_at_once, DCLAccountTokenNumber)
        ) {
          setCheckALl(true);
        } else {
          setCheckALl(false);
        }
      }

      setCheckedMap(Object.assign({}, checkedMap));
    } else {
      const { id, aurora, decimals } = token;
      if (checkedAuroraMap[id] || Number(aurora) == 0) {
        delete checkedAuroraMap[id];
      } else if (
        Object.keys(checkedAuroraMap).length < withdraw_number_at_once
      ) {
        checkedAuroraMap[id] = {
          id,
          decimals,
          amount: aurora,
        };
      }
      if (
        Object.keys(checkedAuroraMap).length ==
        Math.min(withdraw_number_at_once, mapAccountTokenNumber)
      ) {
        setCheckAuroraALl(true);
      } else {
        setCheckAuroraALl(false);
      }
      setCheckedAuroraMap(Object.assign({}, checkedAuroraMap));
    }
  }
  function doWithDraw() {
    setWithdrawLoading(true);
    if (showCrossBalance) batchWithdrawFromAurora(checkedAuroraMap);
    else if (accountTab === 'ref') batchWithdraw(checkedMap);
    else if (accountTab === 'dcl') {
      batchWithdrawDCL(checkedMap);
    }
  }

  return (
    <>
      <div
        className={`rounded-lg text-sm border ${
          (
            showCrossBalance
              ? !mapAccountTokenNumber
              : !refAccountTokenNumber && !DCLAccountTokenNumber
          )
            ? 'hidden'
            : ''
        } border-v3SwapGray inline-flex items-center border-opacity-20 p-0.5 mt-4 ml-6 text-primaryText`}
      >
        <button
          className={`h-7 rounded-md w-32 flex items-center justify-center ${
            accountTab === 'near'
              ? 'text-white bg-navHighLightBg bg-opacity-50'
              : ''
          }`}
          onClick={() => {
            setAccountTab('near');
          }}
        >
          NEAR
        </button>

        <button
          className={`h-7 ${
            refAccountTokenNumber > 0 && !showCrossBalance ? 'flex' : 'hidden'
          } rounded-md w-32 flex items-center justify-center ${
            accountTab === 'ref'
              ? 'text-white bg-navHighLightBg bg-opacity-50'
              : ''
          }`}
          onClick={() => {
            setAccountTab('ref');
          }}
        >
          REF(Classic)
          {hasRefBalanceOver ? (
            <div
              className="w-1.5 h-1.5 relative left-1 bottom-1 rounded-full "
              style={{
                background: '#ff3e83',
              }}
            ></div>
          ) : null}
        </button>
        <button
          className={`h-7 rounded-md ${
            DCLAccountTokenNumber > 0 && !showCrossBalance ? 'flex' : 'hidden'
          } w-32 flex items-center justify-center ${
            accountTab === 'dcl'
              ? 'text-white bg-navHighLightBg bg-opacity-50'
              : ''
          }`}
          onClick={() => {
            setAccountTab('dcl');
          }}
        >
          REF(DCL)
          {hasDCLBalanceOver ? (
            <div
              className="w-1.5 h-1.5 relative left-1 bottom-1 rounded-full "
              style={{
                background: '#ff3e83',
              }}
            ></div>
          ) : null}
        </button>

        <button
          className={`h-7 rounded-md ${
            mapAccountTokenNumber > 0 && showCrossBalance ? 'flex' : 'hidden'
          } w-32 flex items-center justify-center ${
            accountTab === 'aurora'
              ? 'text-white bg-navHighLightBg bg-opacity-50'
              : ''
          }`}
          onClick={() => {
            setAccountTab('aurora');
          }}
        >
          Aurora
          {hasMapBalanceOver ? (
            <div
              className="w-1.5 h-1.5 relative left-1 bottom-1 rounded-full "
              style={{
                background: '#ff3e83',
              }}
            ></div>
          ) : null}
        </button>
      </div>

      <table className="w-full text-sm text-gray-400 mt-2 table-auto">
        <thead>
          <tr className="h-9">
            <th className="pl-6 text-left">
              <FormattedMessage id="tokens"></FormattedMessage>
            </th>
            {/* near head */}
            <th
              className={`text-right ${
                accountTab !== 'near' ? 'hidden' : 'pr-6'
              } `}
            >
              <span
                onClick={(e) => sort(e)}
                data-sort="near"
                className={`flex items-center w-full justify-end  `}
              >
                <WalletIcon />
                <label className="mx-1 cursor-pointer">NEAR</label>
                <TiArrowSortedUp
                  className={`cursor-pointer ${
                    currentSort == 'near-down' ? 'transform rotate-180' : ''
                  }`}
                />
              </span>
            </th>
            {/* ref v1 head */}
            <th
              className={`text-right ${
                accountTab !== 'ref' ? 'hidden' : 'pl-5'
              }  `}
            >
              <span
                onClick={(e) => sort(e)}
                data-sort="ref"
                className={`flex items-center w-full justify-end `}
              >
                <RefIcon />
                <label className="mx-1 cursor-pointer">REF(Classic)</label>
                <TiArrowSortedUp
                  className={`cursor-pointer ${
                    currentSort == 'ref-down' ? 'transform rotate-180' : ''
                  }`}
                />
              </span>
            </th>

            {/* ref v2 head */}
            <th
              className={`text-right ${
                accountTab !== 'dcl' ? 'hidden' : 'pl-5'
              }  `}
            >
              <span
                onClick={(e) => sort(e)}
                data-sort="dcl"
                className={`flex items-center w-full justify-end `}
              >
                <RefIcon />
                <label className="mx-1 cursor-pointer">REF(DCL)</label>
                <TiArrowSortedUp
                  className={`cursor-pointer ${
                    currentSort == 'dcl-down' ? 'transform rotate-180' : ''
                  }`}
                />
              </span>
            </th>

            {/*  aurora balance */}
            <th
              className={`text-right pl-5 ${
                accountTab === 'aurora' ? '' : 'hidden'
              }`}
            >
              <span
                onClick={(e) => sort(e)}
                data-sort="aurora"
                className={`flex items-center w-full justify-end `}
              >
                <MappingAccountIcon />
                <label className="mx-1 cursor-pointer">Mapping</label>
                <TiArrowSortedUp
                  className={`cursor-pointer ${
                    currentSort == 'aurora-down' ? 'transform rotate-180' : ''
                  }`}
                />
              </span>
            </th>
            <th className={`pl-8 ${accountTab === 'near' ? 'hidden' : ''}`}>
              {showCrossBalance ? (
                <span className="flex items-center">
                  <label className="cursor-pointer" onClick={clickAllCheckbox}>
                    {checkAuroraAll ? (
                      <CheckboxSelected></CheckboxSelected>
                    ) : (
                      <Checkbox></Checkbox>
                    )}
                  </label>
                  <WithdrawTip />
                </span>
              ) : (
                <span className="flex items-center">
                  <label className="cursor-pointer" onClick={clickAllCheckbox}>
                    {checkAll ? (
                      <CheckboxSelected></CheckboxSelected>
                    ) : (
                      <Checkbox></Checkbox>
                    )}
                  </label>
                  <WithdrawTip />
                </span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {tokensSort.map((item: TokenMetadata & { aurora: string }) => {
            return (
              <tr
                className={`h-16 border-t border-borderColor border-opacity-30 hover:bg-chartBg hover:bg-opacity-20 ${
                  Number(item[accountTab] == 0) ? 'hidden' : ''
                }`}
                key={item.id}
              >
                {/* token info */}
                <td className="pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full border border-gradientFromHover mr-2.5 overflow-hidden flex-shrink-0">
                      <img src={item.icon} className="w-full h-full"></img>s
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <label className="text-white text-lg font-semibold">
                          {item.symbol}
                        </label>
                        {item.symbol == 'NEAR' ? <NearTip /> : null}
                      </div>
                      <label className="text-xs text-primaryText break-all">
                        {item.id}
                      </label>
                    </div>
                  </div>
                </td>
                {/* near balance */}
                <td
                  width="15%"
                  className={`text-right text-white font-semibold text-base ${
                    accountTab === 'near' ? 'pr-6' : 'hidden'
                  }`}
                >
                  <span title={item.near.toString()}>
                    {getWalletBalance(item)}
                  </span>
                  <div className="text-xs text-primaryText">
                    {!tokenPriceList?.[item.id]?.price
                      ? '$-'
                      : `~$${toInternationalCurrencySystem(
                          scientificNotationToString(
                            new Big(tokenPriceList?.[item.id]?.price || '0')
                              .times(new Big(item.near || '0'))
                              .toString()
                          ),
                          3
                        )}`}
                  </div>
                </td>
                {/* ref balance */}
                <td
                  width="130px"
                  className={`text-right text-white font-semibold text-base ${
                    accountTab === 'ref' ? '' : 'hidden'
                  }`}
                >
                  <span title={item.ref.toString()}>{getRefBalance(item)}</span>
                  <div className="text-xs text-primaryText">
                    {!tokenPriceList?.[item.id]?.price
                      ? '$-'
                      : `~$${toInternationalCurrencySystem(
                          scientificNotationToString(
                            new Big(tokenPriceList?.[item.id]?.price || '0')
                              .times(new Big(item.ref || '0'))
                              .toString()
                          ),
                          3
                        )}`}
                  </div>
                </td>

                {/* dcl balance */}
                <td
                  width="130px"
                  className={`text-right text-white font-semibold text-base ${
                    accountTab === 'dcl' ? '' : 'hidden'
                  }`}
                >
                  <span title={item.dcl.toString()}>{getDCLBalance(item)}</span>
                  <div className="text-xs text-primaryText">
                    {!tokenPriceList?.[item.id]?.price
                      ? '$-'
                      : `~$${toInternationalCurrencySystem(
                          scientificNotationToString(
                            new Big(tokenPriceList?.[item.id]?.price || '0')
                              .times(new Big(item.dcl || '0'))
                              .toString()
                          ),
                          3
                        )}`}
                  </div>
                </td>

                {/* aurora balance */}
                <td
                  width="130px"
                  className={`text-right text-white font-semibold text-base ${
                    accountTab === 'aurora' ? '' : 'hidden'
                  }`}
                >
                  <span title={item.aurora.toString()}>
                    {getAuroraBalance(item)}
                  </span>
                  <div className="text-xs text-primaryText">
                    {!tokenPriceList?.[item.id]?.price
                      ? '$-'
                      : `~$${toInternationalCurrencySystem(
                          scientificNotationToString(
                            new Big(tokenPriceList?.[item.id]?.price || '0')
                              .times(new Big(item.aurora || '0'))
                              .toString()
                          ),
                          3
                        )}`}
                  </div>
                </td>
                {/* check box */}
                <td
                  width="15%"
                  className={`pl-8 ${accountTab === 'near' ? 'hidden' : ''}`}
                >
                  {showCrossBalance ? (
                    <label
                      className={`${
                        Number(item.aurora) > 0
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed'
                      } `}
                      onClick={() => {
                        clickCheckbox(item);
                      }}
                    >
                      {checkedAuroraMap[item.id]?.amount ? (
                        <CheckboxSelected></CheckboxSelected>
                      ) : (
                        <Checkbox></Checkbox>
                      )}
                    </label>
                  ) : (
                    <label
                      className={`${
                        (Number(item.ref) && accountTab === 'ref') ||
                        (Number(item.dcl) && accountTab === 'dcl')
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed'
                      } `}
                      onClick={() => {
                        clickCheckbox(item);
                      }}
                    >
                      {checkedMap[item.id]?.amount ? (
                        <CheckboxSelected></CheckboxSelected>
                      ) : (
                        <Checkbox></Checkbox>
                      )}
                    </label>
                  )}
                </td>
              </tr>
            );
          })}
          <tr
            className={`h-20 border-t border-borderColor border-opacity-30 ${
              accountTab !== 'near' ? '' : 'hidden'
            }`}
          >
            <td></td>
            <td colSpan={3}>
              <div className="flex justify-center">
                {showCrossBalance ? (
                  <GradientButton
                    color="#fff"
                    className={`w-36 h-9 text-center text-base text-white mt-4 focus:outline-none font-semibold ${
                      Object.keys(checkedAuroraMap).length == 0
                        ? 'opacity-40'
                        : ''
                    }`}
                    onClick={doWithDraw}
                    disabled={
                      Object.keys(checkedAuroraMap).length == 0 ||
                      withdrawLoading
                    }
                    btnClassName={
                      Object.keys(checkedAuroraMap).length == 0
                        ? 'cursor-not-allowed'
                        : ''
                    }
                    loading={withdrawLoading}
                  >
                    <div>
                      <ButtonTextWrapper
                        loading={withdrawLoading}
                        Text={() => (
                          <FormattedMessage
                            id="withdraw"
                            defaultMessage="Withdraw"
                          />
                        )}
                      />
                    </div>
                  </GradientButton>
                ) : (
                  <GradientButton
                    color="#fff"
                    className={`w-36 h-9 text-center text-base text-white mt-4 focus:outline-none font-semibold ${
                      Object.keys(checkedMap).length == 0 ? 'opacity-40' : ''
                    }`}
                    onClick={doWithDraw}
                    disabled={
                      Object.keys(checkedMap).length == 0 || withdrawLoading
                    }
                    btnClassName={
                      Object.keys(checkedMap).length == 0
                        ? 'cursor-not-allowed'
                        : ''
                    }
                    loading={withdrawLoading}
                  >
                    <div>
                      <ButtonTextWrapper
                        loading={withdrawLoading}
                        Text={() => (
                          <FormattedMessage
                            id="withdraw"
                            defaultMessage="Withdraw"
                          />
                        )}
                      />
                    </div>
                  </GradientButton>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
function MobileAccountTable(props: any) {
  const {
    userTokens,
    type,
    refAccountTokenNumber,
    mapAccountTokenNumber,
    DCLAccountTokenNumber,
    showCrossBalance,
  } = props;
  const [tokensSort, setTokensSort] = useState(userTokens);
  const [currentSort, setCurrentSort] = useState('');
  const [checkedMap, setCheckedMap] = useState({});
  const [checkedAuroraMap, setCheckedAuroraMap] = useState({});
  const [checkAll, setCheckALl] = useState(false);
  const [checkAuroraAll, setCheckAuroraALl] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);

  const tokenPriceList = useTokenPriceList();

  useEffect(() => {
    sort(`${type} + '-up'`);
  }, [type]);
  const sort = (direction?: string) => {
    const { sortUserTokens, curSort } = accountSortFun(
      type,
      direction || currentSort,
      userTokens
    );
    setTokensSort(Array.from(sortUserTokens));
    setCurrentSort(curSort);
  };

  useEffect(() => {
    if (showCrossBalance) return;
    setCheckALl(false);
    setCheckedMap({});
  }, [type, showCrossBalance]);

  function clickAllCheckbox() {
    const newStatus = !showCrossBalance ? !checkAll : !checkAuroraAll;
    let newCheckedMap = {};
    let count = 0;

    if (newStatus) {
      for (let i = 0; i < tokensSort.length; i++) {
        const { id, ref, decimals, aurora, dcl } = tokensSort[i];

        if (
          (type === 'ref' && Number(ref) == 0) ||
          (type === 'dcl' && Number(dcl) == 0) ||
          (type === 'aurora' && Number(aurora) == 0)
        ) {
          continue;
        }

        if (count >= withdraw_number_at_once) {
          break;
        } else if (type === 'ref') {
          ++count;
          newCheckedMap[id] = {
            id,
            decimals,
            amount: ref,
          };
        } else if (type === 'dcl') {
          ++count;
          newCheckedMap[id] = {
            id,
            decimals,
            amount: dcl,
          };
        } else if (type === 'aurora') {
          ++count;
          newCheckedMap[id] = {
            id,
            decimals,
            amount: aurora,
          };
        }
      }
    } else {
      newCheckedMap = {};
    }

    if (!showCrossBalance) {
      setCheckALl(newStatus);
      setCheckedMap(newCheckedMap);
    } else {
      setCheckAuroraALl(newStatus);
      setCheckedAuroraMap(newCheckedMap);
    }
  }
  function clickCheckbox(token: TokenMetadata) {
    if (!showCrossBalance) {
      const { id, ref, dcl, decimals } = token;
      if (type === 'ref') {
        if (checkedMap[id] || Number(ref) == 0) {
          delete checkedMap[id];
        } else if (Object.keys(checkedMap).length < withdraw_number_at_once) {
          checkedMap[id] = {
            id,
            decimals,
            amount: ref,
          };
        }

        if (
          Object.keys(checkedMap).length ==
          Math.min(withdraw_number_at_once, refAccountTokenNumber)
        ) {
          setCheckALl(true);
        } else {
          setCheckALl(false);
        }
      }

      if (type === 'dcl') {
        if (checkedMap[id] || Number(dcl) == 0) {
          delete checkedMap[id];
        } else if (Object.keys(checkedMap).length < withdraw_number_at_once) {
          checkedMap[id] = {
            id,
            decimals,
            amount: dcl,
          };
        }

        if (
          Object.keys(checkedMap).length ==
          Math.min(withdraw_number_at_once, DCLAccountTokenNumber)
        ) {
          setCheckALl(true);
        } else {
          setCheckALl(false);
        }
      }

      setCheckedMap(Object.assign({}, checkedMap));
    } else {
      const { id, aurora, decimals } = token;
      if (checkedAuroraMap[id] || Number(aurora) == 0) {
        delete checkedAuroraMap[id];
      } else if (
        Object.keys(checkedAuroraMap).length < withdraw_number_at_once
      ) {
        checkedAuroraMap[id] = {
          id,
          decimals,
          amount: aurora,
        };
      }
      if (
        Object.keys(checkedAuroraMap).length ==
        Math.min(withdraw_number_at_once, mapAccountTokenNumber)
      ) {
        setCheckAuroraALl(true);
      } else {
        setCheckAuroraALl(false);
      }
      setCheckedAuroraMap(Object.assign({}, checkedAuroraMap));
    }
  }
  function doWithDraw() {
    setWithdrawLoading(true);
    if (showCrossBalance) batchWithdrawFromAurora(checkedAuroraMap);
    else if (type === 'ref') batchWithdraw(checkedMap);
    else if (type === 'dcl') {
      batchWithdrawDCL(checkedMap);
    }
  }

  return (
    <table className="text-left w-full text-sm text-gray-400 mt-8 table-auto">
      <thead>
        <tr className="h-9">
          <th className="pl-4">
            <FormattedMessage id="tokens"></FormattedMessage>
          </th>
          <th className={`pr-4 ${type == 'near' ? '' : 'hidden'}`}>
            <span
              onClick={() => {
                sort();
              }}
              data-sort="near"
              className={`flex items-center w-full justify-end`}
            >
              <WalletIcon />
              <label className="mx-1 cursor-pointer">NEAR</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'near-down' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
          <th className={`pr-4 ${type == 'ref' ? '' : 'hidden'}`}>
            <span
              onClick={() => {
                sort();
              }}
              data-sort="ref"
              className={`flex items-center w-full justify-end`}
            >
              <RefIcon />
              <label className="mx-1 cursor-pointer">REF(Classic)</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'ref-down' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>

          <th className={`pr-4 ${type == 'dcl' ? '' : 'hidden'}`}>
            <span
              onClick={() => {
                sort();
              }}
              data-sort="dcl"
              className={`flex items-center w-full justify-end`}
            >
              <RefIcon />
              <label className="mx-1 cursor-pointer">REF(DCL)</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'dcl-down' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
          <th className={`pr-4 ${type == 'aurora' ? '' : 'hidden'}`}>
            <span
              onClick={() => {
                sort();
              }}
              data-sort="aurora"
              className={`flex items-center w-full justify-end`}
            >
              <MappingAccountIcon />
              <label className="mx-1 cursor-pointer">Mapping</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'aurora-down' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
          <th className={`pr-2 ${type == 'near' ? 'hidden' : ''}`}>
            <label className="cursor-pointer" onClick={clickAllCheckbox}>
              {!showCrossBalance ? (
                <>
                  {checkAll ? (
                    <CheckboxSelected></CheckboxSelected>
                  ) : (
                    <Checkbox></Checkbox>
                  )}
                </>
              ) : (
                <>
                  {checkAuroraAll ? (
                    <CheckboxSelected></CheckboxSelected>
                  ) : (
                    <Checkbox></Checkbox>
                  )}
                </>
              )}
            </label>
          </th>
        </tr>
      </thead>
      <tbody>
        {tokensSort.map((item: TokenMetadata & { aurora: string }) => {
          if (
            (type == 'ref' && new BigNumber(item.ref).isEqualTo(0)) ||
            (type == 'near' && new BigNumber(item.near).isEqualTo(0)) ||
            (type == 'aurora' && new BigNumber(item.aurora).isEqualTo(0)) ||
            (type == 'dcl' && new BigNumber(item.dcl).isEqualTo(0))
          ) {
            return null;
          } else
            return (
              <tr
                className={`h-16 border-t border-borderColor border-opacity-30 hover:bg-chartBg hover:bg-opacity-20`}
                key={item.id}
              >
                <td className="pl-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full border border-gradientFromHover mr-2.5 overflow-hidden flex-shrink-0">
                      <img src={item.icon} className="w-full h-full"></img>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <label className="text-white text-lg font-semibold">
                          {item.symbol}
                        </label>
                        {item.symbol == 'NEAR' ? <NearTip /> : null}
                      </div>
                      <label className="text-xs text-primaryText break-all">
                        {item.id}
                      </label>
                    </div>
                  </div>
                </td>
                <td className={`pr-4 ${type == 'near' ? '' : 'hidden'}`}>
                  <div className="flex flex-col items-end py-4">
                    <label className="text-white font-semibold text-lg mb-1">
                      {getWalletBalance(item)}
                    </label>
                    <div className="text-xs text-primaryText">
                      {!tokenPriceList?.[item.id]?.price
                        ? '$-'
                        : `~$${toInternationalCurrencySystem(
                            scientificNotationToString(
                              new Big(tokenPriceList?.[item.id]?.price || '0')
                                .times(new Big(item.near || '0'))
                                .toString()
                            ),
                            3
                          )}`}
                    </div>
                  </div>
                </td>

                <td className={`pr-4 ${type == 'dcl' ? '' : 'hidden'}`}>
                  <div className="flex flex-col items-end py-4">
                    <label className="text-white font-semibold text-lg mb-1">
                      {getDCLBalance(item)}
                    </label>

                    <div className="text-xs text-primaryText">
                      {!tokenPriceList?.[item.id]?.price
                        ? '$-'
                        : `~$${toInternationalCurrencySystem(
                            scientificNotationToString(
                              new Big(tokenPriceList?.[item.id]?.price || '0')
                                .times(new Big(item.dcl || '0'))
                                .toString()
                            ),
                            3
                          )}`}
                    </div>
                  </div>
                </td>

                <td className={`pr-4 ${type == 'ref' ? '' : 'hidden'}`}>
                  <div className="flex flex-col items-end py-4">
                    <label className="text-white font-semibold text-lg mb-1">
                      {getRefBalance(item)}
                    </label>

                    <div className="text-xs text-primaryText">
                      {!tokenPriceList?.[item.id]?.price
                        ? '$-'
                        : `~$${toInternationalCurrencySystem(
                            scientificNotationToString(
                              new Big(tokenPriceList?.[item.id]?.price || '0')
                                .times(new Big(item.ref || '0'))
                                .toString()
                            ),
                            3
                          )}`}
                    </div>
                  </div>
                </td>
                <td className={`pr-4 ${type == 'aurora' ? '' : 'hidden'}`}>
                  <div className="flex flex-col items-end py-4">
                    <label className="text-white font-semibold text-lg mb-1">
                      {getAuroraBalance(item)}
                    </label>

                    <div className="text-xs text-primaryText">
                      {!tokenPriceList?.[item.id]?.price
                        ? '$-'
                        : `~$${toInternationalCurrencySystem(
                            scientificNotationToString(
                              new Big(tokenPriceList?.[item.id]?.price || '0')
                                .times(new Big(item.aurora || '0'))
                                .toString()
                            ),
                            3
                          )}`}
                    </div>
                  </div>
                </td>
                <td className={`pr-2 ${type == 'near' ? 'hidden' : ''}`}>
                  <label
                    className="cursor-pointer"
                    onClick={() => {
                      clickCheckbox(item);
                    }}
                  >
                    {!showCrossBalance ? (
                      <>
                        {checkedMap[item.id]?.amount ? (
                          <CheckboxSelected></CheckboxSelected>
                        ) : (
                          <Checkbox></Checkbox>
                        )}
                      </>
                    ) : (
                      <>
                        {checkedAuroraMap[item.id]?.amount ? (
                          <CheckboxSelected></CheckboxSelected>
                        ) : (
                          <Checkbox></Checkbox>
                        )}
                      </>
                    )}
                  </label>
                </td>
              </tr>
            );
        })}
        <tr
          className={`h-16 border-t border-borderColor border-opacity-30  ${
            type == 'near' ? 'hidden' : ''
          }`}
        >
          <td colSpan={5}>
            {!showCrossBalance ? (
              <div className="flex flex-col justify-center items-center mb-4">
                <div
                  className={`border border-primaryText p-2.5 text-xs text-navHighLightText text-left rounded-md m-3 mt-4 ${
                    Object.keys(checkedMap).length >= withdraw_number_at_once
                      ? ''
                      : 'hidden'
                  }`}
                >
                  <FormattedMessage id="over_tip"></FormattedMessage>
                </div>
                <GradientButton
                  color="#fff"
                  className={`w-36 h-9 text-center text-base text-white mt-2 focus:outline-none font-semibold ${
                    Object.keys(checkedMap).length == 0 ? 'opacity-40' : ''
                  }`}
                  onClick={doWithDraw}
                  disabled={
                    Object.keys(checkedMap).length == 0 || withdrawLoading
                  }
                  btnClassName={
                    Object.keys(checkedMap).length == 0
                      ? 'cursor-not-allowed'
                      : ''
                  }
                  loading={withdrawLoading}
                >
                  <div>
                    <ButtonTextWrapper
                      loading={withdrawLoading}
                      Text={() => (
                        <FormattedMessage
                          id="withdraw"
                          defaultMessage="Withdraw"
                        />
                      )}
                    />
                  </div>
                </GradientButton>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center mb-4">
                <div
                  className={`border border-primaryText p-2.5 text-xs text-navHighLightText text-left rounded-md m-3 mt-4 ${
                    Object.keys(checkedAuroraMap).length >=
                    withdraw_number_at_once
                      ? ''
                      : 'hidden'
                  }`}
                >
                  <FormattedMessage id="over_tip"></FormattedMessage>
                </div>
                <GradientButton
                  color="#fff"
                  className={`w-36 h-9 text-center text-base text-white mt-2 focus:outline-none font-semibold ${
                    Object.keys(checkedAuroraMap).length == 0
                      ? 'opacity-40'
                      : ''
                  }`}
                  onClick={doWithDraw}
                  disabled={
                    Object.keys(checkedAuroraMap).length == 0 || withdrawLoading
                  }
                  btnClassName={
                    Object.keys(checkedAuroraMap).length == 0
                      ? 'cursor-not-allowed'
                      : ''
                  }
                  loading={withdrawLoading}
                >
                  <div>
                    <ButtonTextWrapper
                      loading={withdrawLoading}
                      Text={() => (
                        <FormattedMessage
                          id="withdraw"
                          defaultMessage="Withdraw"
                        />
                      )}
                    />
                  </div>
                </GradientButton>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
function Account(props: any) {
  const { userTokens } = props;
  const [visible, setVisible] = useState(false);
  const [visibleMap, setVisibleMap] = useState(false);

  const [hasRefBalanceOver, setHasRefBalanceOver] = useState<boolean>(false);
  const [hasMapBalanceOver, setHasMapBalanceOver] = useState<boolean>(false);

  const [hasDCLBalanceOver, setHasDCLBalanceOver] = useState<boolean>(false);

  const [refAccountTokenNumber, setRefAccountTokenNumber] = useState();
  const [mapAccountTokenNumber, setMapAccountTokenNumber] = useState();

  const [DCLAccountTokenNumber, setDCLAccountTokenNumber] = useState();

  useEffect(() => {
    const hasRefBalanceOver = userTokens.some((token: TokenMetadata) => {
      return Number(token.ref) > 0.001;
    });
    const hasMapBalanceOver = userTokens.some(
      (token: TokenMetadata & { aurora: string }) => {
        return Number(token.aurora) > 0;
      }
    );

    const hasDCLBalanceOver = userTokens.some(
      (token: TokenMetadata & { dcl: string }) => {
        return Number(token.dcl) > 0;
      }
    );

    const refAccountHasToken = userTokens.filter((token: TokenMetadata) => {
      const { ref } = token;
      if (Number(ref) > 0) return true;
    });

    const mapAccountHasToken = userTokens.filter(
      (token: TokenMetadata & { aurora: string }) => {
        const { aurora } = token;
        return Number(aurora) > 0;
      }
    );

    const DCLAccountHasToken = userTokens.filter(
      (token: TokenMetadata & { dcl: string }) => {
        const { dcl } = token;
        return Number(dcl) > 0;
      }
    );

    setDCLAccountTokenNumber(DCLAccountHasToken.length);
    setRefAccountTokenNumber(refAccountHasToken.length);
    setMapAccountTokenNumber(mapAccountHasToken.length);
    setHasRefBalanceOver(hasRefBalanceOver);
    setHasMapBalanceOver(hasMapBalanceOver);
    setHasDCLBalanceOver(hasDCLBalanceOver);

    setVisible(
      hasRefBalanceOver &&
        !localStorage.getItem(REF_ACCOUNT_WITHDRAW_TIP)?.toString()
    );
    setVisibleMap(
      hasMapBalanceOver &&
        !localStorage.getItem(AURORA_ACCOUNT_WITHDRAW_TIP)?.toString()
    );
  }, []);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const auroraAddress = auroraAddr(
    getCurrentWallet()?.wallet?.getAccountId() || ''
  );
  const displayAddr = `${auroraAddress?.substring(
    0,
    6
  )}...${auroraAddress?.substring(
    auroraAddress.length - 6,
    auroraAddress.length
  )}`;

  const nearAddress: string = getCurrentWallet()?.wallet?.getAccountId() || '';

  const displayAddrNear =
    nearAddress.indexOf('.') === -1
      ? `${nearAddress.substring(0, 10)}...`
      : nearAddress;

  const tab = new URLSearchParams(window.location.search).get('tab');
  const crossStatus = localStorage.getItem(ACCOUNT_PAGE_AURORA_SHOW);
  const [showCrossBalance, setShowCrossBalance] = useState(
    tab === 'aurora' || (crossStatus === 'cross' && tab !== 'ref')
  );

  useEffect(() => {
    if (tab == 'aurora') {
      localStorage.setItem(ACCOUNT_PAGE_AURORA_SHOW, 'cross');
    }
    if (tab === 'ref') {
      localStorage.setItem(ACCOUNT_PAGE_AURORA_SHOW, 'normal');
    }
  }, [tab]);

  const [auroraAccountHover, setAuroraAccountHover] = useState(false);
  const [auroraAccountCopyDown, setAuroraAccountCopyDown] = useState(false);

  const accountTitle = !showCrossBalance ? (
    <>
      <NearIcon />
      <label className="ml-3 text-xl w-3/5 overflow-hidden whitespace-nowrap overflow-ellipsis">
        {isSignedIn && displayAddrNear}
      </label>
    </>
  ) : (
    <div className="flex items-center w-full">
      <div
        className="rounded-2xl flex items-center text-sm text-white py-0.5 px-3 mr-px"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          maxWidth: '40%',
        }}
      >
        <div className="mr-2">
          <Near color="white" />
        </div>

        <div className="w-full whitespace-nowrap overflow-hidden overflow-ellipsis">
          {displayAddrNear}
        </div>
      </div>

      <ConnectDot />
      <ConnectDot />

      <div
        className={
          'rounded-2xl flex items-center text-sm text-white py-0.5  px-3 ml-px '
        }
        style={{
          background: auroraAccountHover
            ? auroraAccountCopyDown
              ? '#70D44B'
              : 'rgba(112, 212, 75, 0.3)'
            : 'rgba(255, 255, 255, 0.15)',
        }}
      >
        <div>
          <AuroraIconWhite
            width="16"
            height="16"
            color={auroraAccountCopyDown ? '#001320' : ''}
          />
        </div>

        <div
          className="mx-2"
          style={{
            color: auroraAccountCopyDown ? '#001320' : 'white',
          }}
        >
          {displayAddr}
        </div>
        <CopyToClipboard text={auroraAddress}>
          <div
            className="cursor-pointer"
            onMouseEnter={() => setAuroraAccountHover(true)}
            onMouseLeave={() => setAuroraAccountHover(false)}
            onMouseDown={() => setAuroraAccountCopyDown(true)}
            onMouseUp={() => setAuroraAccountCopyDown(false)}
          >
            <CopyIcon
              fillColor={auroraAccountCopyDown ? '#001320' : '#ffffff'}
            />
          </div>
        </CopyToClipboard>
      </div>
    </div>
  );

  if (
    refAccountTokenNumber === undefined ||
    mapAccountTokenNumber === undefined ||
    DCLAccountTokenNumber === undefined
  )
    return <Loading />;

  window.history.replaceState(
    {},
    '',
    window.location.origin + window.location.pathname
  );

  return (
    <div className="justify-center relative w-560px m-auto mt-16 xs:hidden md:hidden pb-5 flex flex-col">
      {showCrossBalance ? (
        <>
          {visibleMap ? (
            <RefAccountTipMan setShowTip={setVisibleMap} tab="aurora" />
          ) : null}
        </>
      ) : (
        <>
          {visible ? (
            <RefAccountTipMan setShowTip={setVisible} tab="ref" />
          ) : null}
        </>
      )}

      <div className="flex items-center justify-between ">
        <div
          className="relative flex items-center font-semibold bg-cardBg rounded-t-xl text-white"
          style={{
            height: '50px',
            width: '100%',
          }}
        >
          <div className="relative top-2 left-8 flex items-center w-full">
            {accountTitle}
          </div>
          <div className="absolute bottom-0 -right-4">
            <ArcIcon></ArcIcon>
          </div>
        </div>

        <div
          className="pb-2 pl-3 accountPage-pc-top-right relative cursor-pointer"
          onClick={() => {
            const newCross = !showCrossBalance;
            localStorage.setItem(
              ACCOUNT_PAGE_AURORA_SHOW,
              newCross ? 'cross' : 'normal'
            );
            setShowCrossBalance(newCross);
          }}
        >
          <NewProIcon colorLight={showCrossBalance ? 'white' : ''} />
        </div>
      </div>

      <Card className=" w-full pt-2 pb-15 px-0 rounded-tl-none">
        <AccountTable
          userTokens={userTokens}
          hasRefBalanceOver={hasRefBalanceOver}
          hasMapBalanceOver={hasMapBalanceOver}
          refAccountTokenNumber={refAccountTokenNumber}
          mapAccountTokenNumber={mapAccountTokenNumber}
          showCrossBalance={showCrossBalance}
          hasDCLBalanceOver={hasDCLBalanceOver}
          DCLAccountTokenNumber={DCLAccountTokenNumber}
          defaultTab={tab === 'ref' ? (hasRefBalanceOver ? 'ref' : 'dcl') : tab}
        />
      </Card>
    </div>
  );
}
function MobileAccount(props: any) {
  const { userTokens } = props;

  const [activeTab, setActiveTab] = useState('');
  const [showTip, setShowTip] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const auroraAddress = auroraAddr(
    getCurrentWallet()?.wallet?.getAccountId() || ''
  );
  const [refAccountTokenNumber, setRefAccountTokenNumber] = useState();
  const [mapAccountTokenNumber, setMapAccountTokenNumber] = useState();
  const [hasRefBalanceOver, setHasRefBalanceOver] = useState(false);
  const [hasMapBalanceOver, setHasMapBalanceOver] = useState(false);

  const [DCLAccountTokenNumber, setDCLAccountTokenNumber] = useState();
  const [hasDCLBalanceOver, setHasDCLBalanceOver] = useState<boolean>(false);

  const displayAddr = `${auroraAddress?.substring(
    0,
    6
  )}...${auroraAddress?.substring(
    auroraAddress.length - 6,
    auroraAddress.length
  )}`;
  const nearAddress: string = getCurrentWallet()?.wallet?.getAccountId() || '';

  const displayAddrNear =
    nearAddress.indexOf('.') === -1
      ? `${nearAddress.substring(0, 10)}...`
      : nearAddress;

  const tab = new URLSearchParams(window.location.search).get('tab');

  const crossStatus = localStorage.getItem(ACCOUNT_PAGE_AURORA_SHOW);
  const [showCrossBalance, setShowCrossBalance] = useState(
    tab === 'aurora' || (crossStatus === 'cross' && tab !== 'ref')
  );

  useEffect(() => {
    if (tab == 'aurora') {
      localStorage.setItem(ACCOUNT_PAGE_AURORA_SHOW, 'cross');
    }
    if (tab === 'ref') {
      localStorage.setItem(ACCOUNT_PAGE_AURORA_SHOW, 'normal');
    }
  }, [tab]);
  useEffect(() => {
    const refAccountHasToken = userTokens.filter((token: TokenMetadata) => {
      const { ref } = token;
      if (Number(ref) > 0) return true;
    });
    const mapAccountHasToken = userTokens.filter(
      (token: TokenMetadata & { aurora: string }) => {
        const { aurora } = token;
        if (Number(aurora) > 0) return true;
      }
    );

    const DCLAccountHasToken = userTokens.filter(
      (token: TokenMetadata & { dcl: string }) => {
        const { dcl } = token;
        return Number(dcl) > 0;
      }
    );

    const hasRefBalanceOver = userTokens.some((token: TokenMetadata) => {
      return Number(token.ref) > 0.001;
    });
    const hasMapBalanceOver = userTokens.some(
      (token: TokenMetadata & { aurora: string }) => {
        return Number(token.aurora) > 0;
      }
    );

    const hasDCLBalanceOver = userTokens.some(
      (token: TokenMetadata & { dcl: string }) => {
        return Number(token.dcl) > 0;
      }
    );

    setHasRefBalanceOver(hasRefBalanceOver);
    setHasMapBalanceOver(hasMapBalanceOver);
    setRefAccountTokenNumber(refAccountHasToken.length);
    setMapAccountTokenNumber(mapAccountHasToken.length);

    setHasDCLBalanceOver(hasDCLBalanceOver);
    setDCLAccountTokenNumber(DCLAccountHasToken.length);

    switchCross({
      refOver: hasRefBalanceOver,
      dclOver: hasDCLBalanceOver,
      mapOver: hasMapBalanceOver,
    });
  }, []);

  const [copyIconHover, setCopyIconHover] = useState<boolean>(false);
  const [copyIconBgColor, setCopyIconBgColor] = useState<string>('black');

  const accountTitle = !showCrossBalance ? (
    <>
      <NearIcon />
      <label className="text-lg text-white ml-3 overflow-hidden whitespace-nowrap overflow-ellipsis w-2/3">
        {isSignedIn && displayAddrNear}
      </label>
    </>
  ) : (
    <div className="flex items-center text-white">
      <AuroraIconWhite />
      <div className="text-lg text-white  mx-1.5">{displayAddr}</div>
      <CopyToClipboard text={auroraAddress}>
        <div
          className={`bg-${copyIconBgColor} bg-opacity-20 rounded-lg flex items-center justify-center p-1.5 cursor-pointer`}
          onTouchStart={() => {
            setCopyIconBgColor('white');
            setCopyIconHover(true);
          }}
          onTouchEnd={() => {
            setCopyIconBgColor('black');
            setCopyIconHover(false);
          }}
        >
          <CopyIcon fillColor={copyIconHover ? '#00C6A2' : '#7E8A93'} />
        </div>
      </CopyToClipboard>
    </div>
  );
  const switchTab = (type: string) => {
    setActiveTab(type);
  };
  const switchCross = (initData?: any) => {
    let newCross = !showCrossBalance;
    let refOver = hasRefBalanceOver;
    let mapOver = hasMapBalanceOver;

    let dclOver = hasDCLBalanceOver;
    if (initData) {
      newCross = showCrossBalance;
      refOver = initData.refOver;
      mapOver = initData.mapOver;
      dclOver = initData.dclOver;
    } else {
      // new cross
      setShowCrossBalance(newCross);
      localStorage.setItem(
        ACCOUNT_PAGE_AURORA_SHOW,
        newCross ? 'cross' : 'normal'
      );
    }
    // seleced tab
    setActiveTab('near');
    if (newCross && mapOver) {
      setActiveTab('aurora');
    }
    if (!newCross && refOver) {
      setActiveTab('ref');
    }

    if (!newCross && dclOver) {
      setActiveTab('dcl');
    }
    // show tip
    const ref_account_withdraw_tip = localStorage.getItem(
      REF_ACCOUNT_WITHDRAW_TIP
    );
    const aurora_account_withdraw_tip = localStorage.getItem(
      AURORA_ACCOUNT_WITHDRAW_TIP
    );
    const showWithDrawTipBox =
      (newCross && mapOver && aurora_account_withdraw_tip != '1') ||
      (!newCross && refOver && ref_account_withdraw_tip != '1') ||
      (!newCross && dclOver && ref_account_withdraw_tip != '1');
    setShowTip(showWithDrawTipBox);
  };
  const closeAccountWithdrawTip = () => {
    setShowTip(false);
    if (showCrossBalance) {
      localStorage.setItem(AURORA_ACCOUNT_WITHDRAW_TIP, '1');
    } else {
      localStorage.setItem(REF_ACCOUNT_WITHDRAW_TIP, '1');
    }
  };
  return (
    <div className="lg:hidden">
      <div
        className={`mx-auto relative ${activeTab == 'near' ? '' : 'pb-10'}`}
        style={{ width: '95vw' }}
      >
        <div className="flex items-center justify-between">
          <div
            className="relative flex items-center  justify-center font-semibold bg-cardBg rounded-t-xl text-white w-full"
            style={{
              height: '50px',
              width: 'calc(100% - 1rem)',
            }}
          >
            <div className="flex items-center justify-center w-full">
              {accountTitle}
            </div>
            <div className="absolute bottom-0 -right-4">
              <ArcIcon></ArcIcon>
            </div>
          </div>
          <div
            className="pb-1 relative bottom-1 pl-3 accountPage-pc-top-right  cursor-pointer"
            onClick={() => {
              switchCross();
            }}
          >
            {showCrossBalance ? <ProIconClick /> : <ProIconHover />}
          </div>
        </div>
        <div className="bg-cardBg rounded-lg rounded-tl-none pt-3">
          <div className="px-3">
            <div
              className={`flex items-center bg-acccountTab
              ${
                (
                  showCrossBalance
                    ? !mapAccountTokenNumber
                    : !refAccountTokenNumber && !DCLAccountTokenNumber
                )
                  ? 'hidden'
                  : ''
              }
            
            rounded-lg p-1`}
            >
              <label
                onClick={() => {
                  switchTab('near');
                }}
                className={`flex items-center justify-center ${
                  mapAccountTokenNumber ||
                  refAccountTokenNumber ||
                  DCLAccountTokenNumber
                    ? 'w-1/2'
                    : 'w-full'
                } h-10 flex-grow text-base rounded-md  ${
                  activeTab == 'near'
                    ? 'text-white bg-acccountBlock'
                    : 'text-primaryText'
                }
             
                
                `}
              >
                NEAR
              </label>
              {showCrossBalance ? (
                <label
                  onClick={() => {
                    switchTab('aurora');
                  }}
                  className={`flex w-1/2 items-center justify-center h-10 text-center flex-grow text-base rounded-md ${
                    activeTab == 'aurora'
                      ? 'text-white bg-acccountBlock'
                      : 'text-primaryText'
                  } ${mapAccountTokenNumber ? '' : 'hidden'}`}
                >
                  Aurora
                  {hasMapBalanceOver ? (
                    <div
                      className="w-1.5 h-1.5 relative left-1 bottom-1 rounded-full "
                      style={{
                        background: '#ff3e83',
                      }}
                    ></div>
                  ) : null}
                </label>
              ) : (
                <>
                  <label
                    onClick={() => {
                      switchTab('ref');
                    }}
                    className={`flex w-1/2 items-center justify-center text-center h-10 flex-grow text-base rounded-md ${
                      activeTab == 'ref'
                        ? 'text-white bg-acccountBlock'
                        : 'text-primaryText'
                    } ${refAccountTokenNumber ? '' : 'hidden'}`}
                  >
                    REF(Classic)
                    {hasRefBalanceOver ? (
                      <div
                        className="w-1.5 h-1.5 relative left-1 bottom-1 rounded-full "
                        style={{
                          background: '#ff3e83',
                        }}
                      ></div>
                    ) : null}
                  </label>

                  <label
                    onClick={() => {
                      switchTab('dcl');
                    }}
                    className={`flex w-1/2 items-center justify-center text-center h-10 flex-grow text-base rounded-md ${
                      activeTab == 'dcl'
                        ? 'text-white bg-acccountBlock'
                        : 'text-primaryText'
                    } ${DCLAccountTokenNumber ? '' : 'hidden'}`}
                  >
                    REF(DCL)
                    {hasDCLBalanceOver ? (
                      <div
                        className="w-1.5 h-1.5 relative left-1 bottom-1 rounded-full "
                        style={{
                          background: '#ff3e83',
                        }}
                      ></div>
                    ) : null}
                  </label>
                </>
              )}
            </div>
          </div>
          <MobileAccountTable
            type={activeTab}
            userTokens={userTokens}
            refAccountTokenNumber={refAccountTokenNumber}
            mapAccountTokenNumber={mapAccountTokenNumber}
            showCrossBalance={showCrossBalance}
            DCLAccountTokenNumber={DCLAccountTokenNumber}
          />
          {showTip ? (
            <div
              style={{
                width: '95vw',
              }}
              className="fixed z-10 left-1/2 transform -translate-x-1/2 bottom-10 bg-cardBg border border-greenColor rounded-lg p-3.5 pr-5 text-white text-sm"
            >
              {showCrossBalance ? (
                <FormattedMessage id="aurora_account_tip_4"></FormattedMessage>
              ) : (
                <FormattedMessage id="ref_account_tip_3"></FormattedMessage>
              )}

              <div
                className="absolute pl-1 cursor-pointer"
                onClick={closeAccountWithdrawTip}
                style={{
                  right: '10px',
                  top: '10px',
                }}
              >
                <CloseIcon />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export function ActionModel(props: any) {
  const { modal, visible, onRequestClose } = props;
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState<boolean>(false);
  const { token, action } = modal || {};
  useEffect(() => {
    if (!visible) {
      setAmount('0');
    }
  }, [visible]);
  const showBalance = () => {
    const big = new BigNumber(modal?.max || '0');
    if (big.isEqualTo('0')) {
      return '0';
    } else if (big.isLessThan('0.001')) {
      return '<0.001';
    } else {
      return toPrecision(max?.toString() || '0', 3, true);
    }
  };
  const onSubmit = () => {
    setLoading(true);
    if (action == 'deposit') {
      if (token.id === nearMetadata.id) {
        wrapNear(amount);
      } else {
        deposit({ token, amount });
      }
    } else if (action == 'withdraw') {
      withdraw({ token, amount });
    }
  };
  const getRealMax = () => {
    const bigMax = new BigNumber(modal?.max || 0);
    let result_max = modal?.max;

    if (action == 'deposit' && modal?.token?.symbol == 'NEAR') {
      if (bigMax.isGreaterThan('1')) {
        result_max = bigMax.minus(1).toString();
      } else {
        result_max = 0;
      }
    }
    return result_max;
  };
  const max = getRealMax();
  return (
    <Modal
      isOpen={visible}
      onRequestClose={() => {
        onRequestClose(false);
      }}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
        },
      }}
    >
      <Card
        className="px-4 py-6 lg:px-6 lg:py-6 xs:w-95vw md:w-95vw lg:w-40vw xl:w-35vw"
        style={{ border: '1px solid rgba(0, 198, 162, 0.5)' }}
      >
        <div className="flex items-center justify-between mb-12 lg:mb-16">
          <label className="text-white text-base lg:text-2xl ">
            <FormattedMessage id={action}></FormattedMessage>
          </label>
          <IoCloseOutline
            onClick={() => {
              onRequestClose(false);
            }}
            className="text-gray-400 text-2xl cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="relative flex-grow xs:w-3/5 md:w-3/5">
            <div className="flex items-center text-primaryText text-xs absolute right-0 -top-6">
              <span className="mr-2 text-primaryText">
                {action == 'deposit' ? (
                  <WalletIcon></WalletIcon>
                ) : (
                  <RefIcon></RefIcon>
                )}
              </span>
              <FormattedMessage id="balance"></FormattedMessage>:{' '}
              <span title={max}>{showBalance()}</span>
            </div>
            <OldInputAmount max={max} onChangeAmount={setAmount} />
          </div>
          <div className="flex flex-shrink-0 rounded-full items-center ml-4 lg:ml-12">
            <label className="text-base lg:text-xl text-white font-semibold mr-2 lg:mr-5">
              {token?.symbol}
            </label>
            <img
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-gradientFromHover flex-shrink-0"
              src={token?.icon}
            ></img>
          </div>
        </div>
        <GreenLButton
          color="#fff"
          className={`w-full text-center text-white my-6 mb-3 lg:my-8 lg:mb-6 focus:outline-none font-semibold `}
          onClick={onSubmit}
          disabled={
            !amount ||
            new BigNumber('0').isEqualTo(amount) ||
            new BigNumber(amount).isGreaterThan(max)
          }
          loading={loading}
        >
          {loading ? (
            <BeatLoading />
          ) : action == 'deposit' ? (
            <FormattedMessage id="deposit" />
          ) : (
            <FormattedMessage id="withdraw"></FormattedMessage>
          )}
        </GreenLButton>
        <p className="text-primaryText text-xs text-center">
          {action == 'deposit' ? (
            <>
              <FormattedMessage id="small_storage_fee_is_applied_of"></FormattedMessage>{' '}
              {STORAGE_PER_TOKEN} Ⓝ
            </>
          ) : null}
        </p>
      </Card>
    </Modal>
  );
}
export default function AccountPage() {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  if (!accountId) {
    history.push('/');
    return null;
  }

  const auroraAddress = auroraAddr(
    getCurrentWallet()?.wallet?.getAccountId() || ''
  );

  const userTokens = useUserRegisteredTokensAllAndNearBalance();

  const balances = useTokenBalances(); // inner account balance

  const auroaBalances = useAuroraBalancesNearMapping(auroraAddress);

  const DCLAccountBalance = useDCLAccountBalance(!!accountId);

  if (!userTokens || !balances || !auroaBalances || !DCLAccountBalance)
    return <Loading />;

  userTokens.forEach((token: TokenMetadata) => {
    const { decimals, id, nearNonVisible, symbol } = token;
    token.ref =
      id === NEARXIDS[0]
        ? '0'
        : toReadableNumber(decimals, balances[id] || '0');
    token.near = toReadableNumber(decimals, (nearNonVisible || '0').toString());
    token.dcl = toReadableNumber(decimals, DCLAccountBalance[id] || '0');
    token.aurora = toReadableNumber(
      decimals,
      auroaBalances[id] || '0'
    ).toString();
  });

  return (
    <>
      <Account
        userTokens={userTokens.filter(
          (t) => TOKEN_BLACK_LIST.indexOf(t.id) === -1
        )}
      />
      <MobileAccount
        userTokens={userTokens.filter(
          (t) => TOKEN_BLACK_LIST.indexOf(t.id) === -1
        )}
      />
    </>
  );
}
