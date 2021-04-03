import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import { registerToken } from '~services/token';

export default function Register() {
  const [tokenId, setTokenId] = useState<string>();
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    return registerToken(tokenId);
  };

  return (
    <FormWrap
      buttonText="Whitelist Token"
      canSubmit={!!tokenId}
      onSubmit={handleSubmit}
    >
      <input
        className="focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-3xl text-inputText leading-tight"
        type="text"
        placeholder="Token Address"
        value={tokenId}
        onChange={({ target }) => setTokenId(target.value)}
      />
    </FormWrap>
  );
}
