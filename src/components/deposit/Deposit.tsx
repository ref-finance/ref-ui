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
import { REF_FARM_CONTRACT_ID, wallet } from '~services/near';
import { isMobile } from '~utils/device';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage } from 'react-intl';
import { GradientButton } from '~components/button/Button';
import { IoCloseOutline } from 'react-icons/io5';

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

  const cardWidth = isMobile() ? '95vw' : '25vw';
  const { onRequestClose } = props;

  return (
    <Modal {...props}>
      <Card style={{ width: cardWidth }}>
        <div className="flex items-center justify-between  pb-6 relative">
          <h2 className="text-sm font-bold text-center text-white">
            <FormattedMessage
              id="withdraw_token"
              defaultMessage="Withdraw Token"
            />
          </h2>
          <IoCloseOutline
            onClick={onRequestClose}
            className="text-gray-400 text-2xl cursor-pointer"
          />
        </div>
        <TokenAmount
          amount={amount}
          max={max}
          total={max}
          tokens={userTokens}
          balances={balances}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
          onChangeAmount={setAmount}
        />
        <div className="flex items-center justify-center pt-5">
          <button
            className={`flex flex-row w-full justify-center px-5 py-2 mt-6 text-white disabled:cursor-not-allowed mx-auto`}
            style={{
              background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
              borderRadius: '5px',
            }}
            onClick={() => {
              withdraw({
                token: selectedToken,
                amount,
              });
            }}
          >
            <FormattedMessage id="withdraw" defaultMessage="Withdraw" />
          </button>
        </div>
      </Card>
    </Modal>
  );
}

export function Token(
  props: TokenMetadata & { amount: string; totalAmount: string }
) {
  const { symbol, icon, amount, totalAmount } = props;
  return (
    <div
      className="token flex items-center justify-between pt-3.5 pb-3.5 text-white"
      title={totalAmount}
    >
      <div className="flex items-center">
        {icon ? (
          <img
            className="h-6 w-6 border rounded-full border-greenLight"
            src={icon}
            alt={toRealSymbol(symbol)}
          />
        ) : (
          <div className="h-6 w-6 border rounded-full border-greenLight"></div>
        )}
        <div className="pl-5 font-semibold text-sm">{toRealSymbol(symbol)}</div>
      </div>
      <div className="font-semibold text-sm">{amount}</div>
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
    <div className="divide-y divide-gray-600">
      {tokens.map((token) => {
        const balance = balances[token.id] || '0';
        if (balance === '0' && hideEmpty) return null;

        const amount = toPrecision(
          toReadableNumber(token.decimals, balance),
          3,
          true
        );
        return (
          <Token
            key={token.id}
            {...token}
            amount={amount}
            totalAmount={toReadableNumber(token.decimals, balance)}
          />
        );
      })}
      {tokens.length === 0 ? (
        <div className="text-center text-gray-600 text-xs font-semibold pt-2 pb-2">
          <FormattedMessage
            id="no_tokens_deposited"
            defaultMessage="No tokens deposited"
          />
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
      <Card width="w-full" bgcolor="bg-dark">
        {title ? (
          <div className="text-white font-semibold text-xl pb-4">
            <FormattedMessage id="balance" defaultMessage="Balance" />
          </div>
        ) : null}
        <TokenList hideEmpty={true} tokens={tokens} balances={balances} />

        {tokens.length > 0 ? (
          <div className="flex items-center justify-center pt-5">
            <button
              className={`flex flex-row w-full justify-center px-5 py-2 mt-6 text-white disabled:cursor-not-allowed mx-auto`}
              style={{
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                borderRadius: '5px',
              }}
              onClick={() => setIsOpen(true)}
            >
              <FormattedMessage id="withdraw" defaultMessage="Withdraw" />
            </button>
          </div>
        ) : null}
      </Card>

      <WithdrawModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={{
          content: {
            outline: 'none',
          },
        }}
      />
    </div>
  );
}
