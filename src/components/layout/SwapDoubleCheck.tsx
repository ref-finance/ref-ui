import React, { useState, useContext, useEffect } from 'react';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import {
  toPrecision,
  multiply,
  divide,
  scientificNotationToString,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ButtonTextWrapper,
  GradientButton,
  OutlineButton,
  SolidButton,
} from '../../components/button/Button';
import { WarnTriangle, ErrorTriangle } from '../../components/icon/SwapRefresh';
import ReactModal from 'react-modal';
import Modal from 'react-modal';
import { Card } from '../../components/card/Card';
import { HeavyWarning, ModalClose } from '../../components/icon';
import { Icon } from './SwapRoutes';
import { ArrowRight } from '../icon/swapV3';

import BigNumber from 'bignumber.js';
import Big from 'big.js';
import { PoolInfo, get_pool_from_cache } from '../../services/swapV3';
import { TOKEN_LIST_FOR_RATE } from '../../services/commonV3';

export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';

export const QuestionIcon = ({ color }: { color?: string }) => {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="22" cy="22" r="21" stroke={color || '#FF6B6B'} />
      <path
        d="M21.7051 8.00012C17.1946 8.5008 14.6887 10.4559 14.1874 13.8636C14.0871 14.9665 14.6382 15.5681 15.8414 15.668C16.4423 15.7686 16.9436 15.3174 17.3447 14.3148C17.9462 12.2099 19.3978 11.1574 21.7051 11.1574C24.5103 11.3577 26.0139 12.761 26.2163 15.3672C26.2163 17.7732 24.5834 18.1653 23.6963 18.8908C22.5724 19.8104 21.8373 20.7431 20.9375 22.324C20.1814 23.6523 20.0511 26.4938 20.0511 26.4938C20.0511 27.6967 20.601 28.2982 21.7052 28.2982C22.7059 28.2982 23.2589 27.6967 23.3595 26.4938C23.3595 26.4938 23.492 23.3049 24.7795 21.8948C26.2387 20.2967 29.7243 19.1762 29.8245 15.0667C29.4235 10.7564 26.717 8.40086 21.7051 8.00012ZM21.7051 29.8146C20.5493 29.8146 19.6127 30.7518 19.6127 31.9071C19.6127 33.0629 20.5493 33.9998 21.7051 33.9998C22.861 33.9998 23.7979 33.063 23.7979 31.9071C23.7979 30.7518 22.861 29.8146 21.7051 29.8146Z"
        fill={color || '#FF6B6B'}
      />
    </svg>
  );
};

export function DoubleCheckModal(
  props: ReactModal.Props & {
    tokenIn: TokenMetadata;
    tokenOut: TokenMetadata;
    from: string;
    onSwap: (e?: any) => void;
    priceImpactValue: string;
  }
) {
  const { tokenIn, tokenOut, from, onSwap, priceImpactValue, isOpen } = props;

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      buttonLoading && setButtonLoading(false);
    }
  }, [isOpen]);

  if (!from || !tokenIn || !tokenOut) return null;

  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          position: 'fixed',
          top: '50%',
        },
      }}
    >
      <Card
        padding="p-6"
        bgcolor="bg-cardBg"
        className="text-white border border-gradientFromHover outline-none flex flex-col items-center"
        width="xs:w-90vw md:w-90vw lg:w-30vw"
      >
        <div
          className="ml-2 cursor-pointer p-1 self-end"
          onClick={props.onRequestClose}
        >
          <ModalClose />
        </div>

        <div className="pb-6">
          <QuestionIcon />
        </div>

        <div className="text-lg font-semibold">
          <FormattedMessage id="are_you_sure" defaultMessage="Are you sure" />?
        </div>

        <div className=" text-sm pt-4 flex-col flex items-center justify-center">
          <div>
            <FormattedMessage
              id="price_impact_is_about"
              defaultMessage="Price impact is about"
            />
          </div>
          <div className="pt-1">
            <span className="text-error">
              -{toPrecision(priceImpactValue, 2)}%
            </span>
            <span className="text-error">
              {' '}
              {`(${
                Number(priceImpactValue) < 0
                  ? '0'
                  : '-' +
                    toInternationalCurrencySystemLongString(
                      scientificNotationToString(
                        multiply(from, divide(priceImpactValue, '100'))
                      ),
                      3
                    )
              } ${toRealSymbol(tokenIn.symbol)})`}{' '}
            </span>
          </div>
        </div>
        <div className="text-sm pb-6 pt-1">
          <FormattedMessage
            id="make_sure_you_understand_what_you_do"
            defaultMessage="Make sure you understand what you do"
          />
          !
        </div>

        <div className="flex items-center pb-2">
          <OutlineButton
            onClick={props.onRequestClose}
            className="text-sm w-auto text-center mx-2"
            padding="px-4 py-1"
          >
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </OutlineButton>
          <SolidButton
            onClick={(e) => {
              setButtonLoading(true);
              onSwap();
            }}
            className="text-sm w-auto text-center"
            padding="px-4 py-1.5"
            loading={buttonLoading}
            disabled={buttonLoading}
          >
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <span>
                  <FormattedMessage id="yes_swap" defaultMessage="Yes, swap" />!
                </span>
              )}
            />
          </SolidButton>
        </div>
      </Card>
    </Modal>
  );
}

export function DoubleCheckModalLimitOld(
  props: ReactModal.Props & {
    tokenIn: TokenMetadata;
    tokenOut: TokenMetadata;
    from: string;
    onSwap: (e?: any) => void;
    rateDiff: string;
  }
) {
  const { tokenIn, tokenOut, from, onSwap, rateDiff } = props;

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  if (!from || !tokenIn || !tokenOut) return null;

  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          position: 'fixed',
          top: '50%',
        },
      }}
    >
      <Card
        padding="p-6"
        bgcolor="bg-cardBg"
        className="text-white border border-gradientFromHover outline-none flex flex-col items-center"
        width="xs:w-90vw md:w-90vw lg:w-30vw"
      >
        <div
          className="ml-2 cursor-pointer p-1 self-end"
          onClick={props.onRequestClose}
        >
          <ModalClose />
        </div>

        <div className="pb-6">
          <QuestionIcon color="#FFFFFF" />
        </div>

        <div className="text-lg font-semibold">
          <FormattedMessage id="are_you_sure" defaultMessage="Are you sure" />?
        </div>

        <div className=" text-base pt-4 text-center mb-10">
          <span>
            <FormattedMessage
              id="limit_order_price_is"
              defaultMessage="Limit order price is"
            />
          </span>

          <span className="text-error font-bold mx-1">
            {Math.abs(Number(rateDiff))}%
          </span>

          <span className="mr-1 text-error font-bold">
            <FormattedMessage id={'below'} defaultMessage="below" />
          </span>

          <span>
            <FormattedMessage
              id="the_market_price"
              defaultMessage={'the market price'}
            />
            .
          </span>
        </div>

        <div className="flex items-center pb-2">
          <OutlineButton
            onClick={props.onRequestClose}
            className="text-sm w-auto text-center mx-2 rounded-lg"
            padding="px-4 py-1"
          >
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </OutlineButton>
          <SolidButton
            onClick={(e) => {
              setButtonLoading(true);
              onSwap();
            }}
            className="text-sm w-auto text-center rounded-lg"
            padding="px-4 py-1.5"
            loading={buttonLoading}
            disabled={buttonLoading}
          >
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <span>
                  <FormattedMessage
                    id="yes_create_order"
                    defaultMessage="Yes, create order"
                  />
                  !
                </span>
              )}
            />
          </SolidButton>
        </div>
      </Card>
    </Modal>
  );
}
export function DoubleCheckModalLimit(
  props: ReactModal.Props & {
    tokenIn: TokenMetadata;
    tokenOut: TokenMetadata;
    from: string;
    onSwap: (e?: any) => void;
    rateDiff: string;
    tokenInAmount: string;
    tokenOutAmount: string;
    rate: string;
    selectedPool: string;
  }
) {
  const {
    tokenIn,
    tokenOut,
    from,
    onSwap,
    rateDiff,
    tokenInAmount,
    tokenOutAmount,
    rate,
    selectedPool,
    isOpen,
  } = props;

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [poolDetail, setPoolDetail] = useState<PoolInfo>();

  useEffect(() => {
    get_pool_from_cache(selectedPool).then((pool) => {
      setPoolDetail(pool);
    });
  }, [selectedPool]);

  useEffect(() => {
    if (!isOpen) {
      setButtonLoading(false);
    }
  }, [isOpen]);

  if (!from || !tokenIn || !tokenOut || !poolDetail) return null;

  const buyToken = tokenIn.id === poolDetail.token_x ? tokenIn : tokenOut;
  const sellToken = tokenIn.id === poolDetail.token_x ? tokenOut : tokenIn;

  const sort = TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1;

  function displayAmount(amount: string) {
    const amountBig = new BigNumber(amount || '0');
    if (amountBig.isEqualTo(0)) {
      return '0';
    } else if (amountBig.isLessThan('0.00000001')) {
      return '<0.00000001';
    } else {
      return toPrecision(amount, 8);
    }
  }
  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          position: 'fixed',
          top: '50%',
        },
      }}
    >
      <Card
        padding="p-6"
        bgcolor="bg-cardBg"
        className="text-white border border-gradientFromHover outline-none flex flex-col items-center"
        width="xsm:w-90vw lg:w-25vw lg:min-w-420px"
      >
        <div className="w-full flex items-center justify-between">
          <span className="text-lg text-white gotham_bold">
            <FormattedMessage id="confirm_order"></FormattedMessage>2
          </span>
          <ModalClose
            onClick={props.onRequestClose}
            className="cursor-pointer"
          />
        </div>
        <div className="flex items-center mt-9">
          <Icon token={tokenIn} size={'8'}></Icon>
          <ArrowRight className="mx-4"></ArrowRight>
          <Icon token={tokenOut} size={'8'}></Icon>
        </div>
        <div className="w-full flex items-center justify-between mt-5">
          <span className="text-v3SwapGray text-sm">
            <FormattedMessage id="you_Sell"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span className="text-sm text-white mr-1.5">
              {displayAmount(tokenInAmount)}
            </span>
            <span className="bg-menuMoreBgColor p-1 rounded">
              {tokenIn.symbol}
            </span>
          </div>
        </div>
        <div className="w-full flex items-center justify-between mt-3">
          <span className="text-v3SwapGray text-sm">
            <FormattedMessage id="to_Buy"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span className="text-sm text-white mr-1.5">
              {displayAmount(tokenOutAmount)}
            </span>
            <span className="bg-menuMoreBgColor p-1 rounded">
              {tokenOut.symbol}
            </span>
          </div>
        </div>
        <div className="w-full flex items-center justify-between mt-3">
          <span className="text-v3SwapGray text-sm">
            <FormattedMessage id="at_Price"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span className="text-sm text-white mr-1.5">
              {displayAmount(
                (sort ? sellToken : buyToken).id !== tokenOut.id
                  ? scientificNotationToString(
                      new Big(1)
                        .div(new Big(Number(rate) === 0 ? '1' : rate))
                        .toString()
                    )
                  : rate
              )}
            </span>
            <span className="bg-menuMoreBgColor p-1 rounded">
              {`${toRealSymbol(
                sort ? sellToken?.symbol : buyToken.symbol
              )}/${toRealSymbol(sort ? buyToken.symbol : sellToken.symbol)}`}
            </span>
          </div>
        </div>
        {Number(rateDiff) <= -10 ? (
          <div className="flex items-center justify-center whitespace-nowrap flex-wrap border border-warnRedColor p-3 rounded-lg text-sm text-redwarningColor mt-5 w-full">
            <span>
              <FormattedMessage
                id="limit_order_price_is"
                defaultMessage="Limit order price is"
              />
            </span>

            <span className="text-error mx-1 gotham_bold">
              {Math.abs(Number(rateDiff))}%
            </span>

            <span className="mr-1 text-error gotham_bold">
              <FormattedMessage id={'below'} defaultMessage="below" />
            </span>

            <span>
              <FormattedMessage
                id="the_market_price"
                defaultMessage={'the market price'}
              />
            </span>
          </div>
        ) : null}
        <div className="flex items-center w-full mt-5">
          <GradientButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (buttonLoading) return;

              // setButtonLoading(true);
              onSwap();
            }}
            className="btn-DoubleCheckModalLimit text-base text-center rounded-lg h-10 gotham_bold w-full"
            loading={buttonLoading}
            disabled={buttonLoading}
          >
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <span>
                  <FormattedMessage id="confirm" />
                </span>
              )}
            />
          </GradientButton>
        </div>
      </Card>
    </Modal>
  );
}

export function SkyWardModal(props: ReactModal.Props) {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          position: 'fixed',
          top: '50%',
        },
      }}
    >
      <Card
        padding="p-6"
        bgcolor="bg-cardBg"
        className="text-white border border-gradientFromHover outline-none flex flex-col items-center"
        style={{
          width: '356px',
        }}
      >
        <div
          className="ml-2 cursor-pointer p-1 self-end"
          onClick={props.onRequestClose}
        >
          <ModalClose />
        </div>

        <div>
          <HeavyWarning />
        </div>

        <div className="text-primaryText text-sm px-1 py-7">
          Note: the Skyward contract suffered a contract exploit, rendering the
          Skyward treasury worthless. More details about the{' '}
          <a
            className={`cursor-pointer  text-gradientFrom ${
              hover ? 'font-bold underline' : 'font-normal'
            } `}
            href="https://twitter.com/skywardfinance/status/1587947957789331457?s=20&t=Of-CxqeTS162x11y0JRR_w"
            target={'_blank'}
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            exploit
          </a>
          . You should be aware of the risks and prepared to potentially lose
          all of the money invested for trading such a token.
        </div>

        <div className="flex items-center w-full pb-2">
          <SolidButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onRequestClose(e);
            }}
            className="text-sm w-full font-bold text-center"
            padding="px-4 py-2"
          >
            <span>
              <FormattedMessage
                id="I_understand"
                defaultMessage="I understand"
              />
            </span>
          </SolidButton>
        </div>
      </Card>
    </Modal>
  );
}
