import React, { useState, useEffect, useRef, FormEventHandler } from 'react';
import { IoClose } from 'react-icons/io5';
import { FormattedMessage, useIntl } from 'react-intl';
import MicroModal from 'react-micro-modal';
import { WrapNearEnter } from '~components/icon/Near';
import Alert from '~components/alert/Alert';
import { ftGetBalance, TokenMetadata } from '~services/ft-contract';
import { wallet } from '~services/near';
import { nearMetadata, nearDeposit, nearWithdraw } from '~services/wrap-near';
import { useDepositableBalance } from '~state/token';
import { isMobile } from '~utils/device';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import SubmitButton from './SubmitButton';
import TokenAmount from './TokenAmount';

const WNEAR_SYMBOL = 'wNEAR';
const dialogWidth = isMobile() ? 340 : 550;
const dialogMinwidth = isMobile() ? 340 : 550;
const dialogHidth = isMobile() ? 525 : 520;

function WrapNear(props: { allTokens: TokenMetadata[] }) {
  const { allTokens } = props;
  const [visible, setVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [tokenIn, setTokenIn] = useState<TokenMetadata>(nearMetadata);
  const [tokenInAmount, setTokenInAmount] = useState<string>('0');
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
      }
    } else {
      setShowError(false);
    }
  }, [tokenInAmount]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [visible]);

  const nearBalance = tokenIn
    ? useDepositableBalance(nearMetadata.id, nearMetadata.decimals)
    : '0';
  const tokenInMax =
    tokenIn?.id === 'NEAR'
      ? useDepositableBalance(tokenIn?.id, tokenIn?.decimals)
      : tokenInBalanceFromNear || '0';
  const tokenOutTotal =
    tokenOut?.id === 'NEAR'
      ? useDepositableBalance(tokenOut?.id, tokenOut?.decimals)
      : tokenOutBalanceFromNear || '0';
  const canSubmit =
    tokenInAmount && tokenInAmount !== '0' && !showError && tokenInMax !== '0';

  const handleClose = () => {
    setVisible(false);
  };

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

  return (
    <MicroModal
      open={visible}
      handleClose={handleClose}
      trigger={() =>
        isMobile() ? (
          <div
            className="flex p-4 justify-between"
            onClick={() => setVisible(true)}
          >
            <FormattedMessage id="wrapnear" defaultMessage="Wrap NEAR" />
            <div className=" py-1 px-2 border border-framBorder text-framBorder hover:text-white hover:bg-framBorder hover:border-0 cursor-pointer rounded h-6 items-center flex">
              <WrapNearEnter></WrapNearEnter>
              <span className=" ml-2">{toPrecision(nearBalance, 3, true)}</span>
            </div>
          </div>
        ) : (
          <div
            className=" py-1 px-2 border border-framBorder text-framBorder hover:text-white hover:bg-framBorder hover:border-0 cursor-pointer rounded h-6 items-center flex"
            onClick={() => setVisible(true)}
          >
            <WrapNearEnter></WrapNearEnter>
            <span className=" ml-2">{toPrecision(nearBalance, 3, true)}</span>
          </div>
        )
      }
      overrides={{
        Overlay: {
          style: {
            zIndex: 110,
            backgroundColor: 'rgba(0, 19, 32, 0.65)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
        },
        Dialog: {
          style: {
            width: dialogWidth,
            minWidth: dialogMinwidth,
            borderRadius: '0.75rem',
            border: '1px solid rgba(0, 198, 162, 0.5)',
            padding: '1.5rem 0',
            background: '#1D2932',
            height: dialogHidth,
            zIndex: 100,
          },
        },
      }}
    >
      {() => (
        <form
          className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl px-7 bg-dark xs:rounded-lg md:rounded-lg"
          onSubmit={handleSubmit}
        >
          <h2 className="formTitle flex justify-between font-bold text-xl text-white text-left pb-2">
            <FormattedMessage id="wrapnear" defaultMessage="Wrap NEAR" />
            <IoClose onClick={handleClose} className=" cursor-pointer" />
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
              max={tokenInMax}
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
                  setTokenInAmount('0');
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
      )}
    </MicroModal>
  );
}

export default WrapNear;
