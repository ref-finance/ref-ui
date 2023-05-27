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
import { getFTmetadata, ftGetBalance } from '../../pages/Orderly/near';
import { OrderlyBgIcon } from './Icons';
import {
  BalanceType,
  TokenInfo,
  TokenWithDecimals,
  Holding,
  IBalance,
} from '../../services/overview/interfaces';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { getCurrentHolding } from '../../pages/Orderly/orderly/off-chain-api';
import { toReadableNumber } from '~utils/numbers';
import { OverviewData } from '../../pages/Overview';
import { formatWithCommas_usd } from '../../services/overview/utils';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { RightArrowIcon, OrderlyLoading } from './Icons';
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
import { getOrderlySystemInfo } from '../../pages/Orderly/orderly/off-chain-api';
import { useHistory } from 'react-router-dom';
export default function OrderlyPanel() {
  const {
    tokenPriceList,
    isSignedIn,
    accountId,
    set_orderly_asset_value,
    set_orderly_asset_value_done,
  } = useContext(OverviewData);
  const history = useHistory();
  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);
  const [maintenance, setMaintenance] = React.useState<boolean>(false);
  const [keyLoading, setKeyLoading] = useState<boolean>(false);
  const storageEnough = useStorageEnough();
  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);
  const tokenInfo = useTokenInfo();
  const [balances, balancesDone] = useOrderAssets(
    tokenInfo,
    tradingKeySet,
    keyAnnounced
  ) as [IBalance[], boolean];
  useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
  }, []);
  useEffect(() => {
    if (!accountId || !storageEnough || maintenance) return;
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
          const res = await announceKey(accountId).then((res) => {
            setKeyAnnounced(true);
          });
        } else return;
      })
      .then(() => {
        is_trading_key_set(accountId).then(async (trading_key_set) => {
          setTradingKeySet(trading_key_set);
          if (!trading_key_set) {
            await setTradingKey(accountId).then(() => {
              setTradingKeySet(true);
            });
          }
          setKeyLoading(false);
        });
      })
      .catch((e) => {
        setKeyAnnounced(false);
        setTradingKeySet(false);
        setKeyLoading(false);
        localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
      });
  }, [accountId, storageEnough, maintenance]);
  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;
    localStorage.setItem(REF_ORDERLY_ACCOUNT_VALID, '1');
  }, [tradingKeySet, keyAnnounced]);

  const [totalAsset, totalAssetDone] = useMemo(() => {
    let totalAsset = '0';
    let totalAssetDone = false;
    if (balancesDone && Object.keys(tokenPriceList).length > 0) {
      totalAsset = balances
        ?.map((balance: IBalance) => {
          const total = Big(balance.available || 0).plus(
            balance['in-order'] || 0
          );
          const id = balance?.tokenMeta?.id;
          const price =
            tokenPriceList[id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : id]?.price ||
            '0';
          return total.mul(price).toFixed();
        })
        .reduce(
          (sum, cur) =>
            Big(sum)
              .plus(cur || 0)
              .toFixed(),
          '0'
        );
      totalAssetDone = true;
    }
    return [totalAsset, totalAssetDone];
  }, [balances, balancesDone, tokenPriceList]);
  useEffect(() => {
    if (totalAssetDone) {
      set_orderly_asset_value(totalAsset);
      set_orderly_asset_value_done(true);
    }
  }, [totalAssetDone]);

  const loading =
    (storageEnough === undefined || keyLoading) && accountId && !maintenance;

  const invalid =
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract() ||
    !accountId ||
    maintenance;

  const showMask = loading || invalid;

  return (
    <div
      className="flex flex-col justify-between bg-swapCardGradient rounded-2xl px-5 py-4 w-1 flex-grow overflow-hidden relative cursor-pointer"
      onClick={() => {
        openUrl('/orderbook');
      }}
    >
      <div>
        <span className="text-base text-greenColor gotham_bold">Orderly</span>
        <OrderlyBgIcon className="absolute right-2 top-3"></OrderlyBgIcon>
      </div>
      <div
        className={`flex items-stretch justify-between ${
          showMask ? 'hidden' : ''
        }`}
      >
        <div className="flex flex-col w-1/2">
          <span className="text-sm text-primaryText">Total Assets</span>
          <span className="text-base text-white gotham_bold mt-3">
            {formatWithCommas_usd(totalAsset)}
          </span>
        </div>
      </div>
      {/* mask */}
      {showMask ? (
        <div className="flex items-center justify-center absolute left-0 right-0 top-0 bottom-0 bg-overviewMaskColor rounded-2xl">
          {loading ? (
            <OrderlyLoading></OrderlyLoading>
          ) : (
            <div
              className="flex items-center text-sm text-senderHot bg-greenColor rounded-lg bg-opacity-30 h-8 px-4 cursor-pointer"
              onClick={() => {
                openUrl('/orderbook');
              }}
            >
              Connect <RightArrowIcon className="ml-2"></RightArrowIcon>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function useOrderAssets(
  tokenInfo: TokenInfo[] | undefined,
  tradingKeySet: boolean,
  keyAnnounced: boolean
) {
  const tokens = tokenInfo
    ? tokenInfo.map((t) => ({
        id: t.token_account_id,
        decimals: t.decimals,
      }))
    : [];

  const [balances, balancesDone] = useTokensBalances(
    tokens,
    tokenInfo,
    tradingKeySet,
    keyAnnounced
  ) as [BalanceType[], boolean];

  const displayBalances = balances.map((b, i) => {
    return {
      near: b.wallet_balance,
      'in-order': Math.abs(b['in-order']).toString(),
      available: b.holding.toString(),
      tokenMeta: b.meta,
    };
  });

  return [displayBalances, balancesDone];
}
function useTokensBalances(
  tokens: TokenWithDecimals[] | undefined,
  tokenInfo: TokenInfo[] | undefined,
  tradingKeySet: boolean,
  keyAnnounced: boolean
) {
  const [showbalances, setShowBalances] = useState<BalanceType[]>([]);
  const [showbalancesDone, setShowbalancesDone] = useState<boolean>(false);
  const { accountId } = useWalletSelector();
  const getBalanceAndMeta = async (token: TokenWithDecimals) => {
    const balance = await ftGetBalance(token.id).then((balance) => {
      return toReadableNumber(token.decimals, balance);
    });

    const meta = await getFTmetadata(token.id);

    return {
      balance,
      meta,
    };
  };
  useEffect(() => {
    if (!tokens || !tokenInfo || !accountId || !tradingKeySet || !keyAnnounced)
      return;

    Promise.all(
      tokenInfo.map((t) =>
        getBalanceAndMeta({
          id: t.token_account_id,
          decimals: t.decimals,
        })
      )
    )
      .then((balances) => {
        const showbalances = balances.map((b, i) => {
          const wallet_balance = b.balance;

          return {
            meta: b.meta,
            wallet_balance,
            id: tokenInfo[i].token_account_id,
            name: tokenInfo[i].token,
          };
        });

        return showbalances;
      })
      .then(async (res) => {
        const response = await getCurrentHolding({ accountId });

        const holdings = response?.data?.holding as Holding[];

        const resMap = res.reduce(
          (acc, cur) => {
            const id = cur.id;

            const holding = holdings?.find(
              (h: Holding) => h.token === cur.name
            );
            const displayHolding = holding
              ? Number(
                  new Big(holding.holding + holding.pending_short).toFixed(
                    Math.min(8, cur.meta.decimals || 9),
                    0
                  )
                )
              : 0;

            acc[id] = {
              ...cur,
              holding: displayHolding,
              'in-order': holding?.pending_short || 0,
            };
            return acc;
          },
          {} as {
            [key: string]: BalanceType;
          }
        );

        setShowBalances(Object.values(resMap));
        setShowbalancesDone(true);
      });
  }, [
    tokens?.map((t) => t.id).join('|'),
    tokenInfo,
    accountId,
    tradingKeySet,
    keyAnnounced,
  ]);

  return [showbalances, showbalancesDone];
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
