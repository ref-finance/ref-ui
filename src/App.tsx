import "regenerator-runtime/runtime";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import NavigationBar from "./components/layout/NavigationBar";
// import { login, logout } from "./utils";
import "./global.css";
import HomePage from "~pages/PortfolioPage";
import SwapPage from "~pages/SwapPage";
import LiquidityPage from "~pages/LiquidityPage";
import LiquidityTokenPage from "~pages/LiquidityTokenPage";

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
            <Route path="/liquidity/:tokenId">
              <LiquidityTokenPage />
            </Route>
            <Route path="/liquidity">
              <LiquidityPage />
            </Route>
            <Route path="/">
              <HomePage />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
