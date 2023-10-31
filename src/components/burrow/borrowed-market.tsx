import React, { useEffect, useState, useContext } from 'react';
import { TokenMetadata } from 'src/services/ft-contract';
import { BurrowData } from '../../pages/Burrow';
import { PurpleButton } from './burrow-button';
import { toInternationalCurrencySystem } from '../../utils/numbers';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
  IBurrowConfig,
  IModalProps,
  ISort,
} from 'src/services/burrow-interfaces';
import {
  getExtraApy,
  sortBorrowedMarketData,
  hiddenAssets,
} from 'src/services/burrow-business';
import Big from 'big.js';
import { toAPY } from 'src/services/burrow-utils';
import ModalBox from './ModalBox';
import { isMobile } from 'src/utils/device';
import { ArrowUpIcon, ArrowDownIcon } from './icons';
import { FormattedMessage, useIntl } from 'react-intl';
const is_mobile = isMobile();
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
  const [showModalBox, setShowModalBox] = useState<boolean>(false);
  const [modalData, setModalData] = useState<IModalProps>();
  const [sort, setSort] = useState<ISort>({ field: 'total', order: 'desc' });
  useEffect(() => {
    if (assets && rewards && globalConfig) {
      get_market_borrowed();
    }
  }, [account, assets, rewards, globalConfig, sort]);
  function get_market_borrowed() {
    const can_burrow_assets =
      assets &&
      assets.filter(
        (a) => a.config.can_borrow && !hiddenAssets.includes(a.token_id)
      );
    sortBorrowedMarketData(
      can_burrow_assets,
      sort,
      account,
      assets,
      globalConfig,
      rewards
    );
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
            className={`w-4 h-4 rounded-full ${index != 0 ? '-ml-1.5' : ''}`}
            src={icon}
          ></img>
        );
      });
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
                <span className="text-sm text-primaryText">
                  <FormattedMessage id="APY" />
                </span>
                <span className="text-sm text-white mt-1">{toAPY(apy)}%</span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">
                  <FormattedMessage id="rewards" />
                </span>
                <span className="flex items-center text-sm text-white mt-1">
                  {rewardTokensImg.length == 0 ? '-' : rewardTokensImg}
                </span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">
                  <FormattedMessage id="CF" />
                </span>
                <span className="text-sm text-white mt-1">{cf || '-'}%</span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">
                  <FormattedMessage id="liquidity" />
                </span>
                <span className="text-sm text-white mt-1">${liquidity}</span>
              </div>
            </div>
            <div>
              <PurpleButton
                customWidth="w-full"
                onClick={() => {
                  showBorrowModal(asset);
                }}
              >
                <FormattedMessage id="Borrow" />
              </PurpleButton>
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
            <td>{toAPY(apy)}%</td>
            <td>
              <div className="flex items-center">
                {rewardTokensImg.length == 0 ? '-' : rewardTokensImg}
              </div>
            </td>
            <td>{cf || '-'}%</td>
            <td>${liquidity}</td>
            <td>
              <div className="flex items-center justify-end pr-5 gap-2">
                <PurpleButton
                  onClick={() => {
                    showBorrowModal(asset);
                  }}
                >
                  <FormattedMessage id="Borrow" />
                </PurpleButton>
              </div>
            </td>
          </tr>
        );
      }
    });

    set_market_borrowed_list(market_burrow_assets);
  }
  function showBorrowModal(asset: IAsset) {
    setShowModalBox(true);
    setModalData({
      action: 'borrow',
      asset,
    });
  }
  return (
    <div className="pb-5 pt-4">
      <div className="text-lg gotham_bold text-white pl-7 mb-4 xsm:pl-0 xsm:text-base">
        <span className="text-burrowPurpleColor mr-2 xsm:text-white">
          <FormattedMessage id="BorrowMarket" />
        </span>
      </div>
      {is_mobile ? (
        <>{market_borrowed_list}</>
      ) : (
        <table className="burrow_table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>
                <FormattedMessage id="assets" />
              </th>
              <th style={{ width: '15%' }}>
                <div
                  className="inline-flex items-center cursor-pointer"
                  onClick={() => {
                    setSort({
                      field: 'apy',
                      order: sort.order == 'desc' ? 'asc' : 'desc',
                    });
                  }}
                >
                  <FormattedMessage id="APY" />
                  <div className="flex flex-col items-center ml-1.5">
                    <ArrowUpIcon
                      className={`${
                        sort.field == 'apy' && sort.order == 'asc'
                          ? 'text-greenColor'
                          : 'text-primaryText'
                      }`}
                    ></ArrowUpIcon>
                    <ArrowDownIcon
                      className={`mt-0.5 ${
                        sort.field == 'apy' && sort.order == 'desc'
                          ? 'text-greenColor'
                          : 'text-primaryText'
                      }`}
                    ></ArrowDownIcon>
                  </div>
                </div>
              </th>
              <th style={{ width: '15%' }}>
                <FormattedMessage id="rewards" />
              </th>
              <th style={{ width: '15%' }}>
                <div
                  className="inline-flex items-center cursor-pointer"
                  onClick={() => {
                    setSort({
                      field: 'cf',
                      order: sort.order == 'desc' ? 'asc' : 'desc',
                    });
                  }}
                >
                  <FormattedMessage id="CF" />
                  <div className="flex flex-col items-center ml-1.5">
                    <ArrowUpIcon
                      className={`${
                        sort.field == 'cf' && sort.order == 'asc'
                          ? 'text-greenColor'
                          : 'text-primaryText'
                      }`}
                    ></ArrowUpIcon>
                    <ArrowDownIcon
                      className={`mt-0.5 ${
                        sort.field == 'cf' && sort.order == 'desc'
                          ? 'text-greenColor'
                          : 'text-primaryText'
                      }`}
                    ></ArrowDownIcon>
                  </div>
                </div>
              </th>
              <th style={{ width: '15%' }}>
                <div
                  className="inline-flex items-center cursor-pointer whitespace-nowrap"
                  onClick={() => {
                    setSort({
                      field: 'total',
                      order: sort.order == 'desc' ? 'asc' : 'desc',
                    });
                  }}
                >
                  <FormattedMessage id="AvailableLiquidities" />
                  <div className="flex flex-col items-center ml-1.5">
                    <ArrowUpIcon
                      className={`${
                        sort.field == 'total' && sort.order == 'asc'
                          ? 'text-greenColor'
                          : 'text-primaryText'
                      }`}
                    ></ArrowUpIcon>
                    <ArrowDownIcon
                      className={`mt-0.5 ${
                        sort.field == 'total' && sort.order == 'desc'
                          ? 'text-greenColor'
                          : 'text-primaryText'
                      }`}
                    ></ArrowDownIcon>
                  </div>
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>{market_borrowed_list}</tbody>
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
