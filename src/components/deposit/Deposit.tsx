import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import {
  useTokenBalances,
  useUserRegisteredTokens,
  useWhitelistTokens,
} from '../../state/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toPrecision, toReadableNumber } from '../../utils/numbers';
import { Card } from '../card/Card';
import TokenAmount from '../forms/TokenAmount';
import { TokenBalancesView, withdraw } from '../../services/token';
import { REF_FI_CONTRACT_ID, wallet } from '~services/near';
import { Near } from '~components/icon';
import { isMobile } from '~utils/device';

export function WithdrawModal(props: ReactModal.Props) {
  const [amount, setAmount] = useState<string>('');
  const tokens = useWhitelistTokens();
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | null>(
    null
  );

  useEffect(() => {
    if (userTokens) setSelectedToken(userTokens[0]);
  }, [userTokens]);

  const ready = tokens && balances && userTokens && selectedToken;
  if (!ready) return null;

  const max = toReadableNumber(
    selectedToken.decimals,
    balances[selectedToken.id] || '0'
  );

  const cardWidth = isMobile() ? '75vw' : '25vw';

  return (
    <Modal {...props}>
      <Card style={{width:cardWidth}}>
        <div className="text-sm text-gray-800 font-semibold pb-4">
          Withdraw Token
        </div>
        <TokenAmount
          amount={amount}
          max={max}
          total={max}
          tokens={userTokens}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          onChangeAmount={setAmount}
        />
        <div className="flex items-center justify-center pt-5">
          <button
            className="rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-green-500"
            onClick={() => {
              withdraw({
                token: selectedToken,
                amount,
              });
            }}
          >
            Withdraw
          </button>
        </div>
      </Card>
    </Modal>
  );
}

export function Token(props: TokenMetadata & { amount: string }) {
  const { symbol, icon, amount } = props;
  return (
    <div className="token flex items-center justify-between pt-3.5 pb-3.5">
      <div className="flex items-center">
        {icon ? (
          <img className="h-6 w-6" src={icon} alt={symbol} />
        ) : (
          <div className="h-6 w-6"></div>
        )}
        <div className="pl-5 font-semibold text-xs">{symbol}</div>
      </div>
      <div className="font-semibold text-xs">{amount}</div>
    </div>
  );
}

export function TokenList(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  hideEmpty?: boolean;
}) {
  const { tokens, balances, hideEmpty } = props;

  return (
    <div className="divide-y">
      {tokens.map((token) => {
        const balance = balances[token.id] || '0';
        if (balance === '0' && hideEmpty) return null;

        const amount = toPrecision(
          toReadableNumber(token.decimals, balance),
          6,
          true
        );
        return <Token key={token.id} {...token} amount={amount} />;
      })}
      {tokens.length === 0 ? (
        <div className="text-center text-gray-600 text-xs font-semibold pt-2 pb-2">
          No tokens deposited
        </div>
      ) : null}
    </div>
  );
}

export function Balances(props: {
  title?: string;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
}) {
  const { tokens, balances, title } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="balances flex items-center flex-col justify-center pt-8 w-full">
      {title ? (
        <div className="text-white font-semibold text-xl pb-4">Balance</div>
      ) : null}
      <Card width="w-full">
        <TokenList hideEmpty={true} tokens={tokens} balances={balances} />

        {tokens.length > 0 ? (
          <div className="flex items-center justify-center pt-5">
            <button
              className="rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight"
              onClick={() => setIsOpen(true)}
            >
              Withdraw
            </button>
          </div>
        ) : null}
      </Card>

      <WithdrawModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} />
    </div>
  );
}

export function ConnectToNearBtn() {
  return (
    <div
      className="flex items-center justify-center pt-2"
      onClick={() => wallet.requestSignIn(REF_FI_CONTRACT_ID)}
    >
      <div className="inline-flex cursor-pointer font-bold items-center text-center rounded-full bg-gray-800 px-3.5 py-1">
        <div className="pr-1">
          <Near />
        </div>
        <div className="text-xs text-white">Connect to NEAR</div>
      </div>
    </div>
  );
}
