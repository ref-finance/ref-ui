import React, { useEffect, useState, useContext } from 'react';
import { BurrowData } from '../../pages/Burrow';
import { PurpleLineButton } from './burrow-button';
import {
  IAccount,
  IAsset,
  IAssetRewardDetail,
  IBurrowConfig,
  IModalProps,
} from '~services/burrow-interfaces';
import { getExtraApy, getPortfolioRewards } from '~services/burrow-business';
import Big from 'big.js';
import {
  shrinkToken,
  toAPY,
  formatNumber,
  formatWithCommas_usd,
} from '~services/burrow-utils';
import ModalBox from './ModalBox';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { ConnectToNearBtn } from '~components/button/Button';
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
            {rewardsList.length == 0
              ? '-'
              : rewardsList.map((reward, index) => {
                  const { rewardPerDay, rewardAsset } = reward;
                  return (
                    <div
                      className="flex items-center"
                      title={Big(rewardPerDay || 0).toFixed()}
                    >
                      {formatNumber(Big(rewardPerDay || 0).toFixed())}
                      <img
                        className={`w-4 h-4 rounded-full ml-1.5`}
                        src={rewardAsset.metadata.icon}
                      />
                    </div>
                  );
                })}
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
                Repay
              </PurpleLineButton>
            </div>
          </td>
        </tr>
      );
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
    <div className="border-b-2 border-burrowTableBorderColor pb-5">
      <div className="text-lg gotham_bold text-white pl-7 mb-4">
        You Borrowed
      </div>
      {your_borrowed_list.length == 0 && accountId ? (
        <div className="text-sm text-primaryText flex items-center justify-center py-6">
          Your borrowed asset will apear here..
        </div>
      ) : null}
      {your_borrowed_list.length > 0 ? (
        <table className="burrow_table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Assets</th>
              <th style={{ width: '20%' }}>Borrow APY</th>
              <th style={{ width: '23%' }}>Rewards</th>
              <th style={{ width: '15%' }}>Borrowed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{your_borrowed_list}</tbody>
        </table>
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
