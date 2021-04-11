import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import PortfolioPage from './pages/PortfolioPage';
import WhitelistTokenPage from './pages/WhitelistTokenPage';
import PoolsPage from './pages/PoolsPage';
import PoolPage from './pages/PoolPage';
import AddPoolPage from './pages/AddPoolPage';
import SwapPage from './pages/SwapPage';
import NavigationBar from './components/layout/NavigationBar';
import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import AdboardPage from './pages/Adboard/AdboardPage';
import { RecoilRoot } from 'recoil';

function App() {
  return (
    <Router>
      <ToastContainer />
      <div className="h-screen">
        <NavigationBar />
        <div className="flex flex-col justify-center h-4/5 ">
          <RecoilRoot>
            <Switch>
              <Route path="/portfolio" component={PortfolioPage} />
              <Route path="/whitelist/:tokenId" component={WhitelistTokenPage} />
              <Route path="/pools/add" component={AddPoolPage} />
              <Route path="/pools/:poolId" component={PoolPage} />
              <Route path="/pools" component={PoolsPage} />
              <Route path="/adboard" component={AdboardPage} />
              <Route path="/" component={SwapPage} />
            </Switch>
          </RecoilRoot>
        </div>
      </div>
    </Router>
  );
}

export default App;
