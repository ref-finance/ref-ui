import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import { depositStorageToCoverToken } from '~services/account';

export default function Register() {
  const [count, setCount] = useState<number>();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    depositStorageToCoverToken();
  };

  return (
    <FormWrap
      buttonText="Storage Deposit"
      canSubmit={!!count}
      onSubmit={handleSubmit}
    >
      <h2 className="text-darkText text-2xl">Deposit NEAR to hold tokens</h2>
      <input
        className="focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-3xl text-inputText leading-tight"
        type="number"
        min="0"
        placeholder="I'll be depositing # tokens"
        value={count}
        onChange={({ target }) => setCount(Number(target.value))}
      />
    </FormWrap>
  );
}
