import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import { getAssets, getAccount } from 'src/services/burrow';
import {
  IAsset,
  IAccount,
  IUnclaimedReward,
} from 'src/services/burrow-interfaces';
import Big from 'big.js';
import { OverviewData } from '../../pages/Overview';
import {
  formatWithCommas_usd,
  shrinkToken,
  sumReducer,
} from '../../services/overview/utils';
import { BurrowBgIcon, ArrowRightIcon } from './Icons';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
export default function BurrowPanel() {
  const {
    tokenPriceList,
    isSignedIn,
    accountId,
    set_burrow_supplied_value,
    set_burrow_borrowied_value,
    set_burrow_rewards_value,
    set_burrow_done,
    is_mobile,
  } = useContext(OverviewData);
  const history = useHistory();
  const [account, setAccount] = useState<IAccount>();
  const [assets, setAssets] = useState<IAsset[]>();
  const [accountDone, setAccountDone] = useState<boolean>(false);
  const [supplied, setSupplied] = useState<string | number>('0');
  const [borrowed, setBorrowed] = useState<string | number>('0');
  const [unclaimedRewards, setUnclaimedRewards] = useState<IUnclaimedReward[]>(
    []
  );
  const [burrow_data_done, set_burrow_data_done] = useState<boolean>(false);

  useEffect(() => {
    if (isSignedIn) {
      getAccount().then((account: IAccount) => {
        setAccount(account);
        setAccountDone(true);
      });
    }
    getAssets().then((assets: IAsset[]) => {
      setAssets(assets);
    });
  }, [isSignedIn]);
  useEffect(() => {
    if (account && assets) {
      // supplied
      const depositedIds = new Set([
        ...account?.collateral?.map((item) => item.token_id),
        ...account?.supplied?.map((item) => item.token_id),
      ]);
      const supplied_temp = [...depositedIds]
        .map((depositedTokenId: string) => {
          const asset = assets.find((a) => a.token_id === depositedTokenId);
          const supplied = account.supplied.find(
            (s) => s.token_id === depositedTokenId
          );
          const collateral = account.collateral.find(
            (c) => c.token_id === depositedTokenId
          );
          const decimals =
            asset.metadata.decimals + asset.config.extra_decimals;
          const balance = Big(supplied?.balance || 0)
            .plus(collateral?.balance || 0)
            .toFixed();
          return Big(shrinkToken(balance, decimals) || 0)
            .mul(asset.price.usd || 0)
            .toNumber();
        })
        .reduce(sumReducer, 0);
      setSupplied(supplied_temp);
      // borrowed
      const borrowed_temp = account?.borrowed
        ?.map((item) => {
          const { balance, token_id } = item;
          const asset = assets.find((a) => a.token_id === token_id);
          const decimals =
            asset.metadata.decimals + asset.config.extra_decimals;
          return Big(shrinkToken(balance, decimals) || 0)
            .mul(asset.price.usd || 0)
            .toNumber();
        })
        .reduce(sumReducer, 0);
      setBorrowed(borrowed_temp);
      // unClaimed rewards
      const unclaimedRewards = getUnclaimedRewards();
      setUnclaimedRewards(unclaimedRewards);
      set_burrow_data_done(true);
    }
    if (accountDone && !account && assets) {
      set_burrow_data_done(true);
    }
  }, [account, assets, accountDone]);

  function getUnclaimedRewards() {
    const unclaimedRewardsMap = account
      ? account.farms?.reduce((prev, curr) => {
          for (const reward of curr.rewards) {
            const t = prev[reward.reward_token_id];
            if (t) {
              prev[reward.reward_token_id] = Big(t)
                .plus(reward.unclaimed_amount || 0)
                .toFixed();
            } else {
              prev[reward.reward_token_id] = Big(
                reward.unclaimed_amount || 0
              ).toFixed();
            }
          }
          return prev;
        }, {})
      : {};
    const unclaimedRewards = Object.keys(unclaimedRewardsMap).map((id) => {
      const asset = assets.find((a) => a.token_id === id);
      const decimals = asset.metadata.decimals + asset.config.extra_decimals;
      return {
        id,
        unclaimed: shrinkToken(unclaimedRewardsMap[id], decimals),
        symbol: asset.metadata.symbol,
        icon: asset.metadata.icon,
        usd: asset.price.usd,
      };
    });
    return unclaimedRewards as IUnclaimedReward[];
  }
  const [unclaimedRewards$, unclaimedRewardsIcons] = useMemo(() => {
    const $ =
      unclaimedRewards?.reduce((acc, cur) => {
        return Big(cur.unclaimed).mul(cur.usd).plus(acc).toNumber();
      }, 0) || 0;
    const icons =
      unclaimedRewards?.map((i: IUnclaimedReward) => {
        return <img className="w-4 h-4 -ml-1 rounded-full" src={i.icon}></img>;
      }) || [];
    return [$, icons];
  }, [unclaimedRewards]);
  useEffect(() => {
    if (burrow_data_done) {
      set_burrow_done(true);
      set_burrow_borrowied_value(borrowed);
      set_burrow_supplied_value(supplied);
      set_burrow_rewards_value(unclaimedRewards$);
    }
  }, [unclaimedRewards$, burrow_data_done, supplied, borrowed]);
  return (
    <div
      onClick={() => {
        if (!is_mobile) {
          history.push('/burrow');
        }
      }}
      style={{ height: is_mobile ? '115px' : '176px' }}
      className="flex flex-col justify-between bg-swapCardGradient rounded-2xl px-5 py-4 relative w-1 xsm:w-full flex-grow cursor-pointer xsm:mb-3"
    >
      <div className="flex items-center justify-between  xsm:relative  xsm:z-10">
        <span className="text-base text-overviewBurrowColor gotham_bold">
          Burrow
        </span>
        <ArrowRightIcon
          className={`lg:hidden text-primaryText`}
          onClick={() => {
            history.push('/burrow');
          }}
        ></ArrowRightIcon>
        <BurrowBgIcon className="absolute right-2 xsm:right-7 top-3"></BurrowBgIcon>
      </div>
      <div className="flex items-stretch justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="TotalSupplied" />
          </span>
          <span
            className={`text-base gotham_bold mt-3 xsm:mt-0 ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }`}
          >
            {formatWithCommas_usd(supplied)}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="Claimable" />
          </span>
          <span
            className={`text-base gotham_bold mt-3 xsm:mt-0 ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }`}
          >
            {formatWithCommas_usd(unclaimedRewards$)}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="TotalDebts" />
          </span>
          <span
            className={`text-base gotham_bold mt-3 xsm:mt-0 ${
              accountId
                ? 'text-overviewBurrowRedColor'
                : 'text-overviewGreyColor'
            }`}
          >
            -{formatWithCommas_usd(borrowed)}
          </span>
        </div>
      </div>
    </div>
  );
}
