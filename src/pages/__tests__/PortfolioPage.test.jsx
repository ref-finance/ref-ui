import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PortfolioPage from '../PortfolioPage';
import SpecialWallet from '../../services/SpecialWallet';
import { REF_FI_CONTRACT_ID } from '../../services/near';
import getConfig from '../../services/config';

describe('PortfolioPage', () => {
  it('deposits into portfolio without storage deposit', async () => {
    SpecialWallet.addView(REF_FI_CONTRACT_ID, 'storage_balance_of', {});
    render(
      <MemoryRouter>
        <PortfolioPage />
      </MemoryRouter>
    );

    const amount = await screen.findByPlaceholderText('0.0');
    fireEvent.change(amount, {
      target: { value: '10000000000' },
    });

    fireEvent.click(screen.getByText('NEAR'));
    fireEvent.click(screen.getAllByText('nDAI')[2]);

    const [, submitButton] = await screen.findAllByText('Deposit');
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect().toHaveTransaction(REF_FI_CONTRACT_ID, []);
      expect().toHaveTransaction('nDAI', [
        {
          methodName: 'ft_transfer_call',
          args: {
            amount: '10000000000000000',
            msg: '',
            receiver_id: REF_FI_CONTRACT_ID,
          },
          amount: '1',
          gas: '100000000000000',
        },
      ]);
    });
  });

  it('deposits into portfolio with storage deposit', async () => {
    SpecialWallet.addView(REF_FI_CONTRACT_ID, 'storage_balance_of', null);
    render(
      <MemoryRouter>
        <PortfolioPage />
      </MemoryRouter>
    );

    const amount = await screen.findByPlaceholderText('0.0');
    fireEvent.change(amount, {
      target: { value: '10000000000' },
    });

    fireEvent.click(screen.getByText('NEAR'));
    fireEvent.click(screen.getAllByText('nDAI')[2]);

    const [, submitButton] = await screen.findAllByText('Deposit');
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'storage_deposit',
          args: { account_id: 'test.near', registration_only: false },
          gas: '30000000000000',
          amount: '840000000000000000000',
        },
      ]);
      expect().toHaveTransaction('nDAI', [
        {
          methodName: 'ft_transfer_call',
          args: {
            amount: '10000000000000000',
            msg: '',
            receiver_id: REF_FI_CONTRACT_ID,
          },
          amount: '1',
          gas: '100000000000000',
        },
      ]);
    });
  });

  it('deposits NEAR into portfolio', async () => {
    render(
      <MemoryRouter>
        <PortfolioPage />
      </MemoryRouter>
    );

    const amount = await screen.findByPlaceholderText('0.0');
    fireEvent.change(amount, {
      target: { value: '10000000000' },
    });

    const [, submitButton] = await screen.findAllByText('Deposit');
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'storage_deposit',
          args: { account_id: 'test.near', registration_only: false },
          gas: '30000000000000',
          amount: '840000000000000000000',
        },
      ]);
      expect().toHaveTransaction('wrap.testnet', [
        {
          amount: '1250000000000000000000',
          args: {},
          gas: '30000000000000',
          methodName: 'storage_deposit',
        },
        {
          methodName: 'near_deposit',
          args: {},
          amount: '10000000000000000000000000000000000',
          gas: '30000000000000',
        },
        {
          methodName: 'ft_transfer_call',
          args: {
            amount: '10000000000000000000000000000000000',
            msg: '',
            receiver_id: REF_FI_CONTRACT_ID,
          },
          amount: '1',
          gas: '100000000000000',
        },
      ]);
    });
  });

  it('withdraws wNEAR into portfolio', async () => {
    render(
      <MemoryRouter>
        <PortfolioPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Withdraw'));

    const amount = await screen.findByPlaceholderText('0.0');
    fireEvent.change(amount, {
      target: { value: '10000000000' },
    });

    const [, submitButton] = await screen.findAllByText('Withdraw');
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'withdraw',
          args: {
            amount: '10000000000000000000000000000000000',
            token_id: 'wrap.testnet',
            unregister: false,
          },
          gas: '50000000000000',
          amount: '1',
        },
      ]);
      expect().toHaveTransaction(
        'wrap.testnet',
        [
          {
            amount: '1250000000000000000000',
            args: {},
            gas: '50000000000000',
            methodName: 'storage_deposit',
          },
        ],
        [
          {
            amount: '1',
            args: { amount: '10000000000000000000000000000000000' },
            gas: '30000000000000',
            methodName: 'near_withdraw',
          },
        ]
      );
    });
  });
});
