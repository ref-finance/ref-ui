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
import { useTokenBalances, useUserRegisteredTokensAll } from '~state/token';
import Loading from '~components/layout/Loading';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { wallet } from '~services/near';
import { FormattedMessage, useIntl } from 'react-intl';
import { NearIcon, RefIcon, WalletIcon } from '~components/icon/Common';
import { toInternationalCurrencySystem } from '~utils/numbers';
import { getDepositableBalance } from '~state/token';
import BigNumber from 'bignumber.js';
import OldInputAmount from '~components/forms/OldInputAmount';
import { deposit, withdraw } from '~services/token';
import { nearMetadata, wrapNear } from '~/services/wrap-near';
import { BeatLoading } from '~components/layout/Loading';
import { STORAGE_PER_TOKEN } from '~services/creators/storage';
import { IoCloseOutline } from 'react-icons/io5';

function useWalletBalance(userTokens: TokenMetadata[]) {
  const [walletBalances, setWalletBalance] = useState({});
  useEffect(() => {
    const promiseList = userTokens.map((item: TokenMetadata) => {
      const { decimals, id } = item;
      return getDepositableBalance(id, decimals);
    });
    Promise.all(promiseList).then((list) => {
      const tempMap = {};
      list.forEach((m, index) => {
        tempMap[userTokens[index].id] = m;
      });
      setWalletBalance(tempMap);
    });
  }, []);
  return walletBalances;
}
function AccountTable(props: any) {
  const { userTokens, balances, getModalData } = props;
  const walletBalances = useWalletBalance(userTokens);
  const [tokensSort, setTokensSort] = useState(userTokens);
  const [currentSort, setCurrentSort] = useState('');
  const getRefBalance = (item: TokenMetadata) => {
    const { decimals, id } = item;
    const result = toInternationalCurrencySystem(
      toReadableNumber(decimals, balances[id] || '0')
    );
    item.ref = toReadableNumber(decimals, balances[id]);
    return result;
  };
  const getWalletBalance = (item: TokenMetadata) => {
    const { id } = item;
    const result = toInternationalCurrencySystem(walletBalances[id] || '0');
    item.near = walletBalances[id];
    return result;
  };
  useEffect(() => {
    sort();
  }, [walletBalances]);
  const sort = (e?: any) => {
    const sortBy = e?.currentTarget.dataset.sort || 'near';
    const sort: string[] = [];
    sort[0] = sortBy || 'near';
    sort[1] = currentSort.split('-')[1] == 'down' ? 'up' : 'down';
    const filterUserTokens = userTokens.filter((item: TokenMetadata) => {
      if (
        !(
          new BigNumber(item.near).isEqualTo('0') &&
          new BigNumber(item.ref).isEqualTo('0')
        )
      ) {
        return true;
      }
    });
    const sortList = filterUserTokens.sort(
      (token1: TokenMetadata, token2: TokenMetadata) => {
        const near1 = new BigNumber(token1.near);
        const near2 = new BigNumber(token2.near);
        const ref1 = new BigNumber(token1.ref);
        const ref2 = new BigNumber(token2.ref);
        const a = sort[0] == 'near' ? near1 : ref1;
        const b = sort[0] == 'near' ? near2 : ref2;
        if (sort[1] == 'down') {
          if (a.isLessThan(b)) {
            return -1;
          } else if (a.isGreaterThan(b)) {
            return 1;
          } else {
            return 0;
          }
        } else {
          if (a.isGreaterThan(b)) {
            return -1;
          } else if (a.isLessThan(b)) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    );
    setTokensSort(Array.from(sortList));
    setCurrentSort(sort[0] + '-' + sort[1]);
  };
  return (
    <table className="text-left w-full text-sm text-gray-400 mt-8 table-auto">
      <thead>
        <tr className="h-9 border-b border-borderColor border-opacity-30">
          <th className="pl-6">
            <FormattedMessage id="tokens"></FormattedMessage>
          </th>
          <th>
            <span
              onClick={sort}
              data-sort="near"
              className={`flex items-center w-full justify-start ${
                currentSort.indexOf('near') > -1 ? 'text-greenLight' : ''
              }`}
            >
              <WalletIcon />
              <label className="mx-1 cursor-pointer">NEAR</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'near-up' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
          <th>
            <span
              onClick={sort}
              data-sort="ref"
              className={`flex items-center w-full justify-start ${
                currentSort.indexOf('ref') > -1 ? 'text-greenLight' : ''
              }`}
            >
              <RefIcon />
              <label className="mx-1 cursor-pointer">REF</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'ref-up' ? 'transform rotate-180' : ''
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
              className={`h-16 border-b border-borderColor border-opacity-30 hover:bg-chartBg hover:bg-opacity-20`}
              key={item.id}
            >
              <td width="40%" className="pl-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full border border-gradientFromHover mr-2.5 overflow-hidden">
                    <img src={item.icon} className="w-full h-full"></img>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-lg font-semibold">
                      {item.symbol}
                    </label>
                    <label className="text-xs text-primaryText">
                      {item.id}
                    </label>
                  </div>
                </div>
              </td>
              <td
                width="15%"
                className="text-left text-white font-semibold text-base"
              >
                {getWalletBalance(item)}
              </td>
              <td
                width="15%"
                className="text-left text-white font-semibold text-base"
              >
                {getRefBalance(item)}
              </td>
              <td width="30%" className="text-center">
                <span
                  onClick={() => {
                    getModalData(item, 'deposit');
                  }}
                >
                  <BorderButtonHover
                    className="opacity-40 mr-3"
                    disabled={new BigNumber(item.near).isEqualTo('0')}
                  >
                    <FormattedMessage id="deposit"></FormattedMessage>
                  </BorderButtonHover>
                </span>
                <span
                  onClick={() => {
                    getModalData(item, 'withdraw');
                  }}
                >
                  <BorderButtonHover
                    className="opacity-40"
                    disabled={new BigNumber(item.ref).isEqualTo('0')}
                  >
                    <FormattedMessage id="Withdraw"></FormattedMessage>
                  </BorderButtonHover>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
function MobileAccountTable(props: any) {
  const { userTokens, balances, getModalData, type } = props;
  const walletBalances = useWalletBalance(userTokens);
  const [tokensSort, setTokensSort] = useState(userTokens);
  const [currentSort, setCurrentSort] = useState('');
  const getRefBalance = (item: TokenMetadata) => {
    const { decimals, id } = item;
    const result = toInternationalCurrencySystem(
      toReadableNumber(decimals, balances[id] || '0')
    );
    item.ref = toReadableNumber(decimals, balances[id]);
    return result;
  };
  const getWalletBalance = (item: TokenMetadata) => {
    const { id } = item;
    const result = toInternationalCurrencySystem(walletBalances[id] || '0');
    item.near = walletBalances[id];
    return result;
  };
  useEffect(() => {
    sort();
  }, [walletBalances, type]);
  const sort = (e?: any) => {
    const sortBy = e?.currentTarget.dataset.sort || type;
    const sort: string[] = [];
    sort[0] = sortBy;
    sort[1] = e ? (currentSort.split('-')[1] == 'down' ? 'up' : 'down') : 'up';
    const filterUserTokens = userTokens.filter((item: TokenMetadata) => {
      if (
        !(
          new BigNumber(item.near).isEqualTo('0') &&
          new BigNumber(item.ref).isEqualTo('0')
        )
      ) {
        return true;
      }
    });
    const sortList = filterUserTokens.sort(
      (token1: TokenMetadata, token2: TokenMetadata) => {
        const near1 = new BigNumber(token1.near);
        const near2 = new BigNumber(token2.near);
        const ref1 = new BigNumber(token1.ref);
        const ref2 = new BigNumber(token2.ref);
        const a = sort[0] == 'near' ? near1 : ref1;
        const b = sort[0] == 'near' ? near2 : ref2;
        if (sort[1] == 'down') {
          if (a.isLessThan(b)) {
            return -1;
          } else if (a.isGreaterThan(b)) {
            return 1;
          } else {
            return 0;
          }
        } else {
          if (a.isGreaterThan(b)) {
            return -1;
          } else if (a.isLessThan(b)) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    );
    setTokensSort(Array.from(sortList));
    setCurrentSort(sort[0] + '-' + sort[1]);
  };
  return (
    <table className="text-left w-full text-sm text-gray-400 mt-8 table-auto">
      <thead>
        <tr className="h-9 border-b border-borderColor border-opacity-30">
          <th className="pl-4">
            <FormattedMessage id="tokens"></FormattedMessage>
          </th>
          <th className={`pr-4 ${type == 'ref' ? 'hidden' : ''}`}>
            <span
              onClick={sort}
              data-sort="near"
              className={`flex items-center w-full justify-end ${
                currentSort.indexOf('near') > -1 ? 'text-greenLight' : ''
              }`}
            >
              <WalletIcon />
              <label className="mx-1 cursor-pointer">NEAR</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'near-up' ? 'transform rotate-180' : ''
                }`}
              />
            </span>
          </th>
          <th className={`pr-4 ${type == 'near' ? 'hidden' : ''}`}>
            <span
              onClick={sort}
              data-sort="ref"
              className={`flex items-center w-full justify-end ${
                currentSort.indexOf('ref') > -1 ? 'text-greenLight' : ''
              }`}
            >
              <RefIcon />
              <label className="mx-1 cursor-pointer">REF</label>
              <TiArrowSortedUp
                className={`cursor-pointer ${
                  currentSort == 'ref-up' ? 'transform rotate-180' : ''
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
              className={`h-16 border-b border-borderColor border-opacity-30 hover:bg-chartBg hover:bg-opacity-20`}
              key={item.id}
            >
              <td className="pl-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full border border-gradientFromHover mr-2.5 overflow-hidden">
                    <img src={item.icon} className="w-full h-full"></img>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-white text-lg font-semibold">
                      {item.symbol}
                    </label>
                    <label className="text-xs text-primaryText">
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
                      disabled={new BigNumber(item.near).isEqualTo('0')}
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
  const { userTokens, balances } = props;
  const [account, network] = wallet.getAccountId().split('.');
  const [modal, setModal] = useState(null);
  const [visible, setVisible] = useState(false);
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
  return (
    <div className="flex justify-center relative w-1/2 m-auto mt-16 xs:hidden md:hidden">
      <Card className="w-full py-6 px-0">
        <div className="flex items-center justify-between pb-4 px-6">
          <div className="flex items-center font-semibold text-white">
            <NearIcon />
            <label className="ml-3 text-xl">
              {wallet.isSignedIn() && accountName}
            </label>
          </div>
        </div>
        <AccountTable
          userTokens={[nearMetadata, ...userTokens]}
          balances={balances}
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
  const { userTokens, balances } = props;
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
          userTokens={[nearMetadata, ...userTokens]}
          balances={balances}
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
  const { token, action, max } = modal || {};
  const showBalance = (max: string) => {
    const big = new BigNumber(max);
    if (big.isEqualTo('0')) {
      return '0';
    } else {
      return big.toFixed(5, 1);
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
            <div className="text-primaryText text-xs absolute right-0 -top-6">
              <FormattedMessage id="balance"></FormattedMessage>:{' '}
              <label title={max}>{showBalance(max)}</label>
            </div>
            <OldInputAmount max={max} onChangeAmount={setAmount} />
          </div>
          <div className="flex rounded-full items-center ml-4 lg:ml-12">
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
            <FormattedMessage id="deposit_to_ref_account" />
          ) : (
            <FormattedMessage id="withdraw_to_near_wallet"></FormattedMessage>
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
  const userTokens = useUserRegisteredTokensAll();
  const balances = useTokenBalances();
  if (!userTokens) return <Loading />;
  return (
    <>
      <Account userTokens={userTokens} balances={balances} />
      <MobileAccount userTokens={userTokens} balances={balances} />
    </>
  );
}
