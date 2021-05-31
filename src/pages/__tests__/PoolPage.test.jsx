import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PoolPage from '../PoolPage';
import { MemoryRouter } from 'react-router';
import { REF_FI_CONTRACT_ID } from '../../services/near';

describe('PoolPage', () => {
  it('adds liquidity to a pool', async () => {
    render(
      <MemoryRouter>
        <PoolPage />
      </MemoryRouter>
    );

    const [firstToken, secondToken] = await screen.findAllByPlaceholderText(
      '0.0'
    );

    fireEvent.change(firstToken, {
      target: { value: '100000' },
    });

    await waitFor(() => {
      expect(secondToken.value).toEqual('500000');
    });

    fireEvent.change(secondToken, {
      target: { value: '1' },
    });

    await waitFor(() => {
      expect(firstToken.value).toEqual('0.2');
    });

    const [, submitButton] = screen.getAllByText('Add Liquidity');
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'add_liquidity',
          args: { amounts: ['200000', '10000000000'], pool_id: null },
          amount: '1',
          gas: '30000000000000',
        },
      ]);
    });
  });

  it('removes liquidity from a pool', async () => {
    render(
      <MemoryRouter>
        <PoolPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Remove Liquidity'));

    const shares = await screen.findByPlaceholderText('0.0');

    fireEvent.change(shares, {
      target: { value: '1' },
    });

    await screen.findByText('50');
    await screen.findByText('25');

    const [, submitButton] = await screen.findAllByText('Remove Liquidity');
    fireEvent.click(submitButton);

    return waitFor(() => {
      expect().toHaveTransaction(REF_FI_CONTRACT_ID, [
        {
          methodName: 'remove_liquidity',
          args: {
            min_amounts: ['4975000', '248750000000'],
            pool_id: null,
            shares: '1000000000000000000000000',
          },
          amount: '1',
          gas: '30000000000000',
        },
      ]);
    });
  });
});
