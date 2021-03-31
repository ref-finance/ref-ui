import 'regenerator-runtime/runtime';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavigationBar from '~components/layout/NavigationBar';
// import { login, logout } from "./utils";
import '~global.css';
import PoolsPage from '~pages/PoolsPage';
import PoolPage from '~pages/PoolPage';
import SwapPage from '~pages/SwapPage';
import PortfolioPage from '~pages/PortfolioPage';

// import getConfig from "./config";
// const { networkId } = getConfig(process.env.NODE_ENV || "development");

function App() {
  return (
    <Router>
      <div className="min-h-screen ">
        <NavigationBar />
        <main className="min-h-screen p-4  lg:pl-8 lg:ml-80  pb-32 lg:pb-0  flex-grow">
          <Switch>
            <Route path="/swap">
              <SwapPage />
            </Route>
            <Route path="/pools/:poolId">
              <PoolPage />
            </Route>
            <Route path="/pools">
              <PoolsPage />
            </Route>
            <Route path="/">
              <PortfolioPage />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
