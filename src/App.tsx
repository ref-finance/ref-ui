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
        <div className="sm:flex sm:flex-col justify-center h-4/5 lg:mt-24 relative">
          <Switch>
            <Route path="/deposit/:id?" component={DepositPage} />
            <Route path="/account" component={AccountPage} />
            <Route path="/pool/:id" component={PoolDetailsPage} />
            <Route path="/adboard" component={AdboardPage} />
            <Route path="/pools/add" component={AddPoolPage} />
            <Route path="/pools/add-token" component={AddTokenPage} />
            <Route
              path="/pools/yours"
              component={YourLiquidityPage}
            />
            <Route path="/pools" component={LiquidityPage} />
            <Route path="/" component={SwapPage} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
