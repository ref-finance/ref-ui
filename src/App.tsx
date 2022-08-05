import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory,
} from 'react-router-dom';

import Footer from './components/layout/Footer';

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
<<<<<<< HEAD
=======
import SwapGuide from '~components/layout/SwapGuide';
import { isMobile } from '~utils/device';
import {
  wallet as webWallet,
  REF_FARM_CONTRACT_ID,
  REF_FARM_BOOST_CONTRACT_ID,
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
import FarmsBoosterPage from './pages/farms/FarmsBoostPage';
import FarmsMigrate from './pages/farms/FarmsMigrate';

import {
  getSenderLoginRes,
  LOCK_INTERVAL,
  saveSenderLoginRes,
} from './utils/sender-wallet';
import {
  senderWallet,
  SENDER_WALLET_SIGNEDIN_STATE_KEY,
} from './utils/sender-wallet';
>>>>>>> main

import {
  WalletSelectorContextProvider,
  useWalletSelector,
} from './context/WalletSelectorContext';

import { Content } from '~Content';

function App() {
<<<<<<< HEAD
=======
  const GlobalStateReducer = useReducer(globalStateReducer, {
    isSignedIn: false,
  });

  const [globalState, globalStatedispatch] = GlobalStateReducer;

  const { txHash, pathname, errorType, signInErrorType, txHashes } =
    getURLInfo();
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res) => {
        let displayErrorMessage = errorType;
        const errorMessasge = getErrorMessage(res);

        if (errorMessasge) displayErrorMessage = errorMessasge;

        if (displayErrorMessage) {
          failToast(txHash, displayErrorMessage);

          window.history.replaceState(
            {},
            '',
            window.location.origin + pathname
          );
        }
      });
    }

    // failing toast only once
    if (signInErrorType) {
      senderSignedInToast(signInErrorType);
      removeSenderLoginRes();
      window.history.replaceState({}, '', window.location.origin + pathname);
    }
  }, [errorType, signInErrorType, isSignedIn]);
  // for usn start
  useEffect(() => {
    if (
      txHash &&
      isSignedIn &&
      pathname !== '/farms' &&
      pathname.indexOf('v2farms') === -1
    ) {
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
          const isUsn =
            sessionStorage.getItem('usn') == '1' &&
            (methodName == 'ft_transfer_call' || methodName == 'withdraw');
          sessionStorage.removeItem('usn');

          const fromWrapNear =
            sessionStorage.getItem(NEAR_WITHDRAW_KEY) === '1';

          sessionStorage.removeItem(NEAR_WITHDRAW_KEY);

          return {
            isUSN: isUsn,
            isSlippageError,
            isNearWithdraw:
              methodName == 'near_withdraw' &&
              txHashes.length === 1 &&
              fromWrapNear,
            isNearDeposit:
              methodName == 'near_deposit' && txHashes.length === 1,
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
    if (!txHash) {
      sessionStorage.removeItem('usn');
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
          .requestSignIn(REF_FARM_BOOST_CONTRACT_ID)
          .then((res: any) => {
            !res?.error && saveSenderLoginRes();
          });
      }
    }, 300);
  }, [window, window?.near]);

>>>>>>> main
  return (
    <Router>
      <div className="relative min-h-screen pb-24 overflow-x-hidden xs:flex xs:flex-col md:flex md:flex-col">
        <BgShapeLeftTop />
        <BgShapeCenterSmall />

        <WalletSelectorContextProvider>
          <Content />
        </WalletSelectorContextProvider>

<<<<<<< HEAD
        <Footer />
        <PopUpSwiper></PopUpSwiper>
=======
            <Route
              path="/v2farms/:id?"
              component={AutoHeight(FarmsBoosterPage)}
            />
            <Route path="/farmsMigrate" component={AutoHeight(FarmsMigrate)} />
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
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-6 relative">
        <Comp {...props} />
>>>>>>> main
      </div>
    </Router>
  );
}

export default App;
