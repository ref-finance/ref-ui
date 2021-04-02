import React from 'react';
import TokenManagement from '~components/management/TokenManagement';
import FullCard from '~components/layout/FullCard';
import { wallet } from '~services/near';

export default function TokenManagementPage() {
  return (
    <FullCard>{wallet.isSignedIn() ? <TokenManagement /> : null}</FullCard>
  );
}
