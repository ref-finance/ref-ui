import React, { useEffect, useState, useContext } from 'react';
import { BurrowData } from '../../pages/Burrow';
import { PurpleLineButton } from './burrow-button';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
  IBurrowConfig,
  IModalProps,
} from 'src/services/burrow-interfaces';
import { getExtraApy, getPortfolioRewards } from 'src/services/burrow-business';
import Big from 'big.js';
import {
  shrinkToken,
  toAPY,
  formatNumber,
  formatWithCommas_usd,
} from 'src/services/burrow-utils';
import ModalBox from './ModalBox';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { ConnectToNearBtn } from 'src/components/button/Button';
import { isMobile } from 'src/utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
const is_mobile = isMobile();
export default function YourBorrowed() {
  const {
    account,
    assets,
    rewards,
    globalConfig,
  }: {
    account: IAccount;
    assets: IAsset[];
    rewards: IAssetRewardDetail[];
    globalConfig: IBurrowConfig;
  } = useContext(BurrowData);
  const { accountId } = useWalletSelector();
  const [your_borrowed_list, set_your_borrowed_list] = useState<
    React.ReactElement[]
  >([]);
  const [showModalBox, setShowModalBox] = useState<boolean>(false);
  const [modalData, setModalData] = useState<IModalProps>();
  useEffect(() => {
    if (account && assets && globalConfig && rewards) {
      get_your_borrowed();
    }
  }, [account, assets, globalConfig, rewards]);
  function get_your_borrowed() {
    const your_borrowed_list = account.borrowed.map((borrowedAsset) => {
      const asset = assets.find((a) => a.token_id === borrowedAsset.token_id);
      const r = rewards.find((a) => a.token_id === asset.token_id);
      const totalApy = r.apyBaseBorrow;
      const extraApy = getExtraApy(asset, account, assets, globalConfig);
      const apy = totalApy - extraApy;
      const decimals = asset.metadata.decimals + asset.config.extra_decimals;
      const borrowed = Number(shrinkToken(borrowedAsset.balance, decimals));
      const usd = borrowed * asset.price.usd;
      const rewardsList =
        getPortfolioRewards(
          'Borrowed',
          borrowedAsset.token_id,
          account,
          assets
        ) || [];
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
                {formatNumber(Big(borrowed || 0).toFixed())}
              </div>
            </div>
            <div className="flex justify-between items-stretch mb-4 mt-5">
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">
                  <FormattedMessage id="BorrowAPY" />
                </span>
                <span className="text-sm text-white mt-1">{toAPY(apy)}%</span>
              </div>
              <div className="flex flex-col justify-between">
                <span className="text-sm text-primaryText">
                  <FormattedMessage id="Rewards" />
                </span>
                <span className="text-sm text-white mt-1">
                  {rewardsList.length == 0 ? (
                    '-'
                  ) : (
                    <>{formatWithCommas_usd(rewards_usd)}</>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <PurpleLineButton
                customWidth="w-full"
                onClick={() => {
                  showRepayModal(asset);
                }}
              >
                <FormattedMessage id="Repay" />
              </PurpleLineButton>
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
            <td>{toAPY(apy)}%</td>
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
              <span title={Big(borrowed || 0).toFixed()}>
                {formatNumber(Big(borrowed || 0).toFixed())}
                <span className="text-primaryText ml-1">
                  ({formatWithCommas_usd(Big(usd || 0).toFixed())})
                </span>
              </span>
            </td>
            <td>
              <div className="flex items-center justify-end pr-5 gap-2">
                <PurpleLineButton
                  onClick={() => {
                    showRepayModal(asset);
                  }}
                >
                  <FormattedMessage id="Repay" />
                </PurpleLineButton>
              </div>
            </td>
          </tr>
        );
      }
    });
    set_your_borrowed_list(your_borrowed_list);
  }
  function showRepayModal(asset: IAsset) {
    setShowModalBox(true);
    setModalData({
      action: 'repay',
      asset,
    });
  }
  return (
    <div className="border-b-2 border-burrowTableBorderColor pb-5 xsm:border-none">
      <div className="text-lg gotham_bold text-white pl-7 mb-4 xsm:pl-0 xsm:text-base">
        <FormattedMessage id="YouBorrowed" />
      </div>
      {your_borrowed_list.length == 0 && accountId ? (
        <div className="text-sm text-primaryText flex items-center justify-center py-6">
          <FormattedMessage id="NoBorrowTip"></FormattedMessage>
        </div>
      ) : null}
      {your_borrowed_list.length > 0 ? (
        <>
          {is_mobile ? (
            <>{your_borrowed_list}</>
          ) : (
            <table className="burrow_table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>
                    <FormattedMessage id="assets" />
                  </th>
                  <th style={{ width: '20%' }}>
                    <FormattedMessage id="BorrowAPY" />
                  </th>
                  <th style={{ width: '23%' }}>
                    <FormattedMessage id="Rewards" />
                  </th>
                  <th style={{ width: '15%' }}>
                    <FormattedMessage id="Borrowed" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{your_borrowed_list}</tbody>
            </table>
          )}
        </>
      ) : null}

      {showModalBox && (
        <ModalBox
          showModalBox={showModalBox}
          setShowModalBox={setShowModalBox}
          modalData={modalData}
        ></ModalBox>
      )}
      {!accountId ? (
        <div style={{ width: '220px', margin: '0 auto' }}>
          <ConnectToNearBtn></ConnectToNearBtn>
        </div>
      ) : null}
    </div>
  );
}
