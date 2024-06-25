import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import Big from 'big.js';
import {
  useTokenInfo,
  useStorageEnough,
} from '../../pages/Orderly/orderly/state';
import { OrderlyBgIcon } from './Icons';
import {
  BalanceType,
  TokenInfo,
  TokenWithDecimals,
  Holding,
  IBalance,
} from '../../services/overview/interfaces';
import { OverviewData } from '../../pages/Overview';
import {
  formatWithCommas_usd,
  formatWithCommas_usd_down,
} from '../../services/overview/utils';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { RightArrowIcon, OrderlyLoading, ArrowRightIcon } from './Icons';
import { openUrl } from '../../services/commonV3';
import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../pages/Orderly/orderly/on-chain-api';
import { REF_ORDERLY_ACCOUNT_VALID } from '../../pages/Orderly/components/UserBoard';
import {
  getSelectedWalletId,
  REF_FI_SENDER_WALLET_ACCESS_KEY,
} from '../../pages/Orderly/orderly/utils';
import { announceKey, setTradingKey } from '../../pages/Orderly/orderly/api';
import getConfig from '../../pages/Orderly/config';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { useOrderlyContext } from 'src/pages/Orderly/orderly/OrderlyContext';
import {
  OrderAsset,
  useOrderlyPortfolioAssets,
} from '../../pages/Orderly/components/AssetModal/state';
import { usePerpData } from '../../pages/Orderly/components/UserBoardPerp/state';
import { OrderlyUnderMaintainIcon } from '../../pages/Orderly/components/Common/Icons';
function OrderlyPanel() {
  const {
    tokenPriceList,
    isSignedIn,
    accountId,
    set_orderly_asset_value,
    is_mobile,
  } = useContext(OverviewData);
  const history = useHistory();
  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const [keyLoading, setKeyLoading] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const storageEnough = useStorageEnough();
  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);
  const tokenInfo = useTokenInfo();
  const { setValidAccountSig, maintenance } = useOrderlyContext();
  const displayBalances: OrderAsset[] = useOrderlyPortfolioAssets(tokenInfo);
  const { totalEst } = usePerpData({ displayBalances, markMode: true });
  const totalAsset = Big(totalEst || 0).toFixed();
  const max_refresh_count = 4;

  useEffect(() => {
    if (
      !accountId ||
      !storageEnough ||
      maintenance ||
      refreshCount > max_refresh_count
    )
      return;
    if (!!storedValid) {
      setKeyAnnounced(true);
      setTradingKeySet(true);
      return;
    }
    setKeyLoading(true);
    is_orderly_key_announced(accountId, true)
      .then(async (key_announce) => {
        setKeyAnnounced(key_announce);
        if (!key_announce) {
          await announceKey(accountId)
            .then((res) => {
              setKeyAnnounced(true);
            })
            .catch((e) => {
              handleCatch(e);
            });
        }
      })
      .then(() => {
        is_trading_key_set(accountId).then(async (trading_key_set) => {
          setTradingKeySet(trading_key_set);
          if (!trading_key_set) {
            await setTradingKey(accountId)
              .then(() => {
                setTradingKeySet(true);
              })
              .catch((e) => {
                handleCatch(e);
              });
          }
          setKeyLoading(false);
        });
      })
      .catch((e) => {
        handleCatch(e);
      });
  }, [accountId, storageEnough, maintenance, refreshCount]);

  function handleCatch(e: any) {
    setKeyAnnounced(false);
    setTradingKeySet(false);
    localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
    if (refreshCount + 1 > max_refresh_count) {
      setKeyLoading(false);
    } else {
      setKeyLoading(true);
    }
    setRefreshCount(refreshCount + 1);
  }
  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;
    localStorage.setItem(REF_ORDERLY_ACCOUNT_VALID, '1');
    setValidAccountSig(true);
  }, [tradingKeySet, keyAnnounced]);
  useEffect(() => {
    if (totalAsset) {
      set_orderly_asset_value(totalAsset);
    }
  }, [totalAsset]);

  const loading =
    (storageEnough === undefined || keyLoading) && accountId && !maintenance;

  const invalid =
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract() ||
    maintenance;

  const showMask = loading || invalid;
  return (
    <div
      className={`flex flex-col justify-between bg-swapCardGradient rounded-2xl px-5 py-4 w-1 xsm:w-full flex-grow overflow-hidden relative xsm:mb-3 ${
        !is_mobile && (!showMask || !accountId) ? 'cursor-pointer' : ''
      }`}
      onClick={() => {
        if (!is_mobile && (!showMask || !accountId)) {
          history.push('/orderly');
        }
      }}
      style={{ height: is_mobile ? '115px' : '176px' }}
    >
      <div className="flex items-center justify-between xsm:relative xsm:z-10">
        <span className="text-base text-overviewPurpleColor gotham_bold">
          Orderly
        </span>
        <ArrowRightIcon
          className={`lg:hidden text-primaryText`}
          onClick={() => {
            history.push('/orderly');
          }}
        ></ArrowRightIcon>
        <OrderlyBgIcon className="absolute right-2 xsm:right-7 top-3"></OrderlyBgIcon>
      </div>
      <div
        className={`flex items-stretch justify-between ${
          showMask && accountId ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col w-1/2">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="TotalAssets" />
          </span>
          <span
            className={`text-base gotham_bold mt-3 xsm:mt-0 ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }
`}
          >
            {formatWithCommas_usd_down(totalAsset)}
          </span>
        </div>
      </div>
      {/* mask */}
      {showMask && accountId ? (
        <div className="flex items-center justify-center absolute left-0 right-0 top-0 bottom-0 bg-overviewMaskColor rounded-2xl">
          {loading ? (
            <OrderlyLoading></OrderlyLoading>
          ) : (
            <div
              className="flex items-center text-sm text-senderHot bg-greenColor rounded-lg bg-opacity-30 h-8 px-4 cursor-pointer"
              onClick={() => {
                history.push('/orderly');
              }}
            >
              <FormattedMessage id="connect" />{' '}
              <RightArrowIcon className="ml-2"></RightArrowIcon>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
function validContract() {
  const selectedWalletId = getSelectedWalletId();

  if (selectedWalletId === 'sender') {
    const storedKey = localStorage.getItem(REF_FI_SENDER_WALLET_ACCESS_KEY);

    return (
      //@ts-ignore
      !!window?.near?.authData?.allKeys?.[getConfig().ORDERLY_ASSET_MANAGER] ||
      (storedKey &&
        JSON.parse(storedKey)?.allKeys?.[getConfig().ORDERLY_ASSET_MANAGER])
    );
  }

  if (selectedWalletId === 'neth') return true;

  const walletStoredContract = localStorage.getItem(
    'near-wallet-selector:contract'
  );

  if (!walletStoredContract) {
    return true;
  } else {
    const parsedContract = JSON.parse(walletStoredContract)?.contractId;

    if (
      parsedContract &&
      parsedContract !== getConfig().ORDERLY_ASSET_MANAGER
    ) {
      return false;
    }

    return true;
  }
}
export default function OrderlyPanelContainer() {
  const { is_mobile } = useContext(OverviewData);
  const disbaledWallet = ['okx-wallet'];
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const isBlock = disbaledWallet.includes(selectedWalletId);
  if (isBlock)
    return (
      <div
        className={`flex flex-col justify-between bg-swapCardGradient rounded-2xl px-5 py-4 w-1 xsm:w-full flex-grow overflow-hidden relative xsm:mb-3`}
        style={{ height: is_mobile ? '115px' : '176px' }}
      >
        <span className="text-base text-overviewPurpleColor gotham_bold">
          Orderly
        </span>
        <div className="flex flex-col items-center justify-center relative -top-5 xsm:-top-14">
          <div className="transform scale-75 xsm:scale-50">
            <OrderlyUnderMaintainIcon removeText={true} />
          </div>
          <div className="text-white text-xs gotham_bold text-center -mt-6 xsm:-mt-12">
            This wallet doesn't support Orderbook.
          </div>
        </div>
      </div>
    );
  return <OrderlyPanel />;
}
