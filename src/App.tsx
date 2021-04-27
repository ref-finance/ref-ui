import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import DepositPage from './pages/DepositPage';
import WhitelistTokenPage from './pages/WhitelistTokenPage';
import PoolsPage from './pages/PoolsPage';
import PoolPage from './pages/PoolPage';
import AddPoolPage from './pages/AddPoolPage';
import SwapPage from './pages/SwapPage';
import { AccountPage } from './pages/AccountPage';
import NavigationBar from './components/layout/NavigationBar';
import { BgShapeLeftBottom } from './components/icon';
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
      <div className="h-screen">
        <BgShapeLeftBottom />
        <NavigationBar />
        <div className="flex flex-col justify-center h-4/5 ">
          <Switch>
            <Route path="/deposit" component={DepositPage} />
            <Route path="/account" component={AccountPage} />
            <Route path="/whitelist/:tokenId" component={WhitelistTokenPage} />
            <Route path="/pools/add" component={AddPoolPage} />
            <Route path="/pools/:poolId" component={PoolPage} />
            <Route path="/pools" component={PoolsPage} />
            <Route path="/" component={SwapPage} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;