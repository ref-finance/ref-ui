import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPoolPage from '../AddPoolPage';
import { MemoryRouter } from 'react-router';
import { REF_FI_CONTRACT_ID } from '../../services/near';
import SpecialWallet from '../../services/SpecialWallet';
import { MIN_DEPOSIT_PER_TOKEN } from '../../services/creators/storage';

describe('AddPoolPage', () => {
  it('adds a pool with default 25 fee and pays ref.finance storage deposit for the token', async () => {
    render(
      <MemoryRouter>
        <AddPoolPage />
      </MemoryRouter>
    );

    const [firstToken, secondToken] = await screen.findAllByText(
      'select token'
    );
    fireEvent.click(firstToken);
    fireEvent.click((await screen.findAllByText('nDAI'))[0]);

    fireEvent.click(secondToken);
    fireEvent.click((await screen.findAllByText('nWETH'))[0]);

    const button = screen.getAllByText('Add Liquidity Pool');
    fireEvent.click(button[1]);

    return waitFor(() => {
      expect().toHaveTransaction('nDAI', [
        {
          methodName: 'storage_deposit',
          args: { account_id: REF_FI_CONTRACT_ID, registration_only: true },
          amount: '100000000000000000000000',
          gas: '30000000000000',
        },
      ]);

      expect().toHaveTransaction('nWETH', [
        {
          methodName: 'storage_deposit',
          args: { account_id: REF_FI_CONTRACT_ID, registration_only: true },
          amount: '100000000000000000000000',
          gas: '30000000000000',
        },
      ]);

      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'add_simple_pool',
          args: { tokens: ['nDAI', 'nWETH'], fee: 25 },
          amount: '50000000000000000000000',
          gas: '30000000000000',
        },
      ]);
    });
  });

  it('adds a pool and skips storage deposit for the token if already paid', async () => {
    SpecialWallet.addView('nWETH', 'storage_balance_of', {
      total: MIN_DEPOSIT_PER_TOKEN,
      available: '0',
    });

    render(
      <MemoryRouter>
        <AddPoolPage />
      </MemoryRouter>
    );

    const [firstToken, secondToken] = await screen.findAllByText(
      'select token'
    );
    fireEvent.click(firstToken);
    fireEvent.click((await screen.findAllByText('nDAI'))[0]);

    fireEvent.click(secondToken);
    fireEvent.click((await screen.findAllByText('nWETH'))[0]);

    const button = screen.getAllByText('Add Liquidity Pool');
    fireEvent.click(button[1]);

    return waitFor(() => {
      expect().toHaveTransaction('nDAI', [
        {
          methodName: 'storage_deposit',
          args: { account_id: REF_FI_CONTRACT_ID, registration_only: true },
          amount: '100000000000000000000000',
          gas: '30000000000000',
        },
      ]);

      expect().toHaveTransaction('nWETH', []);

      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'add_simple_pool',
          args: { tokens: ['nDAI', 'nWETH'], fee: 25 },
          amount: '50000000000000000000000',
          gas: '30000000000000',
        },
      ]);
    });
  });

  it('adds a pool and pays ref.finance storage deposit for the token', async () => {
    render(
      <MemoryRouter>
        <AddPoolPage />
      </MemoryRouter>
    );

    const [firstToken, secondToken] = await screen.findAllByText(
      'select token'
    );
    fireEvent.click(firstToken);
    fireEvent.click((await screen.findAllByText('nDAI'))[0]);

    fireEvent.click(secondToken);
    fireEvent.click((await screen.findAllByText('nWETH'))[0]);

    fireEvent.change(screen.getByDisplayValue('25'), {
      target: { value: '40' },
    });

    const button = screen.getAllByText('Add Liquidity Pool');
    fireEvent.click(button[1]);

    return waitFor(() => {
      expect().toHaveTransaction('nDAI', [
        {
          methodName: 'storage_deposit',
          args: { account_id: REF_FI_CONTRACT_ID, registration_only: true }, 
          amount: '100000000000000000000000',
          gas: '30000000000000',
        },
      ]);

      expect().toHaveTransaction('nWETH', [
        {
          methodName: 'storage_deposit',
          args: { account_id: REF_FI_CONTRACT_ID, registration_only: true },
          amount: '100000000000000000000000',
          gas: '30000000000000',
        },
      ]);

      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'add_simple_pool',
          args: { tokens: ['nDAI', 'nWETH'], fee: 40 },
          amount: '50000000000000000000000',
          gas: '30000000000000',
        },
      ]);
    });
  });
});
