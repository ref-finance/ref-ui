import React, { useState, createContext, useEffect, useContext } from 'react';
import { TokenMetadata } from '~services/ft-contract';
import { isMobile } from '~utils/device';
import Navigation from '../components/portfolio/Navigation';
import Overview from '../components/burrow/Overview';
import TableBox from '../components/burrow/TableBox';
import {
  getAssets,
  getAccount,
  getRewards,
  getFarm,
  getGlobalConfig,
} from '~services/burrow';
import {
  IAsset,
  IAccount,
  IAssetRewardDetail,
  INetTvlFarm,
  IBurrowConfig,
} from '~services/burrow-interfaces';
import { WalletContext } from '../utils/wallets-integration';
const is_mobile = isMobile();
export const BurrowData = createContext(null);
function Burrow() {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [account, setAccount] = useState<IAccount>();
  const [assets, setAssets] = useState<IAsset[]>();
  const [assetMetadatas, setAssetMetadatas] =
    useState<Record<string, TokenMetadata>>();
  const [rewards, setRewards] = useState<IAssetRewardDetail[]>();
  const [netTvlFarm, setNetTvlFarm] = useState<INetTvlFarm>();
  const [globalConfig, setGlobalConfig] = useState<IBurrowConfig>();
  useEffect(() => {
    if (isSignedIn) {
      getAccount().then((account: IAccount) => {
        setAccount(account);
      });
    }
    getAssets().then((assets: IAsset[]) => {
      setAssets(assets);
    });
  }, [isSignedIn]);
  useEffect(() => {
    getFarm('NetTvl').then((farm: INetTvlFarm) => {
      setNetTvlFarm(farm);
    });
    getGlobalConfig().then((globalConfig: IBurrowConfig) => {
      setGlobalConfig(globalConfig);
    });
  }, []);
  useEffect(() => {
    if (assets) {
      const metadatas = assets.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.token_id]: cur.metadata,
        };
      }, {});
      setAssetMetadatas(metadatas);
      getRewards(account, assets).then((rewards: IAssetRewardDetail[]) => {
        setRewards(rewards);
      });
      console.log('metadatas', metadatas);
    }
  }, [account, assets]);
  return (
    <BurrowData.Provider
      value={{
        account,
        assets,
        rewards,
        assetMetadatas,
        netTvlFarm,
        globalConfig,
      }}
    >
      <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
        {/* Navigation */}
        <div
          style={{ width: '280px' }}
          className="pl-5 py-4 pr-4 flex-shrink-0"
        >
          <Navigation></Navigation>
        </div>
        {/* content */}
        <div className="flex-grow border-l border-r border-boxBorder pl-5 pt-9">
          <div className="w-1000px">
            <Overview></Overview>
            <TableBox></TableBox>
          </div>
        </div>
      </div>
    </BurrowData.Provider>
  );
}

export default Burrow;
