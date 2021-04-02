import React, { useEffect, useState } from 'react';
import FormWrap from '../forms/FormWrap';
import { registerToken, TokenMetadata } from '../../services/token';
import SelectToken from '~components/forms/SelectToken';
import Icon from '~components/tokens/Icon';
import { useUnregisteredTokens, useTokens } from '~state/token';

export default function Register() {
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();
  const unRegisteredTokens = useUnregisteredTokens();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedToken) {
      registerToken(selectedToken.id);
    }
  };

  return (
    <FormWrap
      buttonText="Register"
      canSubmit={!!selectedToken}
      onSubmit={handleSubmit}
    >
      <h1 className="text-white text-2xl">Select token to register</h1>
      <section className="text-center ">
        <SelectToken
          tokens={unRegisteredTokens}
          selected={selectedToken && <Icon token={selectedToken} />}
          onSelect={setSelectedToken}
        />
      </section>
    </FormWrap>
  );
}
