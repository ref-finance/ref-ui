import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavigationBar from '~components/layout/NavigationBar';
import '~global.css';
import PoolsPage from '~pages/PoolsPage';
import PoolPage from '~pages/PoolPage';
import SwapPage from '~pages/SwapPage';
import PortfolioPage from '~pages/PortfolioPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-600 min-h-screen ">
        <NavigationBar />
          <div>
            <Switch>
              <Route path="/portfolio">
                <PortfolioPage />
              </Route>
              <Route path="/pools/:poolId">
                <PoolPage />
              </Route>
              <Route path="/pools">
                <PoolsPage />
              </Route>
              <Route path="/">
                <SwapPage />
              </Route>
            </Switch>
          </div>
      </div>
    </Router>
  );
}

export default App;
