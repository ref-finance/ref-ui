import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import { getUserRegisteredTokens, registerToken, TokenMetadata } from '../../services/token';
import SelectToken from '~components/forms/SelectToken';
import Icon from '~components/tokens/Icon';

export default function Register({ tokens }: { tokens: TokenMetadata[] }) {
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    registerToken(selectedToken.name);
  };

  return (
    <FormWrap title="Register" onSubmit={handleSubmit}>
      <h1>Select Token to Register </h1>
      <SelectToken
        tokens={tokens}
        selected={selectedToken && <Icon token={selectedToken} />}
        onSelect={setSelectedToken}
      />
    </FormWrap>
  );
}
