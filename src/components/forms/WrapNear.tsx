import React, { useState, useEffect, useRef, FormEventHandler } from 'react';
import { IoClose } from 'react-icons/io5';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-modal';
import { WrapNearEnter } from '~components/icon/Near';
import Alert from '~components/alert/Alert';
import { ftGetBalance, TokenMetadata } from '~services/ft-contract';
import { wallet } from '~services/near';
import { nearMetadata, nearDeposit, nearWithdraw } from '~services/wrap-near';
import { useDepositableBalance } from '~state/token';
import { isMobile } from '~utils/device';
import { toReadableNumber } from '~utils/numbers';
import SubmitButton from './SubmitButton';
import TokenAmount from './TokenAmount';

const WNEAR_SYMBOL = 'wNEAR';

function WrapNear(props: ReactModal.Props & { allTokens: TokenMetadata[] }) {
  const { allTokens } = props;
  const [showError, setShowError] = useState(false);
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [tokenIn, setTokenIn] = useState<TokenMetadata>(nearMetadata);
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const topBall = useRef<HTMLInputElement>();
  const bottomBall = useRef<HTMLInputElement>();
  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();
  const intl = useIntl();

  useEffect(() => {
    if (allTokens) {
      setTokenOut(allTokens.find((token) => token.symbol === WNEAR_SYMBOL));
    }
  }, [allTokens]);

  useEffect(() => {
    if (tokenIn && tokenIn.id !== 'NEAR') {
      const tokenInId = tokenIn.id;
      if (tokenInId) {
        if (wallet.isSignedIn() && wallet.getAccountId()) {
          ftGetBalance(tokenInId).then((available) =>
            setTokenInBalanceFromNear(
              toReadableNumber(tokenIn?.decimals, available)
            )
          );
        }
      }
    }
    if (tokenOut && tokenOut.id !== 'NEAR') {
      const tokenOutId = tokenOut.id;
      if (tokenOutId) {
        if (wallet.isSignedIn()) {
          ftGetBalance(tokenOutId).then((available) =>
            setTokenOutBalanceFromNear(
              toReadableNumber(tokenOut?.decimals, available)
            )
          );
        }
      }
    }
  }, [tokenIn, tokenOut]);

  useEffect(() => {
    if (tokenInAmount && tokenInAmount !== '0') {
      if (
        tokenIn.id === 'NEAR' &&
        Number(tokenInAmount) > Number(tokenInMax) - 1
      ) {
        setShowError(true);
      } else if (Number(tokenInAmount) > Number(tokenInMax)) {
        setShowError(true);
      } else {
        setShowError(false);
      }
    } else {
      setShowError(false);
    }
  }, [tokenInAmount]);

  const tokenInMax =
    tokenIn?.id === 'NEAR'
      ? useDepositableBalance(tokenIn?.id, tokenIn?.decimals)
      : tokenInBalanceFromNear || tokenOutBalanceFromNear || '0';
  const tokenOutTotal =
    tokenOut?.id === 'NEAR'
      ? useDepositableBalance(tokenOut?.id, tokenOut?.decimals)
      : tokenOutBalanceFromNear || '0';
  const canSubmit =
    tokenInAmount && tokenInAmount !== '0' && !showError && tokenInMax !== '0';

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (tokenIn?.id === 'NEAR') {
      return nearDeposit(tokenInAmount);
    } else {
      return nearWithdraw(tokenInAmount);
    }
  };
  const runSwapAnimation = function () {
    topBall.current.style.animation = 'rotation1 1s 0s ease-out 1';
    bottomBall.current.style.animation = 'rotation2 1s 0s ease-out 1';
    topBall.current.addEventListener('animationend', function () {
      topBall.current.style.animation = '';
    });
    bottomBall.current.addEventListener('animationend', function () {
      bottomBall.current.style.animation = '';
    });
  };
  const getMax = function () {
    return tokenIn.id !== 'NEAR'
      ? tokenInMax
      : Number(tokenInMax) <= 1
      ? '0'
      : String(Number(tokenInMax) - 1);
  };

  return (
    <Modal {...props}>
      <form
        className="border-gradientFrom border border-opacity-50 bg-secondary py-5 shadow-2xl rounded-2xl p-8 pb-9 bg-dark xs:rounded-lg md:rounded-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="formTitle flex justify-between font-bold text-xl text-white text-left pb-2">
          <FormattedMessage id="wrapnear" defaultMessage="Wrap NEAR" />
          <IoClose onClick={props.onRequestClose} className=" cursor-pointer" />
        </h2>
        <div>
          <div className=" text-primaryText text-sm mt-3 mb-5">
            <FormattedMessage
              id="wrapnear_tip_one"
              defaultMessage="Wrapping NEAR allows you to trade on REF. Make sure to "
            />
            <span className=" text-white">
              <FormattedMessage
                id="wrapnear_tip_two"
                defaultMessage="leave 1 NEAR"
              />
            </span>

            <FormattedMessage
              id="wrapnear_tip_three"
              defaultMessage=" for gas fees to unwrap your NEAR."
            />
          </div>
          <TokenAmount
            amount={tokenInAmount}
            total={tokenInMax}
            max={getMax()}
            useNearBalance={true}
            selectedToken={tokenIn}
            showSelectToken={false}
            text={intl.formatMessage({ id: 'from' })}
            onChangeAmount={(amount) => {
              setTokenInAmount(amount);
            }}
          />
          <div
            className="flex items-center justify-center border-t mt-12 mb-3"
            style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
          >
            <div
              className="relative flex items-center -mt-6 mb-4 w-11 h-11 border border-white border-opacity-40 rounded-full cursor-pointer bg-dark"
              onClick={() => {
                runSwapAnimation();
                setTokenIn(tokenOut);
                setTokenOut(tokenIn);
                setTokenInAmount('');
                setShowError(false);
              }}
            >
              <div className="swap-wrap">
                <div className="top-ball" ref={topBall} id="top-ball" />
                <div
                  className="bottom-ball"
                  ref={bottomBall}
                  id="bottom-ball"
                />
              </div>
            </div>
          </div>
          <TokenAmount
            amount={tokenInAmount}
            total={tokenOutTotal}
            showSelectToken={false}
            useNearBalance={true}
            disabled={true}
            selectedToken={tokenOut}
            text={intl.formatMessage({ id: 'to' })}
          />
          {showError && (
            <Alert
              level="error"
              message={intl.formatMessage({ id: 'wrap_error_msg' })}
            />
          )}
        </div>
        <SubmitButton disabled={!canSubmit} label="submit" />
      </form>
    </Modal>
  );
}

export default WrapNear;
