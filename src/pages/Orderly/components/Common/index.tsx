import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactTooltip from 'react-tooltip';
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
} from './Icons';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { parseFullSymbol } from '../../datafeed/helpers';
import { toast, ToastContainer } from 'react-toastify';
import { TokenMetadata } from '../../orderly/type';
import { parseSymbol } from '../RecentTrade';
import 'react-toastify/dist/ReactToastify.css';

import { HiDownload } from 'react-icons/hi';
import { formatTimeDate } from '../OrderBoard/index';
import { MyOrder } from '../../orderly/type';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { digitWrapper } from '../../utiles';
import { isMobile } from '~utils/device';
import { REF_ORDERLY_AGREE_CHECK } from '../UserBoard/index';
import { useClientMobile } from '../../../../utils/device';
import {
  get_orderly_public_key_path,
  tradingKeyMap,
} from '~pages/Orderly/orderly/utils';

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
      <NearIcon />

      <span className="whitespace-nowrap ml-3  hover:bg-">Connect Wallet</span>
    </button>
  );
}

export function ConfirmButton({ onClick }: { onClick: () => void }) {
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
      <span className="whitespace-nowrap ml-3  hover:bg-">Confirm</span>
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
}: {
  onClick: () => void;
  spin?: boolean;
  storageEnough: boolean;
  check: boolean;
  setCheck?: (c: boolean) => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (isOpen: boolean) => void;
  userExist: boolean;
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

  return (
    <div className="flex flex-col items-center xs:w-full  relative ">
      {isMobile && !isOpenMobile ? null : (
        <>
          <div className="lg:px-6 xs:font-bold text-white pb-5 text-center text-base">
            {spinNow
              ? null
              : userExist
              ? "You need to (re)connect your Orderly account to use Ref's Orderbook."
              : 'Your wallet must first be registered with Orderly in order to use the Orderbook.'}
          </div>

          <div
            className={
              !isMobile || !isOpenMobile || check
                ? 'hidden'
                : 'h-48 overflow-auto pt-2 mb-2 text-primaryText text-sm flex flex-col'
            }
          >
            <div>
              This Orderbook page is a graphical user interface for trading on
              Orderly Network, and is provided as a convenience to users of Ref
              Finance. Orderly Network is fully responsible for the security of
              their systems, smart contracts, and any funds deposited or sent to
              those systems and contracts. Users are strongly encouraged to do
              their own research before connecting their wallet and/or placing
              any orders.
            </div>

            <div className="py-5">
              {!userExist && (
                <span className="mr-1">
                  Your wallet must be registered with Orderly to trade on their
                  system.
                </span>
              )}{' '}
              Learn more about
              <a
                href=""
                className="underline text-primary ml-1"
                href="https://orderly.network/"
                target="_blank"
              >
                Orderly Network
              </a>
              .
            </div>

            <div>
              By clicking "Confirm", you confirm that you have comprehensively
              reviewed and comprehended the contents aforementioned
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

            <div>Deposit storage fee</div>
          </div>

          <div className="relative flex mb-5 items-center">
            <div className="mr-2">
              <CheckFlow checked={false}></CheckFlow>
            </div>

            <div>Register Orderly Account</div>
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
        } py-3   relative w-p240 ${
          spinNow ? 'opacity-30 cursor-not-allowed' : ''
        } bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center
      
    `}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          if (isMobile) {
            if (!isOpenMobile) {
              setIsOpenMobile(true);
              return;
            } else {
              setCheck(true);
              return;
            }
          }

          onClick();

          if (!check) return;

          if (spinNow) return;

          setSpinNow(true);
        }}
        type="button"
        disabled={spinNow}
      >
        {spinNow && <SpinIcon />}
        <span className={`whitespace-nowrap ml-3  `}>
          {userExist && !storedAgree
            ? !check
              ? isOpenMobile && !check
                ? 'Confirm'
                : 'Connect to Orderly'
              : 'Connecting'
            : isOpenMobile && !check
            ? 'Confirm'
            : 'Register'}
        </span>
      </button>
      {isMobile && !isOpenMobile ? null : (
        <div className="text-sm  text-center text-white flex items-center lg:px-6 justify-center">
          {spinNow
            ? null
            : !userExist
            ? '* Registering will require a storage deposit.'
            : '*You may need to increase the storage deposit on your Orderly account.'}
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
            className={`border border-dark5 rounded-lg font-bold px-2 mr-1.5  ${
              side === 'Buy' ? 'bg-greenLight' : 'bg-redLight'
            }`}
          >
            {side}
          </div>

          <div className="text-dark5 font-bold text-lg">
            {orderType} Order
            {orderType === 'Limit' && !filled ? ' Created' : ' Filled'}!
          </div>
        </div>

        <div className="flex -mt-1 items-center">
          <span>{filled || orderType === 'Market' ? 'Filled' : 'Open'}</span>
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

      <FlexRowStart className="mt-6 ">
        {`To ${side} `}
        <span className="mx-1 font-bold">{`${size} ${symbolFrom}`}</span>
        at
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
        <span className="text-13px">Deposit</span>

        <HiDownload className="ml-1" />
      </div>
    </div>
  );
}

export function DepositButtonMobile(props: any) {
  return (
    <div
      className="relative w-1/2    flex items-center justify-center text-white"
      {...props}
    >
      <GrayBgBoxMobile
        className={`  cursor-pointer transform   left-0 -bottom-0.5 z-10`}
      ></GrayBgBoxMobile>

      <div className="flex cursor-pointer items-center absolute z-40 font-normal">
        <span className="text-13px font-bold">Deposit</span>

        <HiDownload className="ml-1" />
      </div>
    </div>
  );
}

export function WithdrawButton(props: any) {
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
        <span className="text-13px">Withdraw</span>

        <ArrowCurve />
      </div>
    </div>
  );
}

export function WithdrawButtonMobile(props: any) {
  return (
    <div
      className="relative w-1/2 flex left-2  items-center justify-center text-white"
      {...props}
    >
      <GrayBgBoxMobile
        className={` cursor-pointer transform rotate-180  relative right-2   z-10`}
      ></GrayBgBoxMobile>

      <div className="flex  cursor-pointer absolute items-center z-40 font-normal">
        <span className="text-13px font-bold">Withdraw</span>

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

  function getPosition() {
    const smileEl = document.getElementById(id);

    const orderEl = document.getElementById(scrollTagID);

    if (!smileEl || !orderEl) return;

    const top = getElementTop(smileEl);

    const scrollTop = orderEl.scrollTop;

    return {
      top: top - scrollTop + 20 - document.documentElement.scrollTop,
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
          className="fixed  z-40  rounded-md border bg-orderTipBg border-border3 p-2 "
          style={{
            minWidth: '120px',
            ...getPosition(),
          }}
        >
          <div className="flex items-center whitespace-nowrap justify-between">
            <span>Price</span>

            <span className="text-white ml-2">${digitWrapper(price, 2)}</span>
          </div>

          <div className="flex items-center whitespace-nowrap justify-between mt-2 ">
            <span>Open Qty.</span>

            <span className="text-white ml-2">
              {digitWrapper(quantity.toString(), 2)}
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
          {!!cancel ? 'Order Canceled.' : 'Order Edit Successfully!'}
        </div>
      </FlexRow>

      <div className="absolute w-1 bottom-0 bg-gradientFrom h-full left-0"></div>

      <FlexRowStart className=" px-2 text-white">
        {`${side} `}
        <span className="mx-1 ">{`${size} ${symbolFrom}`}</span>
        at
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
