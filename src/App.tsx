import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Footer from './components/layout/Footer';

import './global.css';
import 'react-toastify/dist/ReactToastify.css';
import './app.css';
import Guider from 'src/components/layout/Guider';

import { WalletSelectorContextProvider } from './context/WalletSelectorContext';

import Content from 'src/Content';
import { LedgerTransactionModal } from './context/modal-ui/modal';
import {
  ModalTransactionSubmitting,
  ToastTransaction,
} from 'src/components/transaction/modalTransactionSubmitting';

import { ModalGAPrivacy } from 'src/context/modal-ui/modalGAPrivacy/modalGAPrivacy';

function App() {
  return (
    <Router>
      <WalletSelectorContextProvider>
        <div className="page-container relative min-h-screen pb-24 lg:overflow-x-hidden xs:flex xs:flex-col md:flex md:flex-col">
          <Content />

          <Footer />
          <Guider></Guider>
        </div>
      </WalletSelectorContextProvider>

      <LedgerTransactionModal />

      <ModalTransactionSubmitting />
      <ModalGAPrivacy />
    </Router>
  );
}

export default App;
