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
import { getSenderWallet, getCurrentWallet } from './utils/wallets-integration';
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
} from './utils/wallets-integration';
import {
  senderWallet,
  SENDER_WALLET_SIGNEDIN_STATE_KEY,
} from './utils/wallets-integration';

import {
  WalletContext,
  globalStateReducer,
  removeSenderLoginRes,
} from './utils/wallets-integration';
import StableSwapPageUSN from '~pages/stable/StableSwapPageUSN';
import { checkTransaction } from './services/swap';
import {
  swapToast,
  getErrorMessage,
} from './components/layout/transactionTipPopUp';
import { StableSwapRouter } from './pages/stable/StableSwapRouter';
import {
  WalletSelectorContextProvider,
  useWalletSelector,
} from './context/WalletSelectorContext';

import { Content } from '~Content';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen pb-24 overflow-x-hidden xs:flex xs:flex-col md:flex md:flex-col">
        <BgShapeLeftTop />
        <BgShapeCenterSmall />

        <WalletSelectorContextProvider>
          <Content />
        </WalletSelectorContextProvider>

        <Footer />
        <PopUpSwiper></PopUpSwiper>
      </div>
    </Router>
  );
}

export default App;
