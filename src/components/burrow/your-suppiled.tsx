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
} from '~services/burrow-utils';
import { IModalProps } from '~services/burrow-interfaces';
import ModalBox from './ModalBox';
import './burrow.css';
export default function YourSupplied() {
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
            {/* todo 多个奖励币如何展示以及显示数量比显示价值好 */}
            {rewardsList.length == 0
              ? '-'
              : rewardsList.map((reward, index) => {
                  const { rewardPerDay, rewardAsset } = reward;
                  return (
                    <div
                      className="flex items-center"
                      title={Big(rewardPerDay || 0).toFixed()}
                    >
                      {formatNumber(rewardPerDay)}
                      <img
                        className={`w-4 h-4 rounded-full ml-1.5`}
                        src={rewardAsset.metadata.icon}
                      />
                    </div>
                  );
                })}
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
    <div className="border-b-2 border-burrowTableBorderColor pb-5">
      <div className="text-lg gotham_bold text-white pl-7 mb-4">
        You Supplied
      </div>
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
