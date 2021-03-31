import React, { useEffect, useState } from 'react';
import PortfolioCoinList from './PortfolioCoinList';
import DepositWithdrawSelect from './DepositWithdrawSelect';
import { getTokenBalances, TokenMetadata } from '~services/token';
import FormWrap from '~components/forms/FormWrap';
import TokenAmount from '~components/forms/TokenAmount';
import { useRegisteredTokens, useTokenBalances } from '~state/token';

function Portfolio() {
  const balances = useTokenBalances();
  const tokens = useRegisteredTokens();

  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();

  return (
    <>
      <h1 className="font-semibold font-inter pt-8">Portfolio</h1>
      <tbody>
        <PortfolioCoinList deposits={balances} />
      </tbody>
      <FormWrap title="Deposit" onSubmit={() => {}}>
        <TokenAmount
          amount={amount}
          tokens={tokens}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          onChangeAmount={setAmount}
        />
      </FormWrap>
    </>
  );
}

export default Portfolio;
