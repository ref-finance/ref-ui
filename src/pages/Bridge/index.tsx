import './index.css';

import React from 'react';

import BridgeFormProvider from './providers/bridgeForm';
import {
  WalletConnectNearProvider,
  WalletConnectProvider,
} from './providers/walletConcent';
import BridgeEntry from './views/entry';
import BridgeTransactionHistory from './views/history';
import { Route, Switch } from 'react-router-dom';
import BridgeTransactionProvider from './providers/bridgeTransaction';

function Layout() {
  return (
    <Switch>
      <Route path="/bridge" exact>
        <BridgeEntry />
      </Route>
      <Route path="/bridge/history">
        <BridgeTransactionHistory />
      </Route>
    </Switch>
  );
}

function BridgePage() {
  return (
    <div className="bridge-page">
      <WalletConnectProvider>
        <BridgeTransactionProvider>
          <BridgeFormProvider>
            <Layout />
          </BridgeFormProvider>
        </BridgeTransactionProvider>
      </WalletConnectProvider>
    </div>
  );
}

export default BridgePage;
