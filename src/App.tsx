import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import DepositPage from './pages/DepositPage';
import { PoolDetailsPage } from './pages/pools/DetailsPage';
import SwapPage from './pages/SwapPage';
import { AccountPage } from './pages/AccountPage';
import { RecentActivityPage } from './pages/RecentActivityPage';
import { LiquidityPage } from './pages/pools/LiquidityPage';
import { YourLiquidityPage } from './pages/pools/YourLiquidityPage';
import { AddPoolPage } from './pages/pools/AddPoolPage';
import { AddTokenPage } from './pages/pools/AddTokenPage';
import AdboardPage from './pages/Adboard/AdboardPage';
import NavigationBar from './components/layout/NavigationBar';
import Footer from './components/layout/Footer';
import { MorePoolsPage } from '~pages/pools/MorePoolsPage';
import StableSwapPage from './pages/stable/StableSwapPage';
import XrefPage from './pages/xref/XrefPage';
import RiskPage from './pages/RiskPage';
import USNPage from './pages/USNPage';
import {
  auroraAddr,
  getAuroraPool,
  getErc20Addr,
  useAuroraTokens,
} from './services/aurora/aurora';
import {
  BgShapeLeftTop,
  BgShapeCenter,
  BgShapeCenterSmall,
} from './components/icon';
import Modal from 'react-modal';

import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import { FarmsPage } from '~pages/farms/FarmsPage';
import { AirdropPage } from '~pages/AirdropPage';
import PopUpSwiper from '~components/layout/PopUp';
import SwapGuide from '~components/layout/SwapGuide';
import { isMobile } from '~utils/device';
import {
  wallet as webWallet,
  REF_FARM_CONTRACT_ID,
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
  BTC_POOL_ID,
} from './services/near';
import {
  getSenderWallet,
  WALLET_TYPE,
  getCurrentWallet,
} from './utils/sender-wallet';
import {
  getURLInfo,
  failToast,
  usnBuyAndSellToast,
} from './components/layout/transactionTipPopUp';
import { StableSwapPageEntry } from '~pages/stable/StableSwapEntry';
import { senderSignedInToast } from '~components/layout/senderSignInPopUp';
import { getAllTriPools } from './services/aurora/aurora';

import {
  getSenderLoginRes,
  LOCK_INTERVAL,
  saveSenderLoginRes,
} from './utils/sender-wallet';
import {
  senderWallet,
  SENDER_WALLET_SIGNEDIN_STATE_KEY,
} from './utils/sender-wallet';

import {
  WalletContext,
  globalStateReducer,
  removeSenderLoginRes,
} from './utils/sender-wallet';
import StableSwapPageUSN from '~pages/stable/StableSwapPageUSN';
import { checkTransaction } from './services/swap';
import { swapToast } from './components/layout/transactionTipPopUp';
import { StableSwapRouter } from './pages/stable/StableSwapRouter';

Modal.defaultStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
  content: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -65%)',
  },
};

Modal.setAppElement('#root');

function App() {
  const GlobalStateReducer = useReducer(globalStateReducer, {
    isSignedIn: false,
  });

  const [globalState, globalStatedispatch] = GlobalStateReducer;

  const { txHash, pathname, errorType, signInErrorType } = getURLInfo();

  useEffect(() => {
    if (errorType) {
      failToast(txHash, errorType);

      // failing toast only once
      window.history.replaceState({}, '', window.location.origin + pathname);
    }
    if (signInErrorType) {
      senderSignedInToast(signInErrorType);
      removeSenderLoginRes();
      window.history.replaceState({}, '', window.location.origin + pathname);
    }
  }, [errorType, signInErrorType]);
  // for usn start
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash)
        .then((res: any) => {
          const slippageErrorPattern = /ERR_MIN_AMOUNT|slippage error/i;

          const isSlippageError = res.receipts_outcome.some((outcome: any) => {
            return slippageErrorPattern.test(
              outcome?.outcome?.status?.Failure?.ActionError?.kind
                ?.FunctionCallError?.ExecutionError
            );
          });
          const transaction = res.transaction;
          const methodName =
            transaction?.actions[0]?.['FunctionCall']?.method_name;
          return {
            isUSN: methodName == 'buy' || methodName == 'sell',
            isSlippageError,
            isNearWithdraw: methodName == 'near_withdraw',
            isNearDeposit: methodName == 'near_deposit',
          };
        })
        .then(({ isUSN, isSlippageError, isNearWithdraw, isNearDeposit }) => {
          if (isUSN || isNearWithdraw || isNearDeposit) {
            isUSN &&
              !isSlippageError &&
              !errorType &&
              usnBuyAndSellToast(txHash);
            (isNearWithdraw || isNearDeposit) &&
              !errorType &&
              swapToast(txHash);
            window.history.replaceState(
              {},
              '',
              window.location.origin + pathname
            );
          }
        });
    }
  }, [txHash, isSignedIn]);
  // for usn end

  useEffect(() => {
    if (webWallet.isSignedIn()) {
      globalStatedispatch({ type: 'signIn' });
    }
  }, [webWallet.isSignedIn()]);

  useEffect(() => {
    setTimeout(() => {
      if (window.near) {
        window.near.on('signIn', (res: any) => {
          if (
            getCurrentWallet().wallet_type === 'near-wallet' &&
            webWallet.isSignedIn()
          )
            return;
          saveSenderLoginRes();
          globalStatedispatch({ type: 'signIn' });
        });
        window.near.on('accountChanged', (changedAccountId: string) => {
          if (
            getCurrentWallet().wallet_type === 'near-wallet' &&
            webWallet.isSignedIn()
          )
            return;
          saveSenderLoginRes(changedAccountId);
          window.location.reload();
        });
        window.near.on('signOut', () => {
          if (getCurrentWallet().wallet_type === 'sender-wallet') {
            removeSenderLoginRes();
            globalStatedispatch({ type: 'signOut' });
          }
        });
      }

      if (
        window.near &&
        getSenderLoginRes() &&
        getCurrentWallet().wallet_type === 'sender-wallet' &&
        !signInErrorType
      ) {
        getSenderWallet(window)
          .requestSignIn(REF_FARM_CONTRACT_ID)
          .then((res: any) => {
            !res?.error && saveSenderLoginRes();
          });
      }
    }, 300);
  }, [window, window?.near]);

  return (
    <WalletContext.Provider value={{ globalState, globalStatedispatch }}>
      <Router>
        <div className="relative min-h-screen pb-24 overflow-x-hidden xs:flex xs:flex-col md:flex md:flex-col">
          <BgShapeLeftTop />
          <BgShapeCenter />
          <BgShapeCenterSmall />
          <NavigationBar />
          <ToastContainer
            style={{
              marginTop: isMobile() ? 'none' : '44px',
            }}
          />

          <Switch>
            <Route path="/account" component={AccountPage} />
            <Route path="/recent" component={RecentActivityPage} />
            <Route
              path="/more_pools/:tokenIds"
              component={AutoHeight(MorePoolsPage)}
            />
            <Route path="/pool/:id" component={AutoHeight(PoolDetailsPage)} />
            <Route path="/adboard" component={AutoHeight(AdboardPage)} />
            <Route path="/pools/add" component={AutoHeight(AddPoolPage)} />
            <Route
              path="/pools/add-token"
              component={AutoHeight(AddTokenPage)}
            />
            <Route
              path="/pools/yours"
              component={AutoHeight(YourLiquidityPage)}
            />
            <Route path="/pools" component={AutoHeight(LiquidityPage)} />
            <Route path="/airdrop" component={AutoHeight(AirdropPage)} />
            <Route path="/farms" component={AutoHeight(FarmsPage)} />
            <Route
              path={`/sauce/:id`}
              component={AutoHeight(StableSwapRouter)}
            />

            <Route path="/sauce" component={AutoHeight(StableSwapPageEntry)} />

            <Route path="/xref" component={AutoHeight(XrefPage)} />
            <Route path="/risks" component={AutoHeight(RiskPage)} />
            <Route path="/" component={AutoHeight(SwapPage)} />
          </Switch>
          <Footer />
          <PopUpSwiper></PopUpSwiper>
        </div>
      </Router>
    </WalletContext.Provider>
  );
}

// decorate any components with this HOC to display them as vertical-align middle
// use individual fn is needed since `h-4/5` is not a appropriate style rule for
// any components
function AutoHeight(Comp: any) {
  return (props: any) => {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-12 relative">
        <Comp {...props} />
      </div>
    );
  };
}

export default App;
