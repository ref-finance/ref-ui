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
  const context = useContext(Context);
  return (
    <Router>
      <ToastContainer />
      <div className="relative min-h-screen pb-12 xs:flex xs:flex-col md:flex md:flex-col">
        <BgShapeLeftBottom />
        <BgShapeTopRight />
        <NavigationBar />
        <select value={context.locale} onChange={context.selectLanguage}>
          <option value="en">English</option>
          <option value="zh-CN">中文版</option>
        </select>
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

export default App;
