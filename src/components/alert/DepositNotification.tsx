import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import {
  ACCOUNT_MIN_STORAGE_AMOUNT,
  initializeAccount,
} from '../../services/account';
import { TokenMetadata } from '../../services/ft-contract';
import { wallet } from '../../services/near';
import { deposit } from '../../services/token';
import { nearMetadata, wrapNear } from '../../services/wrap-near';
import { useDepositableBalance } from '../../state/token';
import { toPrecision, toReadableNumber } from '../../utils/numbers';
import TokenAmount from '../forms/TokenAmount';
import { toRealSymbol } from '~utils/token';

function FirstDepositForm() {
  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] =
    useState<TokenMetadata>(nearMetadata);
  const [nearBalance, setNearBalance] = useState<string>();

  const depositable = useDepositableBalance(selectedToken?.id);
  const max =
    toReadableNumber(
      selectedToken?.decimals,
      selectedToken?.id === nearMetadata.id ? nearBalance : depositable
    ) || '0';

  useEffect(() => {
    wallet
      .account()
      .getAccountBalance()
      .then(({ available }) => setNearBalance(available));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedToken.id === nearMetadata.id) {
      return wrapNear(amount);
    }

    return deposit({
      token: selectedToken,
      amount,
    });
  };

  return (
    <form>
      {selectedToken && (
        <h2 className="text-center">
          You can deposit up to {toPrecision(max, 4, true)}{' '}
          {toRealSymbol(selectedToken.symbol)}.
        </h2>
      )}
      <TokenAmount
        amount={amount}
        max={String(max)}
        total={String(max)}
        tokens={[nearMetadata]}
        selectedToken={selectedToken}
        onChangeAmount={setAmount}
      />
    </form>
  );
}

export default function DepositNotification({ open }: { open: boolean }) {
  return (
    <MicroModal openInitially={open}>
      {(close) => (
        <>
          <h1 className="text-center text-2xl my-2">First time here?</h1>
          <p className="flex flex-col justify-center items-center">
            <span>Ref-fi requires a one-time initial storage payment of</span>
            <span className="font-semibold">
              {ACCOUNT_MIN_STORAGE_AMOUNT} Ⓝ
            </span>
            <span>Deposit Some NEAR</span>
            <FirstDepositForm />
          </p>
          <section className="flex justify-center">
            <button
              className="items-center my-4 h-10 w-40 rounded-md bg-buttonBg border-2 text-buttonText hover:bg-buttonText hover:text-buttonBg hover:border-buttonBg hover:border-2 shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
              onClick={() => initializeAccount()}
            >
              {' '}
              PROCEED
            </button>
            <button
              className="bg-red-600 hover:bg-white m-3 flex-row-centered hover:text-red-600 hover:border-2 hover:border-red-600 text-white flex flex-col my-4 h-10 w-40 border-2  shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
              onClick={() => {
                wallet.signOut();
                window.location.replace('/');
              }}
            >
              {' '}
              CANCEL
            </button>
          </section>
        </>
      )}
    </MicroModal>
  );
}
