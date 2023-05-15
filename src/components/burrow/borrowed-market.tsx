import React, { useEffect, useState, useContext } from 'react';
import { TokenMetadata } from '~services/ft-contract';
import { BurrowData } from '../../pages/Burrow';
import { PurpleButton } from './burrow-button';
import { toInternationalCurrencySystem } from '../../utils/numbers';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
  IBurrowConfig,
} from '~services/burrow-interfaces';
import { getExtraApy } from '~services/burrow-business';
import Big from 'big.js';
import { toAPY } from '~services/burrow-utils';
export default function BorrowedMarket() {
  const {
    account,
    assets,
    rewards,
    globalConfig,
    assetMetadatas,
  }: {
    account: IAccount;
    assets: IAsset[];
    rewards: IAssetRewardDetail[];
    globalConfig: IBurrowConfig;
    assetMetadatas: Record<string, TokenMetadata>;
  } = useContext(BurrowData);
  const [market_borrowed_list, set_market_borrowed_list] = useState<
    React.ReactElement[]
  >([]);
  useEffect(() => {
    if (account && assets && rewards && globalConfig) {
      get_market_borrowed();
    }
  }, [account, assets, rewards, globalConfig]);
  function get_market_borrowed() {
    const can_burrow_assets =
      assets && assets.filter((a) => a.config.can_borrow);
    const market_burrow_assets = can_burrow_assets.map((asset) => {
      const { token_id, metadata, price, config } = asset;
      const r = rewards.find((a) => a.token_id === token_id);
      const rewardTokens = r?.rewardTokensBorrow || [];
      const borrowApy = r.apyBaseBorrow;
      const extraApy = getExtraApy(asset, account, assets, globalConfig);
      const apy = borrowApy - extraApy;
      const token_usd_price = price && price.usd;
      const liquidity = toInternationalCurrencySystem(
        Big(asset.availableLiquidity || 0)
          .mul(token_usd_price || 0)
          .toFixed(),
        2
      );
      const { volatility_ratio } = config;
      const cf = volatility_ratio / 100;
      const rewardTokensImg = rewardTokens.map((token_id, index) => {
        const icon = assetMetadatas[token_id].icon;
        return (
          <img
            className={`w-4 h-4 rounded-full ${index != 0 ? 'ml-1.5' : ''}`}
            src={icon}
          ></img>
        );
      });
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
          <td>{toAPY(apy)}%</td>
          <td>{rewardTokensImg.length == 0 ? '-' : rewardTokensImg}</td>
          <td>{cf || '-'}%</td>
          <td>${liquidity}</td>
          <td>
            <div className="flex items-center justify-end pr-5 gap-2">
              <PurpleButton>Borrow</PurpleButton>
            </div>
          </td>
        </tr>
      );
    });
    set_market_borrowed_list(market_burrow_assets);
  }
  return (
    <div className="pb-5 pt-4">
      <div className="text-lg gotham_bold text-white pl-7 mb-4">
        <span className="text-purpleBgColor mr-2">Borrow</span>
        Market
      </div>
      <table className="burrow_table">
        <thead>
          <tr>
            <th style={{ width: '18%' }}>Assets</th>
            <th style={{ width: '15%' }}>APY</th>
            <th style={{ width: '15%' }}>Rewards</th>
            <th style={{ width: '15%' }}>C.F.</th>
            <th style={{ width: '15%' }}>Total Liquidity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{market_borrowed_list}</tbody>
      </table>
    </div>
  );
}
