import React, {
  useState,
  useEffect,
  useRef,
  FormEventHandler,
  useContext,
} from 'react';
import { IoClose } from '../reactIcons';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-modal';
import Alert from '../../components/alert/Alert';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { wallet } from 'src/services/near';
import {
  nearMetadata,
  nearDeposit,
  nearWithdraw,
  wnearMetadata,
  WRAP_NEAR_CONTRACT_ID,
} from '../../services/wrap-near';
import { useDepositableBalance, useToken } from '../../state/token';
import { ONLY_ZEROS, toReadableNumber } from '../../utils/numbers';
import SubmitButton from './SubmitButton';
import TokenAmount from './TokenAmount';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import { SwapExchange } from '../icon/Arrows';
import SelectToken from './SelectToken';

export const NEAR_WITHDRAW_KEY = 'REF_FI_NEAR_WITHDRAW_VALUE';

function WrapNear(props: ReactModal.Props) {
  const [showError, setShowError] = useState(false);
  const [tokenOut, setTokenOut] = useState<TokenMetadata>(wnearMetadata);
  const [tokenIn, setTokenIn] = useState<TokenMetadata>(nearMetadata);
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const topBall = useRef<HTMLInputElement>();
  const bottomBall = useRef<HTMLInputElement>();
  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();
  const intl = useIntl();

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (tokenIn && tokenIn.id !== 'NEAR') {
      const tokenInId = tokenIn.id;
      if (tokenInId) {
        if (isSignedIn) {
          ftGetBalance(tokenInId).then((available: string) =>
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
        if (isSignedIn) {
          ftGetBalance(tokenOutId).then((available: string) =>
            setTokenOutBalanceFromNear(
              toReadableNumber(tokenOut?.decimals, available)
            )
          );
        }
      }
    }
  }, [tokenIn, tokenOut, isSignedIn]);

  useEffect(() => {
    if (tokenInAmount && tokenInAmount !== '0') {
      if (
        tokenIn.id === 'NEAR' &&
        Number(tokenInAmount) > Number(tokenInMax) - 0.5
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
    tokenInAmount &&
    !ONLY_ZEROS.test(tokenInAmount) &&
    !showError &&
    !ONLY_ZEROS.test(tokenInMax);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    sessionStorage.setItem(NEAR_WITHDRAW_KEY, '1');

    if (tokenIn?.id === 'NEAR') {
      setButtonLoading(true);
      return nearDeposit(tokenInAmount);
    } else {
      setButtonLoading(true);
      return nearWithdraw(tokenInAmount);
    }
  };

  const getMax = function () {
    return tokenIn.id !== 'NEAR'
      ? tokenInMax
      : Number(tokenInMax) <= 0.5
      ? '0'
      : String(Number(tokenInMax) - 0.5);
  };

  return (
    <Modal {...props}>
      <div className="border-gradientFrom border border-opacity-50 bg-secondary py-5 shadow-2xl rounded-2xl p-8 pb-9 bg-dark xs:rounded-lg md:rounded-lg">
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
              defaultMessage=" for gas fees."
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
            forWrap
          />
          <div
            className="flex items-center justify-center border-t mt-12 mb-3"
            style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
          >
            <SwapExchange
              onChange={() => {
                setTokenIn(tokenOut);
                setTokenOut(tokenIn);
                setTokenInAmount('');
                setShowError(false);
              }}
            />
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
          <div className="flex items-center justify-center relative top-3">
            {showError && (
              <Alert
                level="warn"
                message={intl.formatMessage({
                  id:
                    Number(tokenInMax) - Number(tokenInAmount) < 0.5 &&
                    tokenIn.id === 'NEAR'
                      ? 'near_validation_error'
                      : 'wrap_error_msg',
                })}
              />
            )}
          </div>
        </div>
        <SubmitButton
          onClick={handleSubmit}
          disabled={!canSubmit}
          label="submit"
          loading={buttonLoading}
        />
      </div>
    </Modal>
  );
}

export default WrapNear;
