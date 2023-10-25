import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { PerpOrSpot } from '../../utiles';

export const REF_ORDERLY_NEW_USER_TIP = 'REF_ORDERLY_NEW_USER_TIP_KEY';

const GuideLine = () => {
  return (
    <svg
      width="24"
      height="57"
      viewBox="0 0 24 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        opacity="0.2"
        cx="12"
        cy="12"
        r="12"
        transform="matrix(1 0 0 -1 0 57)"
        fill="#00D6AF"
      />
      <circle
        cx="7"
        cy="7"
        r="7"
        transform="matrix(1 0 0 -1 5 52)"
        fill="#00D6AF"
      />
      <line
        x1="11.5"
        y1="32"
        x2="11.5"
        y2="2.18557e-08"
        stroke="#00D6AF"
        stroke-dasharray="2 2"
      />
    </svg>
  );
};

export function NewUserTip(props: {
  style?: React.CSSProperties;
  type: 'perp-pc' | 'spot-pc' | 'perp-mobile' | 'spot-mobile';
}) {
  const { type } = props;

  const { symbol } = useOrderlyContext();

  const symbolType = PerpOrSpot(symbol);

  const { accountId } = useWalletSelector();

  const tipKey = `REF_FI_NEW_USER_TIP_CHECK_${symbolType}` + ':' + accountId;

  const { newUserTip } = useOrderlyContext();

  const haveCheck = localStorage.getItem(tipKey) === '1';

  const [show, setShow] = useState<boolean>(true);

  if (haveCheck || !newUserTip || !show) return null;

  return (
    <div
      className={`absolute font-gotham ${
        type == 'spot-pc'
          ? '-right-1/2 top-7'
          : type === 'perp-pc'
          ? 'right-0 top-5'
          : type === 'perp-mobile'
          ? ' bottom-5 '
          : 'right-0 bottom-5'
      } 
      
        ${
          type === 'perp-mobile' || type === 'spot-mobile'
            ? 'flex-col-reverse'
            : 'flex-col'
        }
      
      flex text-black text-sm`}
      style={{
        width: '265px',
        zIndex: 70,
        height: '100px',
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <span
        className={
          type === 'perp-pc'
            ? 'transform relative right-14 rotate-180'
            : type === 'spot-pc'
            ? 'transform rotate-180 -translate-x-1/2'
            : type === 'perp-mobile'
            ? '  max-w-max -right-1/2 relative'
            : ' max-w-max relative -right-1/2'
        }
        style={{
          right: type === 'spot-mobile' ? '-60%' : '',
        }}
      >
        <GuideLine></GuideLine>
      </span>

      <div
        className="rounded-2xl bg-gradientFromHover px-5 py-4 flex flex-col items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(false);
          localStorage.setItem(tipKey, '1');
        }}
      >
        {(type == 'perp-pc' || type == 'perp-mobile') && (
          <span>
            <FormattedMessage
              id="orderly_new_user_tip"
              defaultMessage={
                'Check Balance and deposit <strong>USDC.e</strong>  to begin your trading journey.'
              }
              values={{
                //   @ts-ignore
                strong: (...chunks) => (
                  <span className="font-gothamBold">{chunks}</span>
                ),
              }}
            ></FormattedMessage>
          </span>
        )}

        {(type == 'spot-pc' || type === 'spot-mobile') && (
          <span>
            <FormattedMessage
              id="orderly_new_usr_spot_tip"
              defaultMessage={'Deposit assets to begin your trading journey.'}
              values={{
                //   @ts-ignore
                strong: (...chunks) => (
                  <span className="font-gothamBold">{chunks}</span>
                ),
              }}
            ></FormattedMessage>
          </span>
        )}

        <div className="rounded-md border border-black px-2 py-1 frcc cursor-pointer ">
          <FormattedMessage
            id="got_it"
            defaultMessage={'Got it'}
          ></FormattedMessage>
          !
        </div>
      </div>
    </div>
  );
}
