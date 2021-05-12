import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useTokenBalances,
  useUserRegisteredTokens,
  useWhitelistTokens,
} from '../state/token';
import Loading from '../components/layout/Loading';
import { Card } from '../components/card';
import { toReadableNumber } from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import { nearMetadata, wrapNear } from '../services/wrap-near';
import { useDepositableBalance } from '../state/token';
import TokenAmount from '../components/forms/TokenAmount';
import { deposit } from '../services/token';
import { wallet } from '~services/near';
import { Balances, ConnectToNearBtn } from '../components/deposit';

function DepositBtn(props: {
  amount?: string;
  token?: TokenMetadata;
  balance?: string;
}) {
  const { amount, token, balance } = props;
  const canSubmit = balance !== '0' && !!amount && !!token;

  return (
    <div className="flex items-center justify-center pt-2">
      <button
        disabled={!canSubmit}
        className={`rounded-full text-sm text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight ${
          canSubmit ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
        }`}
        onClick={() => {
          if (canSubmit) {
            if (token.id === nearMetadata.id) {
              return wrapNear(amount);
            }
            deposit({
              token,
              amount,
            });
          }
        }}
      >
        Deposit
      </button>
    </div>
  );
}

export default function DepositPage() {
  const { id } = useParams<{ id: string }>();
  const [amount, setAmount] = useState<string>('');
  const balances = useTokenBalances();

  const registeredTokens = useUserRegisteredTokens();
  const tokens = useWhitelistTokens();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>(
    id && tokens ? tokens.find((tok) => tok.id === id) : nearMetadata
  );

  const userTokens = useUserRegisteredTokens();
  const depositable = useDepositableBalance(selectedToken?.id);

  useEffect(() => {
    if (id && tokens) {
      setSelectedToken(tokens.find((tok) => tok.id === id));
    }
  }, [id, tokens]);

  if (!tokens || !userTokens) return <Loading />;
  if (!registeredTokens || !balances) return <Loading />;

  const max = toReadableNumber(selectedToken?.decimals, depositable) || '0';

  return (
    <div className="flex items-center flex-col">
      <div className="text-center pb-5">
        <div className="text-white text-3xl font-semibold">Deposit</div>
        <div className="text-white text-sm pt-2">
          Deposit tokens to swap and pool
        </div>
      </div>
      <Card>
        <TokenAmount
          amount={amount}
          max={max}
          total={max}
          tokens={[nearMetadata, ...tokens]}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          onChangeAmount={setAmount}
          calledBy='deposit'
        />
        {wallet.isSignedIn() ? (
          <DepositBtn balance={max} amount={amount} token={selectedToken} />
        ) : (
          <ConnectToNearBtn />
        )}
      </Card>
      <div className="text-white text-sm pt-3">
        Small storage fee is applied of{' '}
        <span className="font-bold">0.00084</span> Ⓝ
      </div>

      <Balances title="Balance" tokens={userTokens} balances={balances} />
    </div>
  );
}
