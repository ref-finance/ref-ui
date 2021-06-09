import React from 'react';
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
      <div className="relative h-screen">
        <BgShapeLeftBottom />
        <BgShapeTopRight />
        <NavigationBar />
        <Switch>
          <Route path="/deposit/:id?" component={autoHeight(DepositPage)} />
          <Route path="/account" component={autoHeight(AccountPage)} />
          <Route path="/pool/:id" component={autoHeight(PoolDetailsPage)} />
          <Route path="/adboard" component={autoHeight(AdboardPage)} />
          <Route path="/pools/add" component={autoHeight(AddPoolPage)} />
          <Route path="/pools/add-token" component={autoHeight(AddTokenPage)} />
          <Route
            path="/pools/yours"
            component={autoHeight(YourLiquidityPage)}
          />
          <Route path="/pools" component={autoHeight(LiquidityPage)} />
          <Route path="/" component={autoHeight(SwapPage)} />
        </Switch>
      </div>
    </Router>
  );
}

function autoHeight(Comp: any) {
  return (props: any) => {
    return (
      <div className="flex flex-col justify-center h-4/5 relative z-10">
        <Comp {...props} />
      </div>
    );
  };
}

export default App;
