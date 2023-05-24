import React, { useEffect, useState, useContext } from 'react';
import { GradientButton, GradientLineButton } from './burrow-button';
import { BurrowData } from '../../pages/Burrow';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
} from '~services/burrow-interfaces';
import { getPortfolioRewards } from '~services/burrow-business';
import Big from 'big.js';
import {
  shrinkToken,
  toAPY,
  formatNumber,
  formatWithCommas_usd,
  toUsd,
} from '~services/burrow-utils';
import { IModalProps } from '~services/burrow-interfaces';
import ModalBox from './ModalBox';
import './burrow.css';
import { ConnectToNearBtn } from '~components/button/Button';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { isMobile } from '~utils/device';
const is_mobile = isMobile();
export default function YourSupplied() {
  const { accountId } = useWalletSelector();
  const {
    account,
    assets,
    rewards,
  }: { account: IAccount; assets: IAsset[]; rewards: IAssetRewardDetail[] } =
    useContext(BurrowData);
  const [your_supplied_list, set_your_supplied_list] = useState<
    React.ReactElement[]
  >([]);
  const [showModalBox, setShowModalBox] = useState<boolean>(false);
  const [modalData, setModalData] = useState<IModalProps>();
  useEffect(() => {
    if (account && assets && rewards) {
      get_your_supplied();
    }
  }, [account, assets, rewards]);
  function get_your_supplied() {
    const depositedAssets = new Set([
      ...account.supplied.map((a) => a.token_id),
      ...account.collateral.map((a) => a.token_id),
    ]) as any;
    const tbody = [...depositedAssets].map((depositedTokenId: string) => {
      const asset = assets.find((a) => a.token_id === depositedTokenId);
      const netTvlMultiplier = asset.config.net_tvl_multiplier / 10000;
      const r = rewards.find((a) => a.token_id === asset.token_id);
      const totalApy =
        r.apyBase + r.apyRewardTvl * netTvlMultiplier + r.apyReward;
      const decimals = asset.metadata.decimals + asset.config.extra_decimals;
      const supplied = account.supplied.find(
        (s) => s.token_id === depositedTokenId
      );
      const { can_use_as_collateral } = asset.config;
      const depositedBalance = supplied
        ? Number(shrinkToken(supplied.balance, decimals))
        : 0;

      const collateral = account.collateral.find(
        (c) => c.token_id === depositedTokenId
      );

      const collateralBalance = collateral
        ? Number(shrinkToken(collateral.balance, decimals))
        : 0;

      const totalBalance = depositedBalance + collateralBalance;
      const usd = totalBalance * asset.price.usd;
      const collateralUsd = collateralBalance * asset.price.usd;
      const rewardsList = getPortfolioRewards(
        'Supplied',
        depositedTokenId,
        account,
        assets
      );
      const rewards_usd = rewardsList.reduce(
        (acc: string, cur: { rewardPerDay: number; rewardAsset: IAsset }) => {
          const usd = Big(cur.rewardPerDay || 0).mul(
            cur?.rewardAsset?.price?.usd || 0
          );
          return Big(acc).plus(usd).toFixed();
        },
        '0'
      );
      const rewards_icons = rewardsList.map(
        (reward: { rewardPerDay: number; rewardAsset: IAsset }) => {
          const { rewardAsset } = reward;
          return (
            <img
              className={`w-4 h-4 rounded-full -ml-1`}
              src={rewardAsset.metadata.icon}
            />
          );
        }
      );
      if (is_mobile) {
        return (
          <div className="bg-symbolHover mb-3 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-white text-sm gotham_bold">
                <img
                  className="w-7 h-7 rounded-full mr-2"
                  src={asset.metadata.icon}
                ></img>
                {asset.metadata.symbol}
              </div>
              <div className="text-white text-sm gotham_bold">
                {formatNumber(Big(totalBalance || 0).toFixed())}
              </div>
            </div>
            <div className="flex justify-between items-stretch mb-4 mt-5">
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">Supply APY</span>
                <span className="text-sm text-white mt-1">
                  {toAPY(totalApy)}%
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">Rewards</span>
                <span className="text-sm text-white">
                  {rewardsList.length == 0 ? (
                    '-'
                  ) : (
                    <>{formatWithCommas_usd(rewards_usd)}</>
                  )}
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">Collateral</span>
                <span className="text-sm text-white">
                  {formatNumber(Big(collateralBalance || 0).toFixed())}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              {can_use_as_collateral && (
                <GradientButton
                  customWidth="w-1 flex-grow"
                  onClick={() => {
                    showAdjustModal(asset);
                  }}
                >
                  Adjust
                </GradientButton>
              )}
              <GradientLineButton
                customWidth="w-1 flex-grow"
                onClick={() => {
                  showWithdrawModal(asset);
                }}
              >
                Withdraw
              </GradientLineButton>
            </div>
          </div>
        );
      } else {
        return (
          <tr>
            <td>
              <div className="flex items-center">
                <img
                  className="w-7 h-7 rounded-full mr-2"
                  src={asset.metadata.icon}
                ></img>
                {asset.metadata.symbol}
              </div>
            </td>
            <td>{toAPY(totalApy)}%</td>
            <td>
              {rewardsList.length == 0 ? (
                '-'
              ) : (
                <div className="flex items-center">
                  {formatWithCommas_usd(rewards_usd)}
                  <div className="flex items-center ml-2.5 flex-grow">
                    {rewards_icons}
                  </div>
                </div>
              )}
            </td>
            <td>
              <span title={Big(collateralBalance || 0).toFixed()}>
                {formatNumber(Big(collateralBalance || 0).toFixed())}
                <span className="text-primaryText ml-1">
                  ({formatWithCommas_usd(Big(collateralUsd || 0).toFixed())})
                </span>
              </span>
            </td>
            <td>
              <span title={Big(totalBalance || 0).toFixed()}>
                {formatNumber(Big(totalBalance || 0).toFixed())}
                <span className="text-primaryText ml-1">
                  ({formatWithCommas_usd(Big(usd || 0).toFixed())})
                </span>
              </span>
            </td>
            <td>
              <div className="flex items-center justify-end pr-5 gap-2">
                {can_use_as_collateral && (
                  <GradientButton
                    onClick={() => {
                      showAdjustModal(asset);
                    }}
                  >
                    Adjust
                  </GradientButton>
                )}
                <GradientLineButton
                  onClick={() => {
                    showWithdrawModal(asset);
                  }}
                >
                  Withdraw
                </GradientLineButton>
              </div>
            </td>
          </tr>
        );
      }
    });
    set_your_supplied_list(tbody);
  }
  function showAdjustModal(asset: IAsset) {
    setShowModalBox(true);
    setModalData({
      action: 'adjust',
      asset,
    });
  }
  function showWithdrawModal(asset: IAsset) {
    setShowModalBox(true);
    setModalData({
      action: 'withdraw',
      asset,
    });
  }
  return (
    <div className="border-b-2 border-burrowTableBorderColor xsm:border-none pb-5">
      <div className="text-lg gotham_bold text-white lg:pl-7 xsm:pl-0 xsm:text-base mb-4">
        You Supplied
      </div>
      {your_supplied_list.length == 0 && accountId ? (
        <div className="text-sm text-primaryText flex items-center justify-center py-6">
          Your supplied assets will apear here.
        </div>
      ) : null}
      {your_supplied_list.length > 0 ? (
        <>
          {is_mobile ? (
            <>{your_supplied_list}</>
          ) : (
            <table className="burrow_table">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Assets</th>
                  <th style={{ width: '15%' }}>Supply APY</th>
                  <th style={{ width: '15%' }}>Rewards</th>
                  <th style={{ width: '15%' }}>Collateral</th>
                  <th style={{ width: '15%' }}>You Supplied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{your_supplied_list}</tbody>
            </table>
          )}
        </>
      ) : null}
      {!accountId ? (
        <div style={{ width: '220px', margin: '0 auto' }}>
          <ConnectToNearBtn></ConnectToNearBtn>
        </div>
      ) : null}

      {showModalBox && (
        <ModalBox
          showModalBox={showModalBox}
          setShowModalBox={setShowModalBox}
          modalData={modalData}
        ></ModalBox>
      )}
    </div>
  );
}
