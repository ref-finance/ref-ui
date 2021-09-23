import React, { useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import DepositPage from './pages/DepositPage';
import { PoolDetailsPage } from './pages/pools/DetailsPage';
import SwapPage from './pages/SwapPage';
import { AccountPage } from './pages/AccountPage';
import { LiquidityPage } from './pages/pools/LiquidityPage';
import { YourLiquidityPage } from './pages/pools/YourLiquidityPage';
import { AddPoolPage } from './pages/pools/AddPoolPage';
import { AddTokenPage } from './pages/pools/AddTokenPage';
import AdboardPage from './pages/Adboard/AdboardPage';
import NavigationBar from './components/layout/NavigationBar';
import { BgShapeLeftBottom, BgShapeTopRight } from './components/icon';
import Modal from 'react-modal';

import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import { FarmsPage } from '~pages/farms/FarmsPage';
import { AirdropPage } from '~pages/AirdropPage';
import { Context } from '~components/wrapper';
import { isMobile } from '~utils/device';

Modal.defaultStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  return (
    <Router>
      <ToastContainer />
      <div className="relative min-h-screen pb-12 xs:flex xs:flex-col md:flex md:flex-col">
        <BgShapeLeftBottom />
        <BgShapeTopRight />
        <NavigationBar />
        {langSwitcher()}
        <Switch>
          <Route path="/deposit/:id?" component={AutoHeight(DepositPage)} />
          <Route path="/account" component={AccountPage} />
          <Route path="/pool/:id" component={AutoHeight(PoolDetailsPage)} />
          <Route path="/adboard" component={AutoHeight(AdboardPage)} />
          <Route path="/pools/add" component={AutoHeight(AddPoolPage)} />
          <Route path="/pools/add-token" component={AutoHeight(AddTokenPage)} />
          <Route
            path="/pools/yours"
            component={AutoHeight(YourLiquidityPage)}
          />
          <Route path="/pools" component={AutoHeight(LiquidityPage)} />
          <Route path="/airdrop" component={AutoHeight(AirdropPage)} />
          <Route path="/farms" component={AutoHeight(FarmsPage)} />
          <Route path="/" component={AutoHeight(SwapPage)} />
        </Switch>
      </div>
    </Router>
  );
}

// decorate any components with this HOC to display them as vertical-align middle
// use individual fn is needed since `h-4/5` is not a appropriate style rule for
// any components
function AutoHeight(Comp: any) {
  return (props: any) => {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-24 relative">
        <Comp {...props} />
      </div>
    );
  };
}

function langSwitcher() {
  const context = useContext(Context);

  return isMobile() ? (
    <div
      className="inline-flex relative"
      style={{
        margin: '-3rem auto 3rem',
        zIndex: 100,
      }}
    >
      <svg
        className="w-2 h-2 absolute top-0 right-0 m-2 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 412 232"
      >
        <path
          d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
          fill="#648299"
          fillRule="nonzero"
        />
      </svg>
      <select
        className="border border-gray-300 rounded-full text-gray-600 h-6 pl-5 pr-7 bg-white hover:border-gray-400 focus:outline-none appearance-none text-xs"
        value={context.locale}
        onChange={context.selectLanguage}
      >
        <option value="en">English</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>
  ) : (
    <div className="inline-flex relative float-right -mt-9 mr-8">
      <svg
        className="w-2 h-1 absolute top-0 right-0 m-2 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 412 232"
      >
        <path
          d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
          fill="#648299"
          fillRule="nonzero"
        />
      </svg>
      <select
        className="border border-gray-300 rounded-full text-gray-600 h-5 pl-5 pr-7 bg-white hover:border-gray-400 focus:outline-none appearance-none text-xs"
        value={context.locale}
        onChange={context.selectLanguage}
      >
        <option value="en">English</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>
  );
}
export default App;
