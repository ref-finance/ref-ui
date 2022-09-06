import React from 'react';
import ReactDOM from 'react-dom';
import type { WalletSelector } from '@near-wallet-selector/core';

import type { WalletSelectorModal, ModalOptions } from './modal.types';
import { Modal } from './components/Modal';
import { FormattedMessage, IntlProvider } from 'react-intl';
import Wrapper from '../../components/wrapper';
import { CloseButton } from './components/CloseButton';
import { LedgerTransaction } from '../../components/icon/Wallet';

const MODAL_ELEMENT_ID = 'near-wallet-selector-modal';

let modalInstance: WalletSelectorModal | null = null;

export const setupModal = (
  selector: WalletSelector,
  options: ModalOptions
): WalletSelectorModal => {
  const el = document.createElement('div');
  el.id = MODAL_ELEMENT_ID;
  document.body.appendChild(el);

  const render = (visible = false) => {
    ReactDOM.render(
      <Wrapper>
        <Modal
          selector={selector}
          options={options}
          visible={visible}
          hide={() => render(false)}
        />
      </Wrapper>,
      document.getElementById(MODAL_ELEMENT_ID)
    );
  };

  render();

  if (!modalInstance) {
    modalInstance = {
      show: () => {
        render(true);
      },
      hide: () => {
        render(false);
      },
    };
  }

  return modalInstance;
};

export const LedgerTransactionModal = () => {
  const handleClose = () => {
    const el = document.getElementsByClassName(
      'ledger-transaction-pop-up'
    )?.[0];
    el.setAttribute('style', 'display:none');
  };

  return (
    <div
      className=" ledger-transaction-pop-up"
      style={{
        zIndex: 999,
        display: 'none',
      }}
    >
      <div className="nws-modal-wrapper open">
        <div className="modal-overlay" onClick={handleClose} />
        <div
          className="modal"
          style={{
            background: '#1d2932',
            minWidth: '280px',
          }}
        >
          <div
            className="modal-header flex justify-end"
            style={{
              display: 'flex',
              justifyContent: 'end',
            }}
          >
            <CloseButton onClick={handleClose} />
          </div>
          <div className="modal-body">
            <div className="flex items-center justify-center my-7 mx-auto w-12">
              <LedgerTransaction />
            </div>

            <div className="flex flex-col items-center text-white mb-4">
              <div className="text-center text-sm">
                <FormattedMessage
                  id="please_confirm_this_transaction_on_ledger"
                  defaultMessage={'Please confirm this transaction on ledger.'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
