import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Footer from './components/layout/Footer';

import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import './app.css';

import { WalletSelectorContextProvider } from './context/WalletSelectorContext';

import { Content } from 'src/Content';
import { LedgerTransactionModal } from './context/modal-ui/modal';
import { XmasActivityContextProvider } from './context/XmasActivity';
import { ModalGAPrivacy } from 'src/context/modal-ui/modalGAPrivacy/modalGAPrivacy';
import RpcList from 'src/components/rpc';
import PubTestModal from '../src/components/layout/PubTestModal';
function App() {
  return (
    <Router>
      <WalletSelectorContextProvider>
        <XmasActivityContextProvider>
          <div className="page-container relative min-h-screen pb-24 lg:overflow-x-hidden xs:flex xs:flex-col md:flex md:flex-col">
            <Content />

            <Footer />
          </div>
        </XmasActivityContextProvider>
      </WalletSelectorContextProvider>
      <RpcList />
      <LedgerTransactionModal />
      <ModalGAPrivacy />
      <PubTestModal />
    </Router>
  );
}

export default App;
