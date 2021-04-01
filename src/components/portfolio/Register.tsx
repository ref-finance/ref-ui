import React, { useEffect, useState } from 'react';
import FormWrap from '../forms/FormWrap';
import { registerToken, TokenMetadata } from '../../services/token';
import SelectToken from '~components/forms/SelectToken';
import Icon from '~components/tokens/Icon';
import { useGetUnregisteredTokens, useTokens } from '~state/token';

export default function Register() {
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();
  const unRegisteredTokens = useTokens(useGetUnregisteredTokens());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if(selectedToken) {
      registerToken(selectedToken.id);
      } else window.alert("Token not selected")
  };

  return (
    <FormWrap buttonText="Register" onSubmit={handleSubmit}>
      <h1>Select token to register</h1>
      <SelectToken
        tokens={unRegisteredTokens}
        selected={selectedToken && <Icon token={selectedToken} />}
        onSelect={setSelectedToken}
      />
    </FormWrap>
  );
}
