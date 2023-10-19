import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  lazy,
  Suspense,
} from 'react';
import Loading, { BeatLoading } from 'src/components/layout/Loading';

import { ReferendumPage } from 'src/pages/ReferendumPage';

import YourLiquidityPageV3 from './pages/poolsV3/YourLiquidityPageV3';
import AddYourLiquidityPageV3 from './pages/poolsV3/AddYourLiquidityPageV3';
import YourLiquidityDetailV3 from './pages/poolsV3/YourLiquidityDetailV3';
import MyOrderPage from 'src/pages/MyOrder';

import {
  Switch,
  Route,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PoolDetailsPage } from './pages/pools/DetailsPage';

import { RecentActivityPage } from './pages/RecentActivityPage';
import { AddTokenPage } from './pages/pools/AddTokenPage';
import NavigationBar from './components/layout/NavigationBar';
import { MorePoolsPage } from 'src/pages/pools/MorePoolsPage';

import Modal from 'react-modal';

import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import { FarmsPage } from 'src/pages/farms/FarmsPage';
import { AirdropPage } from 'src/pages/AirdropPage';

import { isMobile } from 'src/utils/device';


import {
  WalletContext,
  globalStateReducer,
  removeSenderLoginRes,
} from './utils/wallets-integration';

import { StableSwapRouter } from './pages/stable/StableSwapRouter';

import { useGlobalPopUp } from './state/popUp';
import { providers } from 'near-api-js';
import {
  ACCOUNT_ID_KEY,
  useWalletSelector,
} from './context/WalletSelectorContext';
import getConfig from './services/config';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { InjectedWallet } from '@near-wallet-selector/core';
import { REF_FARM_BOOST_CONTRACT_ID, wallet } from './services/near';
import { LedgerTransactionModal } from './context/modal-ui/modal';

import OrderlyContextProvider, {
  OrderlyContext,
} from 'src/pages/Orderly/orderly/OrderlyContext';
import { list_seeds_info } from './services/farm';
import { ORDERLY_ASSET_MANAGER } from './pages/Orderly/near';
import {
  get_orderly_public_key_path,
  generateTradingKeyPair,
} from './pages/Orderly/orderly/utils';
import navs from './navs';

export type Account = AccountView & {
  account_id: string;
};

Modal.defaultStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
    outline: 'none',
  },
  content: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -65%)',
    outline: 'none',
  },
};

Modal.setAppElement('#root');

export function Content() {
  const GlobalStateReducer = useReducer(globalStateReducer, {
    isSignedIn: false,
  });
  const [globalState, globalStatedispatch] = GlobalStateReducer;

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return null;
    }

    const provider = new providers.JsonRpcProvider({
      url: getConfig().nodeUrl,
    });

    return provider
      .query<AccountView>({
        request_type: 'view_account',
        finality: 'final',
        account_id: accountId,
      })
      .then((data: any) => ({
        ...data,
        account_id: accountId,
      }));
  }, [accountId]);

  useEffect(() => {
    if (!accountId) {
      return null;
    }

    getAccount()
      .then(async (res) => {
        if ((await selector.wallet()).id === 'sender') {
          ((await selector.wallet()) as InjectedWallet)
            .signIn({
              contractId: REF_FARM_BOOST_CONTRACT_ID,
            })
            .then(() => {
              globalStatedispatch({ type: 'signIn' });
            });
        } else {
          globalStatedispatch({ type: 'signIn' });
        }
      })
      .catch(async (e) => {
        alert(
          `Account ID: ${accountId} has not been found. Please transfer some NEAR to this account and try again.`
        );
        const wallet = await selector.wallet();
        await wallet.signOut();

        window.location.reload();
      });
  }, [accountId, getAccount]);

  useEffect(() => {
    if (
      !window?.near?.isSender ||
      selector?.store?.getState()?.selectedWalletId !== 'sender'
    )
      return;

    window.near.on('accountChanged', async (changedAccountId: string) => {
      const senderModule = selector.store
        .getState()
        .modules.find((m) => m.id === 'sender');

      const senderWallet = (await senderModule.wallet()) as InjectedWallet;

      await senderWallet.signIn({
        contractId: ORDERLY_ASSET_MANAGER,
      });

      window.location.reload();
    });
  }, [window.near]);

  useGlobalPopUp(globalState);

  React.useEffect(() => {
    const pubkey = localStorage.getItem(get_orderly_public_key_path());

    if (!pubkey && accountId) {
      generateTradingKeyPair();
    }
  }, [accountId]);

  if (isMobile()) {
    document.body.style.setProperty('overflow-x', 'hidden');
    document.documentElement.style.setProperty('overflow-x', 'hidden');
  }

  return (
    <WalletContext.Provider value={{ globalState, globalStatedispatch }}>
      <NavigationBar />
      <ToastContainer
        newestOnTop={
          window.location.pathname.startsWith('/orderbook') ? true : false
        }
        style={{
          marginTop: isMobile() ? 'none' : '44px',
        }}
      />
      <OrderlyContextProvider>
        <Suspense fallback={<Loading />}>
          <Switch>
            


            <Route path="/recent" component={RecentActivityPage} />
            <Route
              path="/more_pools/:tokenIds"
              component={AutoHeight(MorePoolsPage)}
            />
            <Route path="/pool/:id" component={AutoHeight(PoolDetailsPage)} />
            <Route path="/pools/add-token" component={AutoHeight(AddTokenPage)} />
            <Route path="/airdrop" component={AutoHeight(AirdropPage)} />
            <Route path="/farms" component={AutoHeight(FarmsPage)} />
            <Route path={`/sauce/:id`} component={AutoHeight(StableSwapRouter)} />
            <Route path={'/myOrder'} component={AutoHeight(MyOrderPage)} />

            <Route
              path="/yourliquidity"
              component={AutoHeight(YourLiquidityPageV3)}
            />
            <Route
              path="/yoursLiquidityDetailV2/:id/:status?"
              component={AutoHeight(YourLiquidityDetailV3)}
            />

            <Route
              path="/addLiquidityV2"
              component={AutoHeight(AddYourLiquidityPageV3)}
            />


            
            {!!getConfig().REF_VE_CONTRACT_ID ? (
              <Route path="/referendum" component={AutoHeight(ReferendumPage)} />
            ) : null}

           

            {navs.map(nav => {
              return <Route
                key={nav.path}
                path={nav.path}
                component={Wrapper(nav.element, nav.wrapper)}
              />
            })}
            
          </Switch>
        </Suspense>
      </OrderlyContextProvider>
    </WalletContext.Provider>
  );
}

// decorate any components with this HOC to display them as vertical-align middle
// use individual fn is needed since `h-4/5` is not a appropriate style rule for
// any components
function Wrapper(Comp: any, wrapper: 'AutoHeight' | 'AutoHeightNoOffset' | '') {
  if (wrapper === 'AutoHeight') {
    return AutoHeight(Comp)
  }
  if (wrapper === 'AutoHeightNoOffset') {
    return AutoHeightNoOffset(Comp)
  }
  return (props: any) => {
    return (
      <Comp {...props} />
    );
  };
}

function AutoHeight(Comp: any) {
  return (props: any) => {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-12 relative xs:pb-14">
        <Comp {...props} />
      </div>
    );
  };
}

function AutoHeightNoOffset(Comp: any) {
  return (props: any) => {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 relative lg:mt-9 xs:pb-14">
        <Comp {...props} />
      </div>
    );
  };
}
