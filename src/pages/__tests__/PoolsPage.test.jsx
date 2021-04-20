import React from 'react';
import { render, screen } from '@testing-library/react';
import PoolsPage from '../PoolsPage';
import { MemoryRouter } from 'react-router';

describe('PoolsPage', () => {
  it('renders the page', async () => {
    render(
      <MemoryRouter>
        <PoolsPage />
      </MemoryRouter>
    );
    await screen.findByText('Available Liquidity Pools');
  });
});
