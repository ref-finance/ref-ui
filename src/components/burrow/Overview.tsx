import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import {
  GradientButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import QuestionMark from 'src/components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { BurrowData } from '../../pages/Burrow';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
  INetTvlFarm,
  IUnclaimedReward,
} from 'src/services/burrow-interfaces';
import {
  getGains,
  getProtocolRewards,
  getTotalBalance,
} from 'src/services/burrow-business';
import { accountFarmClaimAll } from 'src/services/burrow';
import Big from 'big.js';
import {
  shrinkToken,
  sumReducer,
  formatWithCommas_usd,
  formatPercentage,
  formatNumber,
  formatToInternationalCurrencySystem$,
} from 'src/services/burrow-utils';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { isMobile } from 'src/utils/device';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
const is_mobile = isMobile();
const OverviewData = createContext(null);
export default function Overview() {
  const {
    account,
    assets,
    rewards,
  }: { account: IAccount; assets: IAsset[]; rewards: IAssetRewardDetail[] } =
    useContext(BurrowData);
  const { accountId, modal } = useWalletSelector();
  const [supplied, setSupplied] = useState<number>();
  const [borrowed, setBorrowed] = useState<number>();
  const [netApy, setNetApy] = useState<number>();
  const [unclaimedRewards, setUnclaimedRewards] =
    useState<IUnclaimedReward[]>();
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [dailyRewards, setDailyRewards] = useState<number>();
  const [totalSupplied, setTotalSupplied] = useState<number>();
  const [totalBorrowed, setTotalBorrowed] = useState<number>();
  const [totalAvailableLiquidity, setTotalAvailableLiquidity] =
    useState<number>();
  const [activeTab, setActiveTab] = useState<string>(
    accountId ? 'yours' : 'market'
  );
  const intl = useIntl();
  useEffect(() => {
    if (assets && rewards) {
      if (account) {
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
        // net apy
        const netApy = getNetAPY();
        setNetApy(netApy);
        // unClaimed rewards
        const unclaimedRewards = getUnclaimedRewards();
        setUnclaimedRewards(unclaimedRewards);
      }
      // get Daily Rewards
      getDailyRewards();
      // get total supplied、borrowed
      const supplied = getTotalBalance(assets, 'supplied');
      const borrowed = getTotalBalance(assets, 'borrowed');
      setTotalSupplied(supplied);
      setTotalBorrowed(borrowed);
      // Available Liquidity
      getTotalAvailableLiquidity(supplied, borrowed);
    }
  }, [account, assets, rewards]);
  function getNetAPY() {
    const extraDaily = getExtraDaily();
    const [gainCollateral, totalCollateral] = getGains(
      account,
      assets,
      'collateral'
    );
    const [gainSupplied, totalSupplied] = getGains(account, assets, 'supplied');
    const [gainBorrowed] = getGains(account, assets, 'borrowed');
    const gainExtra = Number(extraDaily) * 365;
    const netGains = gainCollateral + gainSupplied + gainExtra - gainBorrowed;
    const netTotals = totalCollateral + totalSupplied;
    const netAPY = (netGains / netTotals) * 100;
    const apyRewardTvl = rewards[0].apyRewardTvl || 0;
    return Big(netAPY || 0)
      .plus(apyRewardTvl)
      .toNumber();
  }
  function getExtraDaily() {
    const farms = account.farms.filter(
      (farm) => farm.rewards.length > 0 && farm.farm_id !== 'NetTvl'
    );
    const extraDaily$ = farms
      .map((farm) => {
        const token_id = farm.farm_id['Borrowed'] || farm.farm_id['Supplied'];
        const asset = assets.find((asset) => asset.token_id == token_id);
        const assetDecimals =
          asset.metadata.decimals + asset.config.extra_decimals;
        const rewards$ = farm.rewards
          .map((reward) => {
            const { reward_token_id, boosted_shares, asset_farm_reward } =
              reward;
            const assetReward = assets.find(
              (asset) => asset.token_id == reward_token_id
            );
            const rewardAssetDecimals =
              assetReward.metadata.decimals + assetReward.config.extra_decimals;
            const boostedShares = Number(
              shrinkToken(boosted_shares, assetDecimals)
            );
            const totalBoostedShares = Number(
              shrinkToken(asset_farm_reward.boosted_shares, assetDecimals)
            );
            const totalRewardsPerDay = Number(
              shrinkToken(asset_farm_reward.reward_per_day, rewardAssetDecimals)
            );
            const dailyAmount =
              (boostedShares / totalBoostedShares) * totalRewardsPerDay;
            const reward_usd = assetReward.price.usd || 0;
            return { dailyAmount, reward_token_id, token_id, reward_usd };
          })
          .flat()
          .reduce((acc, cur) => {
            const { dailyAmount, reward_usd } = cur;
            return acc + dailyAmount * reward_usd;
          }, 0);
        return rewards$;
      })
      .reduce(sumReducer, 0);
    return extraDaily$;
  }
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
  async function getDailyRewards() {
    const amount$ = await getProtocolRewards(assets);
    setDailyRewards(amount$);
  }
  function getTotalAvailableLiquidity(supplied: number, borrowed: number) {
    const availableLiquidity$ = Big(supplied || 0)
      .minus(borrowed || 0)
      .toNumber();
    // const availableLiquidity$ = assets.map((asset:IAsset) => Big(asset.availableLiquidity || 0).mul(asset.price.usd || 0).toNumber()).reduce(sumReducer, 0);

    setTotalAvailableLiquidity(availableLiquidity$);
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
  function getNetApyTip() {
    const tip = intl.formatMessage({ id: 'NetAPYTip' });
    let result: string = `<div class="text-farmText text-xs text-left w-48">${tip}</div>`;
    return result;
  }
  return (
    <OverviewData.Provider
      value={{
        activeTab,
        setActiveTab,
        totalSupplied,
        totalBorrowed,
        totalAvailableLiquidity,
        dailyRewards,
        supplied,
        borrowed,
        netApy,
        getNetApyTip,
        unclaimedRewards$,
        unclaimedRewardsIcons,
        setClaimLoading,
        claimLoading,
        accountId,
        modal,
      }}
    >
      {is_mobile ? (
        <OverviewMobile></OverviewMobile>
      ) : (
        <OverviewPc></OverviewPc>
      )}
    </OverviewData.Provider>
  );
}
function OverviewMobile() {
  const {
    activeTab,
    setActiveTab,
    totalSupplied,
    totalBorrowed,
    totalAvailableLiquidity,
    dailyRewards,
    supplied,
    borrowed,
    netApy,
    getNetApyTip,
    unclaimedRewards$,
    unclaimedRewardsIcons,
    setClaimLoading,
    claimLoading,
    accountId,
    modal,
  } = useContext(OverviewData);
  const claim = (
    <div
      onClick={() => {
        if (claimLoading || unclaimedRewardsIcons?.length == 0) return;
        setClaimLoading(true);
        accountFarmClaimAll();
      }}
      className={`text-sm text-senderHot focus:outline-none gotham_bold underline ${
        claimLoading || unclaimedRewardsIcons?.length == 0
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer'
      }`}
    >
      <ButtonTextWrapper
        loading={claimLoading}
        Text={() => <FormattedMessage id="claim"></FormattedMessage>}
      />
    </div>
  );
  return (
    <div>
      <div className="flex items-center border-b border-burrowTableBorderColor px-3 mb-5">
        <span
          onClick={() => {
            if (accountId) {
              setActiveTab('yours');
            } else {
              modal.show();
            }
          }}
          className={`text-sm gotham_bold mr-12 px-2 h-7 border-b-2 ${
            activeTab == 'yours'
              ? 'text-white  border-senderHot'
              : 'text-primaryText border-transparent'
          }`}
        >
          <FormattedMessage id="yours" />
        </span>
        <span
          onClick={() => {
            setActiveTab('market');
          }}
          className={`text-sm gotham_bold mr-12 px-2 h-7 border-b-2 ${
            activeTab == 'market'
              ? 'text-white  border-senderHot'
              : 'text-primaryText border-transparent'
          }`}
        >
          <FormattedMessage id="Market" />
        </span>
      </div>
      <div
        className={`grid grid-cols-2 gap-y-6 pl-3 ${
          activeTab == 'yours' ? '' : 'hidden'
        }`}
      >
        <Template
          title={<FormattedMessage id="Supplied" />}
          value={supplied}
        ></Template>
        <Template
          title={<FormattedMessage id="Borrowed" />}
          value={borrowed}
        ></Template>
        <Template
          title={<FormattedMessage id="NetAPY" />}
          value={formatPercentage(netApy)}
          tip={getNetApyTip()}
          noFormat={true}
        ></Template>
        <Template
          title={<FormattedMessage id="UnclaimedRewards" />}
          value={formatWithCommas_usd(unclaimedRewards$)}
          noFormat={true}
          claim={claim}
        ></Template>
      </div>
      <div
        className={`grid grid-cols-2 gap-y-6 pl-3 ${
          activeTab == 'market' ? '' : 'hidden'
        }`}
      >
        <Template
          title={<FormattedMessage id="TotalSupplied" />}
          value={formatToInternationalCurrencySystem$(totalSupplied)}
          noFormat={true}
        ></Template>
        <Template
          title={<FormattedMessage id="TotalBorrowed" />}
          value={formatToInternationalCurrencySystem$(totalBorrowed)}
          noFormat={true}
        ></Template>
        <Template
          title={<FormattedMessage id="AvailableLiquidities" />}
          value={formatToInternationalCurrencySystem$(totalAvailableLiquidity)}
          noFormat={true}
        ></Template>
        <Template
          title={<FormattedMessage id="DailyRewards" />}
          value={formatToInternationalCurrencySystem$(dailyRewards)}
          noFormat={true}
        ></Template>
      </div>
    </div>
  );
}
function OverviewPc() {
  const {
    activeTab,
    setActiveTab,
    totalSupplied,
    totalBorrowed,
    totalAvailableLiquidity,
    dailyRewards,
    supplied,
    borrowed,
    netApy,
    getNetApyTip,
    unclaimedRewards$,
    unclaimedRewardsIcons,
    setClaimLoading,
    claimLoading,
    accountId,
    modal,
  } = useContext(OverviewData);
  return (
    <div className="flex items-start justify-between">
      <div className="w-1/2">
        <div className={`${activeTab == 'market' ? '' : 'hidden'}`}>
          <div className="flex items-center gap-20">
            <Template
              title={<FormattedMessage id="TotalSupplied" />}
              value={totalSupplied}
            ></Template>
            <Template
              title={<FormattedMessage id="TotalBorrowed" />}
              value={totalBorrowed}
            ></Template>
            <Template
              title={<FormattedMessage id="AvailableLiquidities" />}
              value={totalAvailableLiquidity}
            ></Template>
          </div>
          <div className="flex items-center mt-10">
            <Template
              title={<FormattedMessage id="DailyRewards" />}
              value={dailyRewards}
            ></Template>
          </div>
        </div>
        <div className={`${activeTab == 'yours' ? '' : 'hidden'}`}>
          <div className="flex items-center gap-16">
            <Template
              title={<FormattedMessage id="Supplied" />}
              value={supplied}
            ></Template>
            <Template
              title={<FormattedMessage id="Borrowed" />}
              value={borrowed}
            ></Template>
            <Template
              title={<FormattedMessage id="NetAPY" />}
              value={formatPercentage(netApy)}
              tip={getNetApyTip()}
              noFormat={true}
            ></Template>
          </div>
          <div className="flex items-center mt-10">
            <Template
              title={<FormattedMessage id="UnclaimedRewards" />}
              value={formatWithCommas_usd(unclaimedRewards$)}
              noFormat={true}
              rewards={unclaimedRewardsIcons}
            ></Template>
            <GradientButton
              onClick={(e) => {
                setClaimLoading(true);
                accountFarmClaimAll();
              }}
              color="#fff"
              borderRadius="8px"
              disabled={claimLoading || unclaimedRewardsIcons?.length == 0}
              btnClassName={`${
                claimLoading || unclaimedRewardsIcons?.length == 0
                  ? 'cursor-not-allowed'
                  : ''
              }`}
              className={`h-8 px-4 ml-14 text-center text-sm text-white focus:outline-none gotham_bold ${
                claimLoading || unclaimedRewardsIcons?.length == 0
                  ? 'opacity-40'
                  : ''
              }`}
            >
              <ButtonTextWrapper
                loading={claimLoading}
                Text={() => <FormattedMessage id="claim"></FormattedMessage>}
              />
            </GradientButton>
          </div>
        </div>
      </div>
      <div className="flex items-center border border-v3borderColor rounded-lg p-0.5 relative top-2">
        <div
          onClick={() => {
            if (accountId) {
              setActiveTab('yours');
            } else {
              modal.show();
            }
          }}
          className={`flex items-center justify-center px-5 w-1/2 h-7 rounded-md cursor-pointer gotham_bold text-xs ${
            activeTab == 'yours'
              ? 'bg-burrowTabColor text-white'
              : 'text-primaryText'
          }`}
        >
          <FormattedMessage id="yours" />
        </div>
        <div
          onClick={() => {
            setActiveTab('market');
          }}
          className={`flex items-center justify-center px-5 w-1/2 h-7 rounded-md cursor-pointer gotham_bold text-xs ${
            activeTab == 'market'
              ? 'bg-burrowTabColor text-white'
              : 'text-primaryText'
          }`}
        >
          <FormattedMessage id="Market" />
        </div>
      </div>
    </div>
  );
}
const Template = (props: {
  title: string | number | React.ReactElement;
  value: string | number;
  tip?: any;
  rewards?: React.ReactElement[];
  noFormat?: boolean;
  claim?: React.ReactElement;
}) => {
  const { title, value, tip, rewards, noFormat, claim } = props;
  return (
    <div className="flex flex-col">
      <div className="flex items-center text-sm text-primaryText">
        {title}
        {tip && (
          <div
            className="text-white text-right ml-1.5"
            data-class="reactTip"
            data-tooltip-id="tipId"
            data-place="top"
            data-tooltip-html={tip}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="tipId" />
          </div>
        )}
      </div>
      <div
        className={`flex items-center text-white gotham_bold text-2xl ${
          claim ? 'justify-between' : ''
        }`}
      >
        {noFormat ? value : formatWithCommas_usd(value)}
        <div className="flex items-center ml-2.5 flex-grow">{rewards}</div>
        {claim}
      </div>
    </div>
  );
};
