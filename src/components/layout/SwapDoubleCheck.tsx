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
          <ErrorTriangle expand />
        </div>

        <div className="text-base font-semibold">
          <FormattedMessage id="are_you_sure" defaultMessage="Are you sure" />?
        </div>

        <div className=" text-xs pt-4 flex-col flex items-center justify-center">
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
        <div className="text-xs pb-6 pt-1">
          <FormattedMessage
            id="make_sure_you_understand_what_you_do"
            defaultMessage="Make sure you understand what you do"
          />
          !
        </div>

        <div className="flex items-center pb-2">
          <OutlineButton
            onClick={props.onRequestClose}
            className="text-xs w-auto text-center mx-2"
            padding="px-4 py-1"
          >
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </OutlineButton>
          <SolidButton
            onClick={(e) => {
              setButtonLoading(true);
              onSwap();
            }}
            className="text-xs w-auto text-center"
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
