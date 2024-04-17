import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import Loading from 'src/components/layout/Loading';

const ReferendumPage = lazy(
  () =>
    import(/* webpackChunkName: "ReferendumPage" */ 'src/pages/ReferendumPage')
);

import { InjectedWallet } from '@near-wallet-selector/core';
import { providers } from 'near-api-js';
import { AccountView } from 'near-api-js/lib/providers/provider';
import Modal from 'react-modal';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import OrderlyContextProvider from 'src/pages/Orderly/orderly/OrderlyContext';
import { isMobile } from 'src/utils/device';

import NavigationBar from './components/layout/NavigationBar';
import { useWalletSelector } from './context/WalletSelectorContext';
import { ORDERLY_ASSET_MANAGER } from './pages/Orderly/near';
import {
  generateTradingKeyPair,
  get_orderly_public_key_path,
} from './pages/Orderly/orderly/utils';
import routes from './routes';
import getConfig from './services/config';
import { REF_FARM_BOOST_CONTRACT_ID } from './services/near';
import { useGlobalPopUp } from './state/popUp';
import { globalStateReducer, WalletContext } from './utils/wallets-integration';

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

  const { selector, accountId } = useWalletSelector();

  const getAccount = useCallback(async (): Promise<Account | null> => {
    if (!accountId) {
      return;
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
      return;
    }

    getAccount()
      .then(async () => {
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
      .catch(async () => {
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
      !window?.sender?.near ||
      selector?.store?.getState()?.selectedWalletId !== 'sender'
    )
      return;
    window?.sender?.near?.on('accountChanged', async (changedAccountId) => {
      // const senderModule = selector.store
      //   .getState()
      //   .modules.find((m) => m.id === 'sender');

      // const senderWallet = (await senderModule.wallet()) as InjectedWallet;

      // await senderWallet.signIn({
      //   contractId: ORDERLY_ASSET_MANAGER,
      // });
      if (accountId !== changedAccountId) {
        window.location.reload();
      }
    });
  }, [window?.sender, accountId]);

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
            {!!getConfig().REF_VE_CONTRACT_ID ? (
              <Route
                path="/referendum"
                component={AutoHeight(ReferendumPage)}
              />
            ) : null}

            {routes.map((route) => {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  component={Wrapper(route.element, route.wrapper)}
                  exact={route.exact}
                />
              );
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
    return AutoHeight(Comp);
  }
  if (wrapper === 'AutoHeightNoOffset') {
    return AutoHeightNoOffset(Comp);
  }
  return function Wrap(props: any) {
    return <Comp {...props} />;
  };
}

function AutoHeight(Comp: any) {
  return function Wrap(props: any) {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-12 relative xs:pb-14">
        <Comp {...props} />
      </div>
    );
  };
}

function AutoHeightNoOffset(Comp: any) {
  return function Wrap(props: any) {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 relative lg:mt-9 xs:pb-14">
        <Comp {...props} />
      </div>
    );
  };
}
