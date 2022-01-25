import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import { TiArrowSortedUp } from 'react-icons/ti';
import { TokenMetadata } from '~/services/ft-contract';
import {
  BorderButtonHover,
  BorderButtonMobile,
  GreenLButton,
} from '~components/button/Button';
import {
  useTokenBalances,
  useUserRegisteredTokensAllAndNearBalance,
} from '~state/token';
import Loading from '~components/layout/Loading';
import { wallet } from '~services/near';
import { FormattedMessage, useIntl } from 'react-intl';
import { NearIcon, RefIcon, WalletIcon } from '~components/icon/Common';
import {
  toReadableNumber,
  toInternationalCurrencySystem,
  toInternationalCurrencySystemNature,
  toPrecision,
} from '~utils/numbers';
import BigNumber from 'bignumber.js';
import OldInputAmount from '~components/forms/OldInputAmount';
import { deposit, withdraw } from '~services/token';
import { nearMetadata, wrapNear } from '~/services/wrap-near';
import { BeatLoading } from '~components/layout/Loading';
import { STORAGE_PER_TOKEN } from '~services/creators/storage';
import { IoCloseOutline } from 'react-icons/io5';
import { XrefSymbol } from '~components/icon/Xref';
import ReactTooltip from 'react-tooltip';
import QuestionMark from '~components/farm/QuestionMark';
import { useHistory } from 'react-router';

const accountSortFun = (
  by: string,
  currentSort: string,
  userTokens: TokenMetadata[]
) => {
  const sortBy = by || 'near';
  const sortDirection = currentSort.split('-')[1] == 'down' ? 'up' : 'down';
  userTokens.sort((token1: TokenMetadata, token2: TokenMetadata) => {
    const { near: near1, ref: ref1 } = token1;
    const { near: near2, ref: ref2 } = token2;
    const near1Balance = new BigNumber(near1);
    const ref1Balance = new BigNumber(ref1);
    const near2Balance = new BigNumber(near2);
    const ref2Balance = new BigNumber(ref2);
    const a = sortBy == 'near' ? near1Balance : ref1Balance;
    const b = sortBy == 'near' ? near2Balance : ref2Balance;
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
const NearTip = () => {
  const intl = useIntl();
  return (
    <div
      className="ml-1.5"
      data-type="info"
      data-place="right"
      data-multiline={true}
      data-class="reactTip"
      data-html={true}
      data-tip={intl.formatMessage({ id: 'deposit_near_tip' })}
      data-for="nearId"
    >
      <QuestionMark />
      <ReactTooltip
        className="w-20"
        id="nearId"
        backgroundColor="#1D2932"
        border
        borderColor="#7e8a93"
        effect="solid"
      />
    </div>
  );
};
function AccountTable(props: any) {
  const { userTokens, getModalData } = props;
  const [tokensSort, setTokensSort] = useState(userTokens);
  const [currentSort, setCurrentSort] = useState('');
  useEffect(() => {
    sort();
  }, []);
  const sort = (e?: any) => {
    const sortBy = e?.currentTarget.dataset.sort || 'near';
    const { sortUserTokens, curSort } = accountSortFun(
      sortBy,
      currentSort,
      userTokens
    );
    setTokensSort(Array.from(sortUserTokens));
    setCurrentSort(curSort);
  };
  return (
    <table className="w-full text-sm text-gray-400 mt-8 table-auto">
      <thead>
        <tr className="h-9">
          <th className="pl-6 text-left">
            <FormattedMessage id="tokens"></FormattedMessage>
          </th>
          <th className="text-right">
            <span
              onClick={sort}
              data-sort="near"
              className={`flex items-center w-full justify-end ${
                currentSort.indexOf('near') > -1 ? 'text-greenColor' : ''
              }`}
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
          <th className="text-right">
            <span
              onClick={sort}
              data-sort="ref"
              className={`flex items-center w-full justify-end ${
                currentSort.indexOf('ref') > -1 ? 'text-greenColor' : ''
              }`}
            >
              <RefIcon />
              <label className="mx-1 cursor-pointer">REF</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'ref-down' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
          <th className="text-center"></th>
        </tr>
      </thead>
      <tbody>
        {tokensSort.map((item: TokenMetadata) => {
          return (
            <tr
              className={`h-16 border-t border-borderColor border-opacity-30 hover:bg-chartBg hover:bg-opacity-20 ${
                new BigNumber(item.near).isEqualTo('0') &&
                new BigNumber(item.ref).isEqualTo('0')
                  ? 'hidden'
                  : ''
              }`}
              key={item.id}
            >
              <td width="38%" className="pl-6">
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
              <td
                width="15%"
                className="text-right text-white font-semibold text-base"
              >
                <span title={item.near.toString()}>
                  {getWalletBalance(item)}
                </span>
              </td>
              <td
                width="15%"
                className="text-right text-white font-semibold text-base"
              >
                <span title={item.ref.toString()}>{getRefBalance(item)}</span>
              </td>
              <td width="32%" className="pl-8">
                <div className="flex flex-wrap">
                  <span
                    onClick={() => {
                      getModalData(item, 'deposit');
                    }}
                    className="mx-2 my-1"
                  >
                    <BorderButtonHover
                      className="opacity-40"
                      disabled={
                        new BigNumber(item.near).isEqualTo('0') ||
                        (item.symbol == 'NEAR' &&
                          new BigNumber(item.near).isLessThanOrEqualTo(1))
                      }
                    >
                      <FormattedMessage id="deposit"></FormattedMessage>
                    </BorderButtonHover>
                  </span>
                  <span
                    onClick={() => {
                      getModalData(item, 'withdraw');
                    }}
                    className="mx-2 my-1"
                  >
                    <BorderButtonHover
                      className="opacity-40"
                      disabled={new BigNumber(item.ref).isEqualTo('0')}
                    >
                      <FormattedMessage id="Withdraw"></FormattedMessage>
                    </BorderButtonHover>
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function MobileAccountTable(props: any) {
  const { userTokens, getModalData, type } = props;
  const [tokensSort, setTokensSort] = useState(userTokens);
  const [currentSort, setCurrentSort] = useState('');
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
  return (
    <table className="text-left w-full text-sm text-gray-400 mt-8 table-auto">
      <thead>
        <tr className="h-9">
          <th className="pl-4">
            <FormattedMessage id="tokens"></FormattedMessage>
          </th>
          <th className={`pr-4 ${type == 'ref' ? 'hidden' : ''}`}>
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
          <th className={`pr-4 ${type == 'near' ? 'hidden' : ''}`}>
            <span
              onClick={() => {
                sort();
              }}
              data-sort="ref"
              className={`flex items-center w-full justify-end`}
            >
              <RefIcon />
              <label className="mx-1 cursor-pointer">REF</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'ref-down' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {tokensSort.map((item: TokenMetadata) => {
          return (
            <tr
              className={`h-16 border-t border-borderColor border-opacity-30 hover:bg-chartBg hover:bg-opacity-20 ${
                (type == 'ref' && new BigNumber(item.ref).isEqualTo(0)) ||
                (type == 'near' && new BigNumber(item.near).isEqualTo(0))
                  ? 'hidden'
                  : ''
              }`}
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
              <td className={`pr-4 ${type == 'ref' ? 'hidden' : ''}`}>
                <div className="flex flex-col items-end py-4">
                  <label className="text-white font-semibold text-lg mb-1">
                    {getWalletBalance(item)}
                  </label>
                  <span
                    onClick={() => {
                      getModalData(item, 'deposit');
                    }}
                  >
                    <BorderButtonMobile
                      disabled={
                        new BigNumber(item.near).isEqualTo('0') ||
                        (item.symbol == 'NEAR' &&
                          new BigNumber(item.near).isLessThanOrEqualTo(1))
                      }
                    >
                      <FormattedMessage id="deposit"></FormattedMessage>
                    </BorderButtonMobile>
                  </span>
                </div>
              </td>
              <td className={`pr-4 ${type == 'near' ? 'hidden' : ''}`}>
                <div className="flex flex-col items-end py-4">
                  <label className="text-white font-semibold text-lg mb-1">
                    {getRefBalance(item)}
                  </label>
                  <span
                    onClick={() => {
                      getModalData(item, 'withdraw');
                    }}
                  >
                    <BorderButtonMobile
                      disabled={new BigNumber(item.ref).isEqualTo('0')}
                    >
                      <FormattedMessage id="withdraw"></FormattedMessage>
                    </BorderButtonMobile>
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function Account(props: any) {
  const { userTokens } = props;
  const [account, network] = wallet.getAccountId().split('.');
  const [modal, setModal] = useState(null);
  const [visible, setVisible] = useState(false);
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const accountName =
    account.length > 10 ? niceAccountId : wallet.getAccountId();

  const getModalData = (token: TokenMetadata, action: string) => {
    const { decimals } = token;
    setModal({
      token,
      action,
      max: action == 'deposit' ? token.near : token.ref,
    });
    setVisible(true);
  };
  return (
    <div className="flex justify-center relative w-3/5 m-auto mt-16 xs:hidden md:hidden">
      <Card className="w-full pt-6 pb-1.5 px-0">
        <div className="flex items-center justify-between pb-4 px-6">
          <div className="flex items-center font-semibold text-white">
            <NearIcon />
            <label className="ml-3 text-xl">
              {wallet.isSignedIn() && accountName}
            </label>
          </div>
        </div>
        <AccountTable
          userTokens={userTokens}
          getModalData={getModalData}
        ></AccountTable>
        <ActionModel
          modal={modal}
          visible={visible}
          onRequestClose={setVisible}
        ></ActionModel>
      </Card>
    </div>
  );
}
function MobileAccount(props: any) {
  const { userTokens } = props;
  const [account, network] = wallet.getAccountId().split('.');
  const [modal, setModal] = useState(null);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('near');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const accountName =
    account.length > 10 ? niceAccountId : wallet.getAccountId();

  const getModalData = (token: TokenMetadata, action: string) => {
    setModal({
      token,
      action,
      max: action == 'deposit' ? token.near : token.ref,
    });
    setVisible(true);
  };
  const switchTab = (type: string) => {
    setActiveTab(type);
  };
  return (
    <div className="lg:hidden">
      <div
        className="bg-cardBg rounded-lg mx-auto relative"
        style={{ width: '95vw' }}
      >
        <div className="flex text-white items-center justify-center py-6">
          <NearIcon />
          <label className="ml-3 text-xl">
            {wallet.isSignedIn() && accountName}
          </label>
        </div>
        <div className="px-3">
          <div className="flex items-center bg-acccountTab rounded-lg p-1">
            <label
              onClick={() => {
                switchTab('near');
              }}
              className={`flex items-center justify-center h-10 flex-grow text-base rounded-md  ${
                activeTab == 'near'
                  ? 'text-white bg-acccountBlock'
                  : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="near_wallet"></FormattedMessage>
            </label>
            <label
              onClick={() => {
                switchTab('ref');
              }}
              className={`flex items-center justify-center h-10 flex-grow text-base rounded-md ${
                activeTab == 'ref'
                  ? 'text-white bg-acccountBlock'
                  : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="ref_account"></FormattedMessage>
            </label>
          </div>
        </div>
        <MobileAccountTable
          type={activeTab}
          userTokens={userTokens}
          getModalData={getModalData}
        ></MobileAccountTable>
        <ActionModel
          modal={modal}
          visible={visible}
          onRequestClose={setVisible}
        ></ActionModel>
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
      return toPrecision(max, 3, true);
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
export function AccountPage() {
  if (!wallet.isSignedIn()) {
    const history = useHistory();
    history.push('/');
    return null;
  }
  const userTokens = useUserRegisteredTokensAllAndNearBalance();
  const balances = useTokenBalances();
  if (!userTokens || !balances) return <Loading />;
  userTokens.forEach((token: TokenMetadata) => {
    const { decimals, id, nearNonVisible } = token;
    token.ref = toReadableNumber(decimals, balances[id] || '0');
    token.near = toReadableNumber(decimals, (nearNonVisible || '0').toString());
  });
  return (
    <>
      <Account userTokens={userTokens} />
      <MobileAccount userTokens={userTokens} />
    </>
  );
}
