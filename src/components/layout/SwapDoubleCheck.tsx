import React, { useState, useContext } from 'react';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import {
  toPrecision,
  multiply,
  divide,
  scientificNotationToString,
} from '../../utils/numbers';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ButtonTextWrapper,
  OutlineButton,
  SolidButton,
} from '../../components/button/Button';
import { WarnTriangle, ErrorTriangle } from '../../components/icon/SwapRefresh';
import ReactModal from 'react-modal';
import Modal from 'react-modal';
import { Card } from '../../components/card/Card';
import { ModalClose } from '../../components/icon';

import { EstimateSwapView, PoolMode, swap } from '~services/swap';

export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';

export const QuestionIcon = () => {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="22" cy="22" r="21" stroke="#FF6B6B" />
      <path
        d="M21.7051 8.00012C17.1946 8.5008 14.6887 10.4559 14.1874 13.8636C14.0871 14.9665 14.6382 15.5681 15.8414 15.668C16.4423 15.7686 16.9436 15.3174 17.3447 14.3148C17.9462 12.2099 19.3978 11.1574 21.7051 11.1574C24.5103 11.3577 26.0139 12.761 26.2163 15.3672C26.2163 17.7732 24.5834 18.1653 23.6963 18.8908C22.5724 19.8104 21.8373 20.7431 20.9375 22.324C20.1814 23.6523 20.0511 26.4938 20.0511 26.4938C20.0511 27.6967 20.601 28.2982 21.7052 28.2982C22.7059 28.2982 23.2589 27.6967 23.3595 26.4938C23.3595 26.4938 23.492 23.3049 24.7795 21.8948C26.2387 20.2967 29.7243 19.1762 29.8245 15.0667C29.4235 10.7564 26.717 8.40086 21.7051 8.00012ZM21.7051 29.8146C20.5493 29.8146 19.6127 30.7518 19.6127 31.9071C19.6127 33.0629 20.5493 33.9998 21.7051 33.9998C22.861 33.9998 23.7979 33.063 23.7979 31.9071C23.7979 30.7518 22.861 29.8146 21.7051 29.8146Z"
        fill="#FF6B6B"
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
  const { tokenIn, tokenOut, from, onSwap, priceImpactValue } = props;

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
                    toPrecision(
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
