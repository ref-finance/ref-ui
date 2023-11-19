import './index.css';

import React from 'react';

import BridgeFormProvider from './providers/bridgeForm';
import RouterViewProvider, {
  useRouterViewContext,
} from './providers/routerView';
import TokenSelectorProvider from './providers/selectToken';
import {
  WalletConnectNearProvider,
  WalletConnectProvider,
} from './providers/walletConcent';
import BridgeEntry from './views/entry';
import BridgeTransactionHistory from './views/history';

function Layout() {
  const { routerView } = useRouterViewContext();
  return routerView === 'entry' ? (
    <BridgeEntry />
  ) : (
    <BridgeTransactionHistory />
  );
}

function BridgePage() {
  return (
    <div className="bridge-page">
      <RouterViewProvider>
        <WalletConnectProvider>
          <WalletConnectNearProvider>
            <TokenSelectorProvider>
              <BridgeFormProvider>
                <Layout />
              </BridgeFormProvider>
            </TokenSelectorProvider>
          </WalletConnectNearProvider>
        </WalletConnectProvider>
      </RouterViewProvider>
    </div>
  );
}

export default BridgePage;
