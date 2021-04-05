import React, { useEffect, useState } from 'react';
import { toReadableNumber } from '~utils/numbers';
import { wallet } from '../../services/near';
import { wrapNear } from '../../services/wrap-near';
import FormWrap from '../forms/FormWrap';
import Loading from '../layout/Loading';

export default function WrapNear() {
  const [balance, setBalance] = useState<string>();
  const [amount, setAmount] = useState<string>();

  useEffect(() => {
    wallet
      .account()
      .getAccountBalance()
      .then(({ available }) => setBalance(toReadableNumber(24, available)));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    return wrapNear(amount);
  };

  if (!balance) return <Loading />;

  return (
    <FormWrap buttonText="Wrap Ⓝ" canSubmit={!!amount} onSubmit={handleSubmit}>
      <h2>You can deposit up to {balance} Ⓝ</h2>
      <input
        className="col-span-11 focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-lg my-4 text-inputText leading-tight"
        max={balance}
        type="number"
        placeholder="Enter amount of Ⓝ to wrap..."
        value={amount}
        onChange={({ target }) => setAmount(target.value)}
      />
    </FormWrap>
  );
}
