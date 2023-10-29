import React, { useState, createContext, useEffect, useContext } from 'react';
import { TokenMetadata } from 'src/services/ft-contract';
import { isMobile } from 'src/utils/device';
import Navigation, {
  NavigationMobile,
} from '../components/portfolio/Navigation';
import Overview from '../components/burrow/Overview';
import TableBox from '../components/burrow/TableBox';
import {
  getAssets,
  getAccount,
  getRewards,
  getFarm,
  getGlobalConfig,
} from 'src/services/burrow';
import {
  IAsset,
  IAccount,
  IAssetRewardDetail,
  INetTvlFarm,
  IBurrowConfig,
} from 'src/services/burrow-interfaces';
import { ftGetNearBalance } from 'src/services/near';
import { WalletContext } from '../utils/wallets-integration';
import { toReadableNumber } from 'src/utils/numbers';
import { FormattedMessage, useIntl } from 'react-intl';
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
  const [nearBalance, setNearBalance] = useState<string>();
  useEffect(() => {
    if (isSignedIn) {
      getAccount().then((account: IAccount) => {
        setAccount(account);
      });
      ftGetNearBalance().then((available) => {
        setNearBalance(toReadableNumber(24, available || '0'));
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
        nearBalance,
      }}
    >
      {is_mobile ? <BurrowMobile></BurrowMobile> : <BurrowPc></BurrowPc>}
    </BurrowData.Provider>
  );
}
function BurrowPc() {
  return (
    <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
      {/* Navigation */}
      <div style={{ width: '280px' }} className="pl-5 py-4 pr-4 flex-shrink-0">
        <Navigation></Navigation>
      </div>
      {/* content */}
      <div className="flex-grow border-l border-r border-boxBorder px-5 pt-9">
        <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
          <Overview></Overview>
          <TableBox></TableBox>
        </div>
      </div>
    </div>
  );
}

function BurrowMobile() {
  const [activeTab, setActiveTab] = useState<string>('supply');
  return (
    <>
      <div className="px-4">
        <Overview></Overview>
        <div className="flex items-center justify-between mt-10 mb-5 gap-2">
          <span
            onClick={() => {
              setActiveTab('supply');
            }}
            className={`flex items-center justify-center h-10 rounded-md text-sm gotham_bold w-1/2 ${
              activeTab == 'supply'
                ? 'bg-senderHot text-burrowDarkColor'
                : 'bg-white bg-opacity-20 text-primaryText'
            }`}
          >
            <FormattedMessage id="Supply" />
          </span>
          <span
            onClick={() => {
              setActiveTab('borrow');
            }}
            className={`flex items-center justify-center h-10 rounded-md text-sm gotham_bold w-1/2 ${
              activeTab == 'borrow'
                ? 'bg-burrowPurpleColor text-burrowDarkColor'
                : 'bg-white bg-opacity-20 text-primaryText'
            }`}
          >
            <FormattedMessage id="Borrow" />
          </span>
        </div>
        <TableBox activeTab={activeTab}></TableBox>
      </div>
      <NavigationMobile></NavigationMobile>
    </>
  );
}

export default Burrow;
