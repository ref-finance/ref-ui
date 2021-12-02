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
import BigNumber from 'bignumber.js';

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

  const canSubmit = new BigNumber(amount).isLessThanOrEqualTo(
    new BigNumber(max)
  );

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
            disabled={!canSubmit}
            className={`flex flex-row w-full justify-center px-5 py-2 mt-6 text-white disabled:cursor-not-allowed mx-auto
              ${!canSubmit ? 'opacity-40 cursor-not-allowed' : ''}
            `}
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
  props: TokenMetadata & {
    amount: string;
    totalAmount: string;
    showTokenId: boolean;
  }
) {
  const { symbol, icon, amount, totalAmount, id, showTokenId } = props;
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
        <div className="pl-5 font-semibold text-sm">
          <div>{toRealSymbol(symbol)}</div>
          {showTokenId && (
            <div className="text-xs text-gray-400" title={id}>
              {`${id.substring(0, 25)}${id.length > 25 ? '...' : ''}`}
            </div>
          )}
        </div>
      </div>
      <div className="font-semibold text-sm">{amount}</div>
    </div>
  );
}

export function TokenList(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  hideEmpty?: boolean;
  showTokenId?: boolean;
}) {
  const { tokens, balances, hideEmpty, showTokenId = false } = props;
  const [tokensList, setTokensList] = useState<TokenMetadata[]>([]);
  useEffect(() => {
    const tokensList =
      balances &&
      tokens &&
      tokens.length > 0 &&
      tokens.map((token) => {
        const item = token;
        const balance = balances[token.id] || '0';
        const amountLabel = toPrecision(
          toReadableNumber(token.decimals, balance),
          3,
          true
        );
        const amount = Number(toReadableNumber(token.decimals, balance));
        return {
          ...item,
          amountLabel: amountLabel,
          amount: amount,
        };
      });
    setTokensList(tokensList);
  }, [tokens, balances]);

  return (
    <div className="divide-y divide-gray-600">
      {tokensList &&
        tokensList.length > 0 &&
        tokensList
          .sort((a, b) => {
            return b.amount - a.amount;
          })
          .map((token) => {
            const balance = balances[token.id] || '0';
            if (balance === '0' && hideEmpty) return null;
            return (
              <Token
                key={token.id}
                {...token}
                amount={token.amountLabel}
                totalAmount={toReadableNumber(token.decimals, balance)}
                showTokenId={showTokenId}
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
