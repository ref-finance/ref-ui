import React from 'react';
import ReactDOM from 'react-dom';
import type { WalletSelector } from '@near-wallet-selector/core';

import type { WalletSelectorModal, ModalOptions } from './modal.types';
import { Modal } from './components/Modal';
import { IntlProvider } from 'react-intl';
import Wrapper from '~components/wrapper';

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
