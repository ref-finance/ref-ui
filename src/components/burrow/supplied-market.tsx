import React, { useEffect, useState, useContext } from 'react';
import { toInternationalCurrencySystem } from '../../utils/numbers';
import { TokenMetadata } from '~services/ft-contract';
import { GradientButton } from './burrow-button';
import { BurrowData } from '../../pages/Burrow';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
  IModalProps,
} from '~services/burrow-interfaces';
import Big from 'big.js';
import { shrinkToken, toAPY } from '~services/burrow-utils';
import ModalBox from './ModalBox';
import { isMobile } from '~utils/device';
const is_mobile = isMobile();
export default function SuppliedMarket() {
  const {
    account,
    assets,
    rewards,
    assetMetadatas,
  }: {
    account: IAccount;
    assets: IAsset[];
    rewards: IAssetRewardDetail[];
    assetMetadatas: Record<string, TokenMetadata>;
  } = useContext(BurrowData);
  const [showModalBox, setShowModalBox] = useState<boolean>(false);
  const [market_supplied_list, set_market_supplied_list] = useState<
    React.ReactElement[]
  >([]);
  const [modalData, setModalData] = useState<IModalProps>();
  useEffect(() => {
    if (assets && rewards) {
      get_market_supplied();
    }
  }, [account, assets, rewards]);
  function get_market_supplied() {
    const can_deposit_assets = assets.filter((a) => a.config.can_deposit);
    const market_deposit_assets = can_deposit_assets.map((asset) => {
      const { token_id, metadata, price, config } = asset;
      const assetReward = rewards.find(
        (reward: IAssetRewardDetail) => reward.token_id == token_id
      );
      const rewardTokens = assetReward?.rewardTokens || [];
      const r = rewards.find((a) => a.token_id === asset.token_id);
      const netTvlMultiplier = config.net_tvl_multiplier / 10000;
      const depositApy =
        r.apyBase + r.apyRewardTvl * netTvlMultiplier + r.apyReward;
      const token_usd_price = price && price.usd;
      const { volatility_ratio, extra_decimals } = config;
      const totalLiquidity = Big(asset.supplied.balance || 0)
        .plus(asset.reserved)
        .toFixed();
      const decimals = metadata.decimals + extra_decimals;
      const totalLiquidity_shrink = shrinkToken(totalLiquidity, decimals);
      const totalLiquidity_usd = toInternationalCurrencySystem(
        Big(totalLiquidity_shrink || 0)
          .mul(token_usd_price || 0)
          .toFixed(),
        2
      );
      const rewardTokensImg = rewardTokens?.map((token_id, index) => {
        const icon = assetMetadatas[token_id].icon;
        return (
          <img
            className={`w-4 h-4 rounded-full ${index != 0 ? 'ml-1.5' : ''}`}
            src={icon}
          ></img>
        );
      });
      const cf = volatility_ratio / 100;
      if (is_mobile) {
        return (
          <div className="bg-symbolHover mb-3 p-3 rounded-xl">
            <div className="flex items-center text-white text-sm gotham_bold">
              <img
                className="w-7 h-7 rounded-full mr-2"
                src={metadata.icon}
              ></img>
              {metadata.symbol}
            </div>
            <div className="flex justify-between items-stretch mb-4 mt-5">
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">APY</span>
                <span className="text-sm text-white mt-1">
                  {toAPY(depositApy)}%
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">Rewards</span>
                <span className="text-sm text-white mt-1">
                  {rewardTokensImg}
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">C.F.</span>
                <span className="text-sm text-white mt-1">{cf}%</span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">Total</span>
                <span className="text-sm text-white mt-1">
                  ${totalLiquidity_usd}
                </span>
              </div>
            </div>
            <div>
              <GradientButton
                customWidth="w-full"
                onClick={() => {
                  showSupplyModal(asset);
                }}
              >
                Supply
              </GradientButton>
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
                  src={metadata.icon}
                ></img>
                {metadata.symbol}
              </div>
            </td>
            <td>{toAPY(depositApy)}%</td>
            <td>{rewardTokensImg}</td>
            <td>{cf}%</td>
            <td>${totalLiquidity_usd}</td>
            <td>
              <div className="flex items-center justify-end pr-5 gap-2">
                <GradientButton
                  onClick={() => {
                    showSupplyModal(asset);
                  }}
                >
                  Supply
                </GradientButton>
              </div>
            </td>
          </tr>
        );
      }
    });
    set_market_supplied_list(market_deposit_assets);
  }
  function showSupplyModal(asset: IAsset) {
    setShowModalBox(true);
    setModalData({
      action: 'supply',
      asset,
    });
  }
  return (
    <div className="pb-5 pt-4">
      <div className="text-lg gotham_bold text-white pl-7 mb-4 xsm:text-base xsm:pl-0">
        <span className="text-burrowTitleGreenColor mr-2 xsm:text-white">
          Supply
        </span>
        Market
      </div>
      {is_mobile ? (
        <>{market_supplied_list}</>
      ) : (
        <table className="burrow_table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Assets</th>
              <th style={{ width: '15%' }}>APY</th>
              <th style={{ width: '15%' }}>Rewards</th>
              <th style={{ width: '15%' }}>C.F.</th>
              <th style={{ width: '15%' }}>Total Supply</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{market_supplied_list}</tbody>
        </table>
      )}
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