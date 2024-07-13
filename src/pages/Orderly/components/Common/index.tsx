import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  GrayBgBox,
  NearIcon,
  OrderStateOutline,
  ArrowCurve,
  OrderSmile,
  SpinIcon,
  CheckFlow,
  OrderStateOutlineBlack,
  OrderPopUpCheck,
  GrayBgBoxMobile,
  RefToOrderlyPortFolio,
} from './Icons';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { parseFullSymbol } from '../../datafeed/helpers';
import { toast, ToastContainer, cssTransition } from 'react-toastify';
import { TokenMetadata } from '../../orderly/type';
import { parseSymbol } from '../RecentTrade';
import 'react-toastify/dist/ReactToastify.css';

import { HiDownload } from '../../../../components/reactIcons';
import { formatTimeDate } from '../OrderBoard/index';
import { MyOrder } from '../../orderly/type';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { digitWrapper, numberWithCommas } from '../../utiles';
import { isMobile } from '../../../../utils/device';
import { REF_ORDERLY_AGREE_CHECK } from '../UserBoard/index';
import { useClientMobile } from '../../../../utils/device';
import {
  get_orderly_public_key_path,
  tradingKeyMap,
} from '../../../../pages/Orderly/orderly/utils';
import { FormattedMessage, useIntl } from 'react-intl';

export function TokenIcon({ src }: { src: any }) {
  return (
    <img src={src} alt="" className={`h-5 w-5 flex-shrink-0 rounded-full `} />
  );
}

export function QuestionMark(props: {
  color?: 'bright' | 'dark';
  colorhex?: string;
  className?: string;
}) {
  const { color, colorhex } = props;

  const [status, setStatus] = useState(false);
  return (
    <label
      {...props}
      onMouseOver={() => {
        setStatus(true);
      }}
      onMouseLeave={() => {
        setStatus(false);
      }}
    >
      {status || color === 'bright' ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.4375 9.19141C5.4375 9.50207 5.68934 9.75391 6 9.75391C6.31066 9.75391 6.5625 9.50207 6.5625 9.19141C6.5625 8.88074 6.31066 8.62891 6 8.62891C5.68934 8.62891 5.4375 8.88074 5.4375 9.19141Z"
            fill="white"
          />
          <path
            d="M6 11.25C3.105 11.25 0.75 8.895 0.75 6C0.75 3.105 3.105 0.75 6 0.75C8.895 0.75 11.25 3.105 11.25 6C11.25 8.895 8.895 11.25 6 11.25ZM6 1.50336C3.5205 1.50336 1.50336 3.5205 1.50336 6C1.50336 8.47913 3.5205 10.4966 6 10.4966C8.47913 10.4966 10.4966 8.47914 10.4966 6C10.4966 3.5205 8.47913 1.50336 6 1.50336Z"
            fill="white"
          />
          <path
            d="M6 7.89466C5.79299 7.89466 5.625 7.72666 5.625 7.51967V6.88554C5.625 6.27203 6.09374 5.8033 6.50774 5.38967C6.8111 5.08592 7.12499 4.77242 7.12499 4.5223C7.12499 3.89717 6.62024 3.38867 6 3.38867C5.36926 3.38867 4.875 3.87542 4.875 4.4968C4.875 4.7038 4.70701 4.87178 4.5 4.87178C4.29299 4.87178 4.125 4.70378 4.125 4.49678C4.125 3.4723 4.9661 2.63867 6 2.63867C7.0339 2.63867 7.875 3.48355 7.875 4.5223C7.875 5.08367 7.44937 5.50891 7.038 5.9203C6.71175 6.2458 6.37501 6.58255 6.37501 6.88516V7.51928C6.37501 7.72629 6.20701 7.89466 6 7.89466Z"
            fill="white"
          />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.4375 9.19141C5.4375 9.50207 5.68934 9.75391 6 9.75391C6.31066 9.75391 6.5625 9.50207 6.5625 9.19141C6.5625 8.88074 6.31066 8.62891 6 8.62891C5.68934 8.62891 5.4375 8.88074 5.4375 9.19141Z"
            fill={colorhex || '#7E8A93'}
          />
          <path
            d="M6 11.25C3.105 11.25 0.75 8.895 0.75 6C0.75 3.105 3.105 0.75 6 0.75C8.895 0.75 11.25 3.105 11.25 6C11.25 8.895 8.895 11.25 6 11.25ZM6 1.50336C3.5205 1.50336 1.50336 3.5205 1.50336 6C1.50336 8.47913 3.5205 10.4966 6 10.4966C8.47913 10.4966 10.4966 8.47914 10.4966 6C10.4966 3.5205 8.47913 1.50336 6 1.50336Z"
            fill={colorhex || '#7E8A93'}
          />
          <path
            d="M6 7.89466C5.79299 7.89466 5.625 7.72666 5.625 7.51967V6.88554C5.625 6.27203 6.09374 5.8033 6.50774 5.38967C6.8111 5.08592 7.12499 4.77242 7.12499 4.5223C7.12499 3.89717 6.62024 3.38867 6 3.38867C5.36926 3.38867 4.875 3.87542 4.875 4.4968C4.875 4.7038 4.70701 4.87178 4.5 4.87178C4.29299 4.87178 4.125 4.70378 4.125 4.49678C4.125 3.4723 4.9661 2.63867 6 2.63867C7.0339 2.63867 7.875 3.48355 7.875 4.5223C7.875 5.08367 7.44937 5.50891 7.038 5.9203C6.71175 6.2458 6.37501 6.58255 6.37501 6.88516V7.51928C6.37501 7.72629 6.20701 7.89466 6 7.89466Z"
            fill={colorhex || '#7E8A93'}
          />
        </svg>
      )}
    </label>
  );
}

export function CheckBox({
  check,
  setCheck,
}: {
  check: boolean;
  setCheck: () => void;
}) {
  return (
    <div
      className="w-3 h-3 rounded-full  flex items-center justify-center cursor-pointer"
      style={{
        border: '1px solid rgba(0, 198, 162, 0.5)',
        height: '13px',
        width: '13px',
      }}
      onClick={() => {
        setCheck();
      }}
    >
      {check && (
        <div
          className=" rounded-full "
          style={{
            height: '9px',
            width: '9px',
            background: '#00D6AF',
          }}
        ></div>
      )}
    </div>
  );
}

export function ErrorTip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-errorTip relative rounded overflow-hidden text-sm px-6 py-3 ${className} `}
    >
      <div className="absolute w-1 bg-textRed bottom-0 h-full left-0"></div>

      <span className="text-textRed">{text}</span>
    </div>
  );
}

export function ConnectWallet({ onClick }: { onClick: () => void }) {
  const intl = useIntl();

  return (
    <button
      className="text-base min-w-fit py-3 px-10 relative w-p240 xs:w-full xs:py-2 bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center

    "
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex-shrink-0">
        <NearIcon />
      </div>

      <span className="whitespace-nowrap ml-3  hover:bg-">
        {intl.formatMessage({
          id: 'connect_wallet',
          defaultMessage: 'Connect Wallet',
        })}
      </span>
    </button>
  );
}

export function ConnectWalletPorfolio({ onClick }: { onClick: () => void }) {
  const intl = useIntl();

  return (
    <button
      className="text-base min-w-fit py-3 px-6 relative  xs:w-full xs:py-2 bg-buyGradientGreen rounded-3xl text-white font-bold flex items-center justify-center"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex-shrink-0">
        <NearIcon />
      </div>

      <span className="whitespace-nowrap ml-3  hover:bg-">
        {intl.formatMessage({
          id: 'connect_wallet',
          defaultMessage: 'Connect Wallet',
        })}
      </span>
    </button>
  );
}

export function ConfirmButton({ onClick }: { onClick: () => void }) {
  const intl = useIntl();
  return (
    <button
      className="text-base min-w-fit py-3 px-10 relative w-p240 xs:w-full xs:py-2 bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center

    "
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="whitespace-nowrap ml-3  hover:bg-">
        {intl.formatMessage({
          id: 'confirm',
          defaultMessage: 'Confirm',
        })}
      </span>
    </button>
  );
}

export function RegisterButton({
  onClick,
  storageEnough,
  spin,
  check,
  isOpenMobile,
  setIsOpenMobile,
  userExist,
  setCheck,
  onPortfolio,
}: {
  onClick: () => void;
  spin?: boolean;
  storageEnough: boolean;
  check: boolean;
  setCheck?: (c: boolean) => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (isOpen: boolean) => void;
  userExist: boolean;
  onPortfolio?: boolean;
}) {
  const [spinNow, setSpinNow] = useState<boolean>(!!spin);

  const isMobile = useClientMobile();

  const storedAgree = !!localStorage.getItem(REF_ORDERLY_AGREE_CHECK);

  useEffect(() => {
    if (check) {
      setSpinNow(true);
      onClick();
    }
  }, [check]);

  useEffect(() => {
    setSpinNow(!!spin);
  }, [spin]);
  const intl = useIntl();
  return (
    <div className="flex flex-col items-center xs:w-full  relative ">
      {!isOpenMobile ? null : (
        <>
          <div className="lg:px-6 xs:font-bold text-white pb-5 text-center text-base">
            {spinNow
              ? null
              : userExist
              ? intl.formatMessage({
                  id: 'connect_to_orderly_account',
                  defaultMessage:
                    "You need to (re)connect your Orderly account to use Ref's Orderbook.",
                })
              : intl.formatMessage({
                  id: 'first_register_orderly_tip',
                  defaultMessage:
                    'Your wallet must first be registered with Orderly in order to use the Orderbook.',
                })}
          </div>

          <div
            className={
              !isMobile || !isOpenMobile || check
                ? 'hidden'
                : 'h-48 overflow-auto pt-2 mb-2 text-primaryText text-sm flex flex-col'
            }
          >
            <div>
              <FormattedMessage
                id="more_order_book_page_detail"
                values={{
                  br: <br />,
                }}
                defaultMessage={
                  'This Orderbook page is powered by Orderly Network, users are strongly encouraged to do their own research before connecting their wallet and/or placing any orders.{br} Ref Finance does not guarantee the security of the systems, smart contracts, and any funds deposited or sent to those systems and contracts.{br} Neither Ref Finance nor Orderly Network is responsible for any profit or loss of investment users made through this Orderbook page.'
                }
              />
            </div>

            <div className="py-5">
              {!userExist && (
                <span className="mr-1">
                  {intl.formatMessage({
                    id: 'must_register_tip',
                    defaultMessage:
                      'Your wallet must be registered with Orderly to trade on their system.',
                  })}
                </span>
              )}{' '}
              {intl.formatMessage({
                id: 'learn_more_about',
                defaultMessage: 'Learn more about',
              })}
              <a
                className="underline text-primary ml-1"
                href="https://orderly.org/"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Orderly Network
              </a>
              {intl.formatMessage({
                id: 'learn_more_about_zh',
                defaultMessage: '.',
              })}
            </div>

            <div>
              {intl.formatMessage({
                id: 'by_click_confirm',
                defaultMessage:
                  'By clicking "Confirm", you confirm that you have comprehensively reviewed and comprehended the contents aforementioned',
              })}
            </div>
          </div>
        </>
      )}
      {((!userExist && check) || (storedAgree && storageEnough)) && (
        <div
          className={`flex items-start  pb-5 xs:pb-3  text-sm relative  text-white flex-col`}
        >
          <div className="relative mb-3 flex items-center">
            <div className="mr-2">
              <CheckFlow checked={!!storageEnough}></CheckFlow>
            </div>

            <div>
              {intl.formatMessage({
                id: 'deposit_storage_fee',
                defaultMessage: 'Deposit Storage Fee',
              })}
            </div>
          </div>

          <div className="relative flex mb-5 items-center">
            <div className="mr-2">
              <CheckFlow checked={false}></CheckFlow>
            </div>

            <div>
              {' '}
              {intl.formatMessage({
                id: 'register_orderly_account',
                defaultMessage: 'Register Orderly Account',
              })}
            </div>
          </div>

          <div
            className="w-4 transform rotate-90 absolute top-6"
            style={{
              border: '1px dashed #566069 ',
              left: '-2px',
            }}
          ></div>
        </div>
      )}

      <button
        className={`text-base min-w-fit xs:w-full xs:py-2  ${
          isMobile && !isOpenMobile ? 'mb-2' : 'mb-5 xs:mb-3'
        } py-3   relative  ${
          spinNow ? 'opacity-30 cursor-not-allowed' : ''
        } bg-buyGradientGreen  ${
          onPortfolio ? 'rounded-3xl w-p200' : 'rounded-lg w-p240'
        } text-white font-bold flex items-center justify-center
      
    `}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          onClick();

          if (!check) return;

          if (spinNow) return;

          setSpinNow(true);
        }}
        type="button"
        disabled={spinNow}
      >
        {onPortfolio && !spinNow ? (
          <>
            <RefToOrderlyPortFolio />
          </>
        ) : (
          <>
            {spinNow && <SpinIcon />}
            <span className={`whitespace-nowrap ml-3  `}>
              {userExist && !storedAgree
                ? !check
                  ? isOpenMobile && !check
                    ? intl.formatMessage({
                        id: 'confirm',
                        defaultMessage: 'Confirm',
                      })
                    : intl.formatMessage({
                        id: 'connect_to_orderly',
                        defaultMessage: 'Connect to Orderly',
                      })
                  : intl.formatMessage({
                      id: 'Connecting',
                      defaultMessage: 'Connecting',
                    })
                : isOpenMobile && !check
                ? intl.formatMessage({
                    id: 'confirm',
                    defaultMessage: 'Confirm',
                  })
                : intl.formatMessage({
                    id: 'register',
                    defaultMessage: 'Register',
                  })}
            </span>
          </>
        )}
      </button>
      {isMobile || onPortfolio ? null : (
        <div className="text-sm  text-center text-white flex items-center lg:px-6 justify-center">
          {spinNow
            ? null
            : !userExist
            ? `* ${intl.formatMessage({
                id: 'register_deposit_tip',
                defaultMessage: 'Registering will require a storage deposit.',
              })}`
            : `* ${intl.formatMessage({
                id: 'increase_storage_deposit',
                defaultMessage:
                  'You may need to increase the storage deposit on your Orderly account.',
              })}`}
        </div>
      )}
    </div>
  );
}

export function FlexRowBetween({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${className}  items-center`}>
      {children}
    </div>
  );
}

export function FlexRow({
  onClick,
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <div
      className={`flex items-center   ${className}`}
      onClick={() => {
        onClick && onClick();
      }}
      title={title}
    >
      {children}
    </div>
  );
}

export function FlexRowStart({
  onClick,
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex items-start   ${className}`}
      onClick={() => {
        onClick && onClick();
      }}
    >
      {children}
    </div>
  );
}

export function orderPopUp({
  orderType,
  side,
  symbolName,
  price,
  size,
  tokenIn,
  timeStamp,
  filled,
  order,
}: {
  orderType: 'Limit' | 'Market';
  symbolName: string;
  side: 'Buy' | 'Sell';
  size: string;
  price: string;
  tokenIn: TokenMetadata | undefined;
  timeStamp?: number;
  filled?: boolean;
  order: MyOrder;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(symbolName);

  const mobileDevice = isMobile();

  toast(
    <div className={`flex-col  px-2 pt-4 text-sm text-dark5  w-full`}>
      <FlexRowBetween className="relative bottom-3 w-full">
        <div className="flex text-sm items-center">
          <div
            className={`border border-dark5 whitespace-nowrap rounded-lg font-bold px-2 mr-1.5  ${
              side === 'Buy' ? 'bg-greenLight' : 'bg-redLight'
            }`}
          >
            <FormattedMessage id={side.toLowerCase()} defaultMessage={side} />
          </div>

          <div className="text-dark5 font-bold text-lg">
            {orderType === 'Market' ? (
              <FormattedMessage
                id="market_order_filled"
                defaultMessage={'Market Order Filled'}
              />
            ) : filled ? (
              <FormattedMessage
                id="limit_order_filled"
                defaultMessage={'Limit Order Filled'}
              />
            ) : (
              <FormattedMessage
                id="limit_order_created"
                defaultMessage={'Limit Order Created'}
              />
            )}
            !
          </div>
        </div>

        <div className="flex -mt-1 items-center">
          <span>
            {filled || orderType === 'Market' ? (
              <FormattedMessage id="Filled" defaultMessage={'Filled'} />
            ) : (
              <FormattedMessage id="open" />
            )}
          </span>
          <span
            className="ml-1 relative  flex items-center justify-center"
            style={{
              height: '14px',
              width: '14px',
            }}
          >
            <div className="absolute top-0 left-0  ">
              {(filled || orderType === 'Market') && (
                <OrderPopUpCheck className="absolute left-0.5 top-0.5" />
              )}
              <OrderStateOutlineBlack />
            </div>

            <div
              className=""
              style={{
                height: '9px',
                width: '9px',
              }}
            >
              {order.executed > 0 && (
                <CircularProgressbar
                  styles={buildStyles({
                    pathColor: '#273640',
                    strokeLinecap: 'butt',
                    trailColor: 'transparent',
                  })}
                  background={false}
                  strokeWidth={50}
                  value={order.executed}
                  maxValue={order.quantity}
                />
              )}
            </div>
          </span>
        </div>
      </FlexRowBetween>

      <FlexRowStart className="mt-6 flex-wrap ">
        {
          <FormattedMessage
            id={`to_${side.toLowerCase()}`}
            defaultMessage={`To ${side}`}
          />
        }
        <span className="mx-1 font-bold">{`${size} ${symbolFrom}`}</span>
        <FormattedMessage id="at_orderly" defaultMessage={'at'} />
        <span className="ml-1 font-bold">{`${price} ${symbolTo}`}</span>
      </FlexRowStart>

      {timeStamp !== undefined && (
        <div className="mt-2 pb-8 items-start text-start">
          {formatTimeDate(timeStamp)}
        </div>
      )}
    </div>,
    {
      closeOnClick: true,
      hideProgressBar: true,
      position: 'bottom-right',
      progress: undefined,
      autoClose: 3000,
      closeButton: false,
      className: 'orderly-order-toast',
      style: {
        background:
          side === 'Buy'
            ? 'linear-gradient(180deg, #5EFFEC 0%, #9CFFE7 100%)'
            : 'linear-gradient(180deg, #FFA5DB 0%, #FFDCF1 100%)',
        boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.25)',
        borderRadius: '16px',
        zIndex: 9999,
        right: mobileDevice ? 'none' : '20px',
        width: mobileDevice ? '100%' : '340px',
        bottom: mobileDevice ? 'none' : '-70px',
      },
    }
  );

  if (
    (order.type === 'FOK' ||
      order.type === 'IOC' ||
      order.type === 'POST_ONLY') &&
    order.status === 'CANCELLED'
  ) {
    return orderEditPopUpSuccess({
      side,
      symbolName,
      price,
      size,
      cancel: true,
      sig: true,
    });
  }
}

export function DepositButton(props: any) {
  const intl = useIntl();
  return (
    <div
      className="relative  xs:left-2  flex items-center justify-center text-white"
      style={{
        width: '92px',
      }}
      {...props}
    >
      <GrayBgBox
        className={`absolute   cursor-pointer ${
          isMobile() ? 'transform scale-x-110 ' : ''
        } left-0 -bottom-0.5 z-10`}
      ></GrayBgBox>

      <div className="flex cursor-pointer items-center relative z-40 font-normal">
        <span className="text-13px">
          {intl.formatMessage({
            id: 'deposit',
            defaultMessage: 'Deposit',
          })}
        </span>

        <HiDownload className="ml-1" />
      </div>
    </div>
  );
}

export function DepositButtonMobile(props: any) {
  const intl = useIntl();
  return (
    <div
      className="relative w-1/2    flex items-center justify-center text-white"
      {...props}
    >
      <GrayBgBoxMobile
        className={`  cursor-pointer transform   left-0 -bottom-0.5 z-10`}
      ></GrayBgBoxMobile>

      <div className="flex cursor-pointer items-center absolute z-40 font-normal">
        <span className="text-13px font-bold">
          {intl.formatMessage({
            id: 'deposit',
            defaultMessage: 'Deposit',
          })}
        </span>

        <HiDownload className="ml-1" />
      </div>
    </div>
  );
}

export function WithdrawButton(props: any) {
  const intl = useIntl();

  return (
    <div
      className="relative  flex xs:left-4 items-center justify-center text-white"
      style={{
        width: '92px',
      }}
      {...props}
    >
      <GrayBgBox
        className={`absolute  cursor-pointer transform rotate-180 ${
          isMobile() ? ' scale-x-110' : ''
        } left-0 -bottom-0.5 z-10`}
      ></GrayBgBox>

      <div className="flex  cursor-pointer items-center relative z-40 font-normal">
        <span className="text-13px">
          {intl.formatMessage({
            id: 'withdraw',
            defaultMessage: 'Withdraw',
          })}
        </span>

        <ArrowCurve />
      </div>
    </div>
  );
}

export function WithdrawButtonMobile(props: any) {
  const intl = useIntl();
  return (
    <div
      className="relative w-1/2 flex left-2  items-center justify-center text-white"
      {...props}
    >
      <GrayBgBoxMobile
        className={` cursor-pointer transform rotate-180  relative right-2   z-10`}
      ></GrayBgBoxMobile>

      <div className="flex  cursor-pointer absolute items-center z-40 font-normal">
        <span className="text-13px font-bold">
          {intl.formatMessage({
            id: 'withdraw',
            defaultMessage: 'Withdraw',
          })}
        </span>

        <ArrowCurve />
      </div>
    </div>
  );
}

export function getElementTop(element: any) {
  var actualTop = element.offsetTop;
  var current = element.offsetParent;

  while (current !== null) {
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }

  return actualTop;
}

export function MyOrderTip({
  price,
  quantity,
  scrollTagID,
}: {
  price: number;
  quantity: number;
  scrollTagID: 'buy-order-book-panel' | 'sell-order-book-panel';
}) {
  const [showDetail, setShowDetail] = useState(false);

  const intl = useIntl();

  const id = `order-smile-${price}-${quantity}`;

  function getElementTop(element: any) {
    var actualTop = element.offsetTop;
    var current = element.offsetParent;

    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent;
    }

    return actualTop;
  }

  function getElementLeft(element: any) {
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;

    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }

    return actualLeft;
  }

  function getPosition() {
    const smileEl = document.getElementById(id);

    const orderEl = document.getElementById(scrollTagID);

    if (!smileEl || !orderEl) return;

    const top = getElementTop(smileEl);

    const left = getElementLeft(smileEl);

    const scrollTop = orderEl.scrollTop;

    return {
      top: top - scrollTop - document.documentElement.scrollTop,
      left: left + 20,
    };
  }

  return (
    <div
      className="relative text-sm z-50 text-primaryText"
      onMouseEnter={() => {
        setShowDetail(true);
      }}
      onMouseLeave={() => {
        setShowDetail(false);
      }}
      id={id}
    >
      <OrderSmile
        fill={scrollTagID === 'buy-order-book-panel' ? '#00c6a2' : '#FF6A8E'}
      ></OrderSmile>
      {showDetail && (
        <div
          className="fixed   z-40  rounded-md border bg-orderTipBg border-border3 p-2 "
          style={{
            minWidth: '120px',
            ...getPosition(),
          }}
        >
          <div className="flex items-center whitespace-nowrap justify-between">
            <span>
              {intl.formatMessage({
                id: 'price',
                defaultMessage: 'Price',
              })}
            </span>

            <span className="text-white ml-2">${numberWithCommas(price)}</span>
          </div>

          <div className="flex items-center whitespace-nowrap justify-between mt-2 ">
            <span>
              {intl.formatMessage({
                id: 'open_qty',
                defaultMessage: 'Open Qty.',
              })}
            </span>

            <span className="text-white ml-2">
              {numberWithCommas(quantity.toString())}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function orderEditPopUpSuccess({
  side,
  symbolName,
  price,
  size,
  cancel,
  sig,
}: {
  symbolName: string;
  side: 'Buy' | 'Sell';
  size: string;
  price: string;
  cancel: boolean;
  sig?: boolean;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(symbolName);

  const mobileDevice = isMobile();

  return toast(
    <div className={`flex-col  px-2 pt-4 text-sm   w-full`}>
      <FlexRow className="relative bottom-3 w-full">
        <div className={`text-white rounded-lg  px-2 mr-1.5 font-bold`}>
          {!!cancel ? (
            <FormattedMessage
              id="order_cancelled"
              defaultMessage="Order Canceled."
            />
          ) : (
            <FormattedMessage
              id="order_edit_success"
              defaultMessage="Order Edit Successfully!"
            />
          )}
        </div>
      </FlexRow>

      <div className="absolute w-1 bottom-0 bg-gradientFrom h-full left-0"></div>

      <FlexRowStart className=" px-2 flex-wrap text-white">
        {
          <FormattedMessage
            id={side.toLowerCase() + '_pop'}
            defaultMessage={side}
          />
        }
        <span className="mx-1 ">{`${size} ${symbolFrom}`}</span>
        <FormattedMessage id={'at_orderly'} defaultMessage={'at'} />
        <span className="ml-1 ">{`${price} ${symbolTo}`}</span>
      </FlexRowStart>
    </div>,
    {
      closeOnClick: true,
      hideProgressBar: true,
      position: mobileDevice ? 'top-center' : 'bottom-right',
      progress: undefined,
      autoClose: 3000,
      closeButton: false,
      style: {
        boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.25)',
        borderRadius: '4px',
        zIndex: 9999,
        right: mobileDevice ? '0px' : '-40px',
        overflow: 'hidden',
        width: mobileDevice ? '100%' : '90%',
        background: 'rgba(30, 41, 49, 1)',
        bottom: !!sig && !mobileDevice ? '-70px' : '0px',
      },
    }
  );
}

export function orderEditPopUpFailure({ tip }: { tip: string }) {
  if (tip === 'trading key error') {
    console.error(
      `your trading key stored: ${tradingKeyMap.get(
        get_orderly_public_key_path()
      )}; ${localStorage.getItem(get_orderly_public_key_path())}`
    );
  }
  const mobileDevice = isMobile();

  return toast(
    <div className={`flex-col flex px-2  text-sm   w-full`}>
      <span className="text-textRed">{tip}</span>

      <div className="absolute w-1 bg-textRed bottom-0 h-full left-0"></div>
    </div>,
    {
      closeOnClick: true,
      hideProgressBar: true,
      position: mobileDevice ? 'top-center' : 'bottom-right',
      progress: undefined,
      autoClose: 3000,
      // autoClose: false,

      closeButton: false,
      style: {
        boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.25)',
        borderRadius: '4px',
        zIndex: 9999,
        right: mobileDevice ? '0px' : '-40px',
        overflow: 'hidden',
        width: mobileDevice ? '100%' : '90%',
        background: 'rgba(30, 41, 49, 1)',
        bottom:
          !mobileDevice &&
          !!document.getElementsByClassName('orderly-order-toast')?.[0]
            ? '-70px'
            : '0px',
      },
    }
  );
}

export function usePortfolioFailure() {
  const mobileDevice = isMobile();

  const openToast = ({ tip }: { tip: string }) => {
    toast(
      <div className={`flex-col flex px-2  text-sm   w-full`}>
        <span className="text-textRed">{tip}</span>
        <div className="absolute w-1 bg-textRed bottom-0 h-full left-0"></div>
      </div>,
      {
        toastId: 'future-error',
        closeOnClick: true,
        hideProgressBar: true,
        position: mobileDevice ? 'top-center' : 'bottom-right',
        autoClose: 3000,
        // autoClose: false,
        closeButton: false,

        style: {
          boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.25)',
          borderRadius: '4px',
          zIndex: 9999,
          right: mobileDevice ? '0px' : '-40px',
          overflow: 'hidden',
          width: mobileDevice ? '100%' : '90%',
          background: 'rgba(30, 41, 49, 1)',
          bottom:
            !mobileDevice &&
            !!document.getElementsByClassName('orderly-order-toast')?.[0]
              ? '-70px'
              : '0px',
        },
      }
    );
  };

  const updateToast = ({ tip }: { tip: string }) =>
    toast.update('future-error', {
      render: () => (
        <div className={`flex-col flex px-2  text-sm   w-full`}>
          <span className="text-textRed">{tip}</span>

          <div className="absolute w-1 bg-textRed bottom-0 h-full left-0"></div>
        </div>
      ),
      autoClose: 3000,
    });

  const onToast = ({ tip }: { tip: string }) => {
    if (!toast.isActive('future-error')) {
      openToast({ tip });
    } else {
      updateToast({ tip });
    }
  };

  return onToast;
}

export function CollatteralTokenIcon(props) {
  return (
    <svg
      {...props}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="7" fill="#3B4552" />
      <path
        d="M7.69225 3.49185L8.49316 2.57277C8.53638 2.52346 8.56476 2.46229 8.57485 2.39669C8.58495 2.33108 8.57633 2.26388 8.55004 2.20322C8.52375 2.14257 8.48092 2.09108 8.42674 2.055C8.37257 2.01893 8.30939 1.99982 8.24488 2H5.80104C5.73663 2.00006 5.6736 2.01931 5.61958 2.05543C5.56556 2.09155 5.52284 2.14299 5.49659 2.20355C5.47034 2.26411 5.46167 2.3312 5.47164 2.39671C5.48161 2.46223 5.50978 2.52338 5.55276 2.57277L6.34833 3.48415C5.41353 3.64401 4.56408 4.13997 3.95101 4.88385C3.33794 5.62773 3.00096 6.57132 3 7.54688V9.88029C3.00042 10.1768 3.11493 10.4611 3.31846 10.671C3.52199 10.8808 3.79798 10.9991 4.08603 11H9.91237C10.2007 10.9996 10.4771 10.8815 10.681 10.6716C10.8849 10.4617 10.9996 10.1771 11 9.88029V7.54688C10.9989 6.5787 10.6669 5.64179 10.0621 4.90037C9.45731 4.15895 8.61835 3.66031 7.69225 3.49185ZM7.49736 2.68711L7.02269 3.2302L6.54856 2.68711H7.49736ZM7.27524 9.0728V9.46143C7.2747 9.484 7.26575 9.50549 7.25025 9.52145C7.23474 9.53741 7.21387 9.54662 7.19195 9.54718H6.81446C6.79254 9.54662 6.77166 9.53741 6.75616 9.52145C6.74065 9.50549 6.7317 9.484 6.73116 9.46143V9.09589C6.5481 9.0866 6.3661 9.06159 6.18708 9.02113C6.16602 9.01948 6.14632 9.00976 6.13189 8.99388C6.11745 8.978 6.10933 8.95713 6.10912 8.93538V8.62701C6.10953 8.60586 6.11788 8.58569 6.13241 8.57073C6.14694 8.55577 6.16653 8.54718 6.18708 8.54675H6.19829C6.36488 8.56984 6.78135 8.59238 6.93673 8.59238C7.31049 8.59238 7.41727 8.45551 7.41727 8.20375C7.41727 8.03885 7.33932 7.95254 7.06167 7.78104L6.51171 7.44354C6.12301 7.20937 6.01782 6.95761 6.01782 6.65474C6.01782 6.26006 6.2063 5.95169 6.72849 5.86594V5.50535C6.72973 5.48279 6.73934 5.46159 6.75535 5.44614C6.77135 5.43069 6.79252 5.42217 6.81446 5.42234H7.19195C7.21387 5.4229 7.23474 5.43211 7.25025 5.44808C7.26575 5.46404 7.2747 5.48553 7.27524 5.50809V5.8511C7.47226 5.86094 7.66844 5.88389 7.86258 5.91981C7.90689 5.93135 7.94 5.95993 7.94 6.00006V6.31998C7.9409 6.33024 7.93969 6.34058 7.93647 6.35033C7.93324 6.36008 7.92806 6.36902 7.92127 6.37659C7.91448 6.38415 7.90622 6.39016 7.89703 6.39424C7.88784 6.39831 7.87792 6.40035 7.86792 6.40023H7.8567C7.57906 6.37165 7.30728 6.35461 7.03497 6.35461C6.72582 6.35186 6.59554 6.46674 6.59554 6.65474C6.59554 6.79766 6.66816 6.88341 6.93993 7.03952L7.4397 7.32535C7.90049 7.5881 8.02276 7.8624 8.02276 8.20485C8.02489 8.56984 7.83641 8.96397 7.27524 9.0728Z"
        fill="#00D6AF"
      />
    </svg>
  );
}
