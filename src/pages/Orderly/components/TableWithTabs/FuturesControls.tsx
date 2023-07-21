import React , { useEffect, useState, useRef } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { useIntl } from 'react-intl';
import Modal from 'react-modal';
import { useWalletSelector } from '~context/WalletSelectorContext';
import { TextWrapper } from '../UserBoard';
import { usePerpData } from '../UserBoardPerp/state';
import { parseSymbol } from '../RecentTrade';
import { orderEditPopUpFailure } from '../Common';
import { getPortfolioAllOrders, cancelOrder } from '../../orderly/off-chain-api';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { formatDecimalToTwoOrMore } from '../../orderly/utils';

export const FutureTableFormHeaders: React.FC = () => {
  const intl = useIntl();

  const TableHeader: React.FC = ({ children }) => (
    <th className={`col-span-3 pb-2 flex items-center`}>
      <div className={`flex items-center relative text-left`}>
        <span
          className="hidden md:flex lg:flex items-center"
          style={{ color: '#7E8A93' }}
        >
          <span className={`ml-2`}>
            {children}
          </span>
        </span>
      </div>
    </th>
  )


  return (
    <>
      <TableHeader>
        {intl.formatMessage({
          id: 'qty.',
          defaultMessage: 'Qty.',
        })}
      </TableHeader>
      <TableHeader>
        {intl.formatMessage({
          id: 'price',
          defaultMessage: 'Price',
        })}
      </TableHeader>
    </>
  )
}

export const FutureTableFormCells: React.FC<{
  position_qty: number;
  closingQuantity: number;
  mark_price: number;
  setClosingQuantity: (input: number) => void;
  closingPrice: string | 'Market';
  setClosingPrice: (input: string | 'Market') => void;
  open: boolean;
  setOpen: (input: boolean) => void;
  showFloatingBox: boolean;
  setShowFloatingBox: (input: boolean) => void;
  isFocus: string;
  setIsFocus: (input: string) => void;
  handleOpenClosing: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
  row: any,
}> = ({
  position_qty,
  mark_price,
  closingQuantity,
  setClosingQuantity,
  closingPrice,
  setClosingPrice,
  open,
  setOpen,
  showFloatingBox,
  setShowFloatingBox,
  handleOpenClosing,
  row
}) => {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { triggerPositionBasedData } = usePerpData();
  const { handlePendingOrderRefreshing } = useOrderlyContext();
  const [orders, setOrders] = useState<any>([]);

  useEffect(() => {
    getPendingOrders();
  }, [triggerPositionBasedData])

  const getPendingOrders = async () => {
    const { data } = await getPortfolioAllOrders({
      accountId,
      OrderProps: {
        page: 1,
        size: 500,
        side: position_qty > -1 ? 'SELL' : 'BUY',
        status: 'INCOMPLETE',
        symbol: row.symbol
      } 
    })

    data && setOrders(data.rows);
  }

  return (
    <>
      <td className={`col-span-3 flex items-center py-5 relative break-words`}>
        <div className={`flex items-center text-white`}>
          <input
            id={`${row.symbol}-input`}
            className={`px-4 py-1.5 text-xs ${position_qty > -1 ? 'text-buyGreen' : 'text-sellColorNew'}`}
            style={{
              borderRadius: '6px',
              border: '1px solid #1D2932',
              backgroundColor: 'rgba(0, 0, 0, 0.10)'
            }}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => {
              let value: number = parseFloat(target.value);
              if (value > Math.abs(position_qty)) value = position_qty;
              if (value < 0 || !value) value = 0;
              setClosingQuantity(value)
            }}
            value={closingQuantity}
          />
        </div>
      </td>
      <td className={`col-span-3 flex items-center py-5 relative break-words`}>
        <div className={`flex items-center text-white relative  w-full`}>
          <div
            className="absolute w-full z-10"
            style={{
              borderRadius: '6px',
              border: '1px solid #1D2932',
              backgroundColor: '#1C272F',
              top: '-15px'
            }}
          >
            <div className="w-full px-2.5 py-1.5 text-white relative">
              <input
                className="w-full"
                placeholder={mark_price.toString()}
                onChange={({ target }) => {
                  let value: string = target.value;
                  if (value && value !== 'Market' && ! /^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(value)) return
                  setClosingPrice(value);
                }}
                value={closingPrice}
                onClick={() => {
                  if (closingPrice === 'Market') setClosingPrice(mark_price.toString())
                }}
              />
              {closingPrice !== 'Market' && (
                <svg
                  className="absolute right-2.5 top-1/2 cursor-pointer"
                  style={{ transform: 'translateY(-50%)' }}
                  onClick={() => setOpen(true)}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5.38406 5.53907C5.18417 5.77894 4.81574 5.77894 4.61584 5.53907L0.683364 0.820091C0.411977 0.494427 0.643556 -9.9678e-07 1.06747 -9.5972e-07L8.93243 -2.72144e-07C9.35635 -2.35083e-07 9.58793 0.494429 9.31654 0.820092L5.38406 5.53907Z" fill={closingPrice ? 'white' : '#7E8A93'}/>
                </svg>
              )}
            </div>
            {open && (
              <div  
                className="cursor-pointer px-2.5 py-1.5 w-full hover:bg-symbolHover2 hover:text-white"
                onClick={() => {
                  setClosingPrice('Market');
                  setOpen(false);
                }}
              >
                {intl.formatMessage({
                  id: 'market',
                  defaultMessage: 'Market',
                })}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className={`col-span-3 flex items-center py-5 break-all`}>
        <div className={`flex items-center text-white w-full`}>
          <div
            className="w-full relative"
            onMouseEnter={() => setShowFloatingBox(true)}
            onMouseLeave={() => setShowFloatingBox(false)}
          >
            <div
              className={`border w-full text-center border-orderTypeBg ${orders.length > 0 ? 'px-1.5' : 'px-3'} py-1.5 rounded-md text-xs text-primaryText cursor-pointer`}
              onClick={() => {
                handleOpenClosing(
                  closingQuantity, 
                  closingPrice === ''
                    ? mark_price : 
                    closingPrice === 'Market'
                    ? closingPrice 
                    : parseFloat(closingPrice),
                  row
                )
              }}
            >
              {intl.formatMessage({
                id: 'close',
                defaultMessage: 'Close',
              })}
              {orders.length > 0 && `(${orders.length})`}
            </div>
            {(showFloatingBox && orders.length > 0) && (
              <div
                className="absolute bg-cardBg rounded-xl py-3 px-1.5 z-20"
                style={{
                  bottom: '100%',
                  right: 0,
                  width: '300px',
                  background: 'linear-gradient(180deg, #1D2932 100%, #2F3A39 100%)'
                }}
              >
                <div className="px-4 flex items-center pb-2 border-b border-gray1">
                  <span className="text-white text-sm gotham_bold">
                    {intl.formatMessage({ id: 'pending_orders_title', defaultMessage: 'Pending Close Orders' })}
                  </span>
                </div>
                <div>
                {orders.map(({ symbol, quantity, price, order_id }: any) => (
                  <div key={order_id} className="px-4 py-2 grid grid-cols-4 gap-2 rounded-lg hover:bg-symbolHover3" >
                    <div className="col-span-3 text-sm flex justify-between">
                      <span className="pr-3">
                        <span>
                          {quantity}&nbsp;
                        </span>
                        <span className="text-primaryText">
                          {parseSymbol(symbol).symbolFrom}
                        </span>
                      </span>
                      <span className="text-left">
                        <span className="text-primaryText">{intl.formatMessage({ id: 'at_orderly', defaultMessage: 'at' })}</span>&nbsp;
                        <span>
                          ${price?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 3)}
                        </span>
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end items-center">
                      <div
                        className="cursor-pointer"
                        onClick={async () => {
                          try {
                            if (!accountId) return;
        
                            const res = await cancelOrder({
                              accountId,
                              DeleteParams: {
                                order_id: order_id,
                                symbol: symbol,
                              },
                            })
        
                            if (res.success === true) {
                              handlePendingOrderRefreshing();
                            }
                          } catch (err) {
                            return orderEditPopUpFailure({
                              tip: err.message,
                            });
                          }
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M10 1.81818C5.48131 1.81818 1.81818 5.48131 1.81818 10C1.81818 14.5187 5.48131 18.1818 10 18.1818C14.5187 18.1818 18.1818 14.5187 18.1818 10C18.1818 5.48131 14.5187 1.81818 10 1.81818ZM0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#FF6A8E"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M4.24243 9.99972C4.24243 9.33028 4.78512 8.7876 5.45455 8.7876L14.5455 8.7876C15.2149 8.7876 15.7576 9.33028 15.7576 9.99972C15.7576 10.6692 15.2149 11.2118 14.5455 11.2118L5.45455 11.2118C4.78512 11.2118 4.24243 10.6692 4.24243 9.99972Z" fill="#FF6A8E"/>
                        </svg>

                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  )
}

function FutureQuantityModal(
  props: Modal.Props & {
    onClose: (input: number) => void;
    quantity: number;
    position_qty: number;
  }
) {
  const { onClose, quantity, position_qty } = props;
  const intl = useIntl();
  const [inputQuantity, setInputQuantity] = useState<number>(Math.abs(position_qty));
  
  useEffect(() => {
    setInputQuantity(quantity);
  }, [quantity])

  return (
    <Modal
      {...props}
      onRequestClose={() => onClose && onClose(quantity)}
      style={{
        content: {
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: 'none',
          bottom: '0px',
          left: '0px',
          transform: 'translate(-50%, -20px)',
          outline: 'none',
        }
      }}
    >
      <div
        className={`rounded-t-2xl fixed w-screen bottom-0 left-0 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="flex px-4 items-center pb-6 justify-between">
            <span className="text-white text-base gotham_bold">
              {intl.formatMessage({ id: 'quantity' })}
            </span>

            <span
              className="cursor-pointer"
              onClick={(e: any) => {
                onClose && onClose(quantity);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div className="flex px-4 items-center pb-6 justify-between">
            <input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={inputQuantity}
              onChange={({ target }) => {
                let value: any = target.value;
                if (parseFloat(value) > Math.abs(position_qty)) value = Math.abs(position_qty);
                if (parseFloat(value) < 0) value = 0;
                setInputQuantity(value)
              }}
              className="text-white text-xl leading-tight px-2.5 pb-2 w-10/12 mr-2"
              style={{ borderBottomColor: '#FFFFFF1A', borderBottomWidth: 1 }}
            />
            <button
              className="text-white py-1 px-4 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center"
              onClick={() => {
                // @ts-ignore
                onClose && onClose(parseFloat(inputQuantity));
              }}
            >
              <span>
                {intl.formatMessage({ id: 'save' })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function FuturePriceModal(
  props: Modal.Props & {
    onClose: (input: number | 'Market') => void;
    price: number | 'Market';
    mark_price: number;
    priceMode: 'market_price' | 'limit_price';
    setPriceMode: (input: 'market_price' | 'limit_price') => void;
  }
) {
  const { onClose, priceMode, setPriceMode, price, mark_price } = props;
  const [inputPrice, setInputPrice] = useState<number | 'Market'>(price);
  const intl = useIntl();

  return (
    <Modal
      {...props}
      onRequestClose={() => onClose && onClose(price)}
      style={{
        content: {
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: 'none',
          bottom: '0px',
          left: '0px',
          transform: 'translate(-50%, -20px)',
          outline: 'none',
        }
      }}
    >
      <div
        className={`rounded-t-2xl fixed w-screen bottom-0 left-0 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="flex px-4 items-center pb-6 justify-between">
            <span className="text-white text-base gotham_bold">
              {intl.formatMessage({ id: 'price' })}
            </span>

            <span
              className="cursor-pointer"
              onClick={(e: any) => {
                onClose && onClose(price);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            {['market_price', 'limit_price'].map((item: 'market_price' | 'limit_price') => (
              <div
                key={item}
                className={`relative text-center px-7 py-4 w-150 rounded-md border ${priceMode !== item ? 'text-primaryText border-orderTypeBg' : 'text-white border-mobileOrderBg bg-mobileOrderBg'}`}
                onClick={() => {
                  setInputPrice(mark_price);
                  setPriceMode(item);
                }}
              >
                {intl.formatMessage({ id: item })}
                {priceMode === item && (
                  <div
                    className="absolute bg-gradientFromHover rounded-full flex justify-center items-center -top-0.5 -right-1.5"
                    style={{ width: '22px', height: '22px' }}
                  >
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L4 7L10 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          {priceMode === 'limit_price' && (
            <div className="flex px-4 items-center pb-6 justify-between">
              <input
                type="number"
                placeholder="0.0"
                value={inputPrice}
                onChange={({ target }) => setInputPrice(parseFloat(target.value))}
                className="text-white text-xl leading-tight px-2.5 pb-2 w-10/12 mr-2"
                style={{ borderBottomColor: '#FFFFFF1A', borderBottomWidth: 1 }}
                min={0}
              />
              <button
                className="text-white py-1 px-4 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center"
                onClick={() => {
                  onClose && onClose(inputPrice);
                }}
              >
                <span>
                  {intl.formatMessage({ id: 'save' })}
                </span>
              </button>
            </div>
            )}
          </div>
      </div>
    </Modal>
  );
}


function PendingOrdersModal(
  props: Modal.Props & {
    onClose: () => void;
    rows: any;
  }
) {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { handlePendingOrderRefreshing } = useOrderlyContext();
  const { onClose, rows } = props;

  return (
    <Modal
      {...props}
      onRequestClose={() => onClose && onClose()}
      style={{
        content: {
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: 'none',
          bottom: '0px',
          left: '0px',
          transform: 'translate(-50%, -20px)',
          outline: 'none',
        }
      }}
    >
      <div
        className={`rounded-t-2xl fixed w-screen bottom-0 left-0 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className="py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="px-4 flex items-center pb-6 justify-between">
            <span className="text-white text-base gotham_bold">
              {intl.formatMessage({ id: 'pending_orders_title', defaultMessage: 'Pending Close Orders' })}
            </span>

            <span
              className="cursor-pointer"
              onClick={(e: any) => {
                onClose && onClose();
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          {rows.map(({ symbol, quantity, price, order_id }: any) => (
            <div key={order_id} className="px-4 py-6 grid grid-cols-4 gap-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)'}}>
              <div className="col-span-3 text-base">
                <span className="pr-3">
                  <span className="text-white">
                    {quantity}&nbsp;
                  </span>
                  <span>
                    {parseSymbol(symbol).symbolFrom}
                  </span>
                </span>
                <span>
                  <span className="italic">{intl.formatMessage({ id: 'at_orderly', defaultMessage: 'at' })}</span>&nbsp;
                  <span className="text-white">
                    ${price?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 3)}
                  </span>
                </span>
              </div>
              <div className="col-span-1 flex justify-end items-center">
                <div
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      if (!accountId) return;
  
                      const res = await cancelOrder({
                        accountId,
                        DeleteParams: {
                          order_id: order_id,
                          symbol: symbol,
                        },
                      })
  
                      if (res.success === true) {
                        handlePendingOrderRefreshing();
                      }
                    } catch (err) {
                      return orderEditPopUpFailure({
                        tip: err.message,
                      });
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 1.81818C5.48131 1.81818 1.81818 5.48131 1.81818 10C1.81818 14.5187 5.48131 18.1818 10 18.1818C14.5187 18.1818 18.1818 14.5187 18.1818 10C18.1818 5.48131 14.5187 1.81818 10 1.81818ZM0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#FF6A8E"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.24243 9.99972C4.24243 9.33028 4.78512 8.7876 5.45455 8.7876L14.5455 8.7876C15.2149 8.7876 15.7576 9.33028 15.7576 9.99972C15.7576 10.6692 15.2149 11.2118 14.5455 11.2118L5.45455 11.2118C4.78512 11.2118 4.24243 10.6692 4.24243 9.99972Z" fill="#FF6A8E"/>
                  </svg>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export  function ClosingModal(
  props: Modal.Props & {
    onClick: () => Promise<any>;
    row: any,
    closingPrice: number | 'Market';
    closingQuantity: number;
    marketList: { text: JSX.Element; withSymbol: JSX.Element; textId: string; }[];
  }
) {
  const {
    onRequestClose,
    onClick,
    closingPrice,
    closingQuantity,
    marketList,
    row
  } = props;

  const { symbol  } = row;

  const { symbolFrom } = parseSymbol(symbol);

  const [loading, setLoading] = useState<boolean>(false);
  
  const intl = useIntl();
  return (
    <Modal
      {...props}
      style={{
        content: {
          zIndex: 999,
        },
      }}
    >
      <div
        className={`rounded-2xl lg:w-96 xs:w-95vw border border-gradientFrom border-opacity-30 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className="px-5 py-6 flex flex-col ">
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="col-span-2 m-4">
              <div className="flex items-center justify-center text-white text-center gotham_bold">
                <span>
                  {intl.formatMessage({ id: 'closing_1' } )}&nbsp;
                  <span className={row.position_qty < 0  ? 'text-buyGreen' : 'text-sellColorNew'}>{closingQuantity}</span>
                  &nbsp;{intl.formatMessage({ id: 'closing_2' }, { type: closingPrice === 'Market' ? 'market' : 'limit' } )}
                </span>
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center -m-2">{marketList.find((m) => m.textId === symbol)?.text}</div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center justify-end  text-white">
                {closingPrice === 'Market' ? intl.formatMessage({ id: 'market' }) : intl.formatMessage({ id: 'limit' })}
                <TextWrapper
                  className="px-2 text-sm ml-2"
                  value={intl.formatMessage({
                    id: row.position_qty < 0 ? 'buy' : 'sell',
                    defaultMessage: row.position_qty < 0 ? 'buy' : 'sell',
                  })}
                  bg={row.position_qty < 0  ? 'bg-buyGreen' : 'bg-sellRed'}
                  textC={row.position_qty < 0  ? 'text-buyGreen' : 'text-sellColorNew'}
                />
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center text-white">{intl.formatMessage({ id: 'size' })}</div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center justify-end text-white">{formatDecimalToTwoOrMore(closingQuantity)} {symbolFrom}</div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center text-white">{intl.formatMessage({ id: 'price' })}</div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center justify-end text-white">{closingPrice === 'Market' ? intl.formatMessage({ id: 'market' }) : `$${closingPrice.toFixed(2)}`}</div>
            </div>
            {closingPrice !== 'Market' && (
              <>
                <div className="col-span-1 mb-2">
                  <div className="flex items-center text-white">{intl.formatMessage({ id: 'total' })}</div>
                </div>
                <div className="col-span-1 mb-2">
                  <div className="flex items-center justify-end text-white">${(closingPrice * closingQuantity).toFixed(2)}</div>
                </div>
              </>
            )}
            <div className="col-span-1 mb-2">
              <button
                className={`w-full rounded-lg gotham_bold ${
                  loading
                    ? 'opacity-70 cursor-not-allowed border-buttonGradientBgOpacity'
                    : ''
                } flex items-center justify-center py-1 border border-greenColor text-base text-greenColor`}
                onClick={(e: any) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  onRequestClose && onRequestClose(e);
                }}
                disabled={loading}
              >
                {intl.formatMessage({ id: 'cancel' })}
              </button>
            </div>
            <div className="col-span-1 mb-2">
              <button
                className={`w-full rounded-lg gotham_bold ${
                  loading
                    ? 'opacity-70 cursor-not-allowed bg-buttonGradientBgOpacity'
                    : ''
                } flex items-center justify-center py-1 bg-buttonGradientBg hover:bg-buttonGradientBgOpacity text-base text-white`}
                onClick={(e: any) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setLoading(true);
                  onClick().then(() => {
                    setLoading(false);
                    onRequestClose && onRequestClose(e);
                  });
                }}
                disabled={loading}
              >
                {intl.formatMessage({ id: 'Confirm' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const FutureMobileRow: React.FC<{
  row: { symbol: string, position_qty:number, average_open_price: number, unsettled_pnl: number },
  marketList: { text: JSX.Element; withSymbol: JSX.Element; textId: string; }[],
  handleOpenClosing: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
}> = ({
  row,
  marketList,
  handleOpenClosing
}) => {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { markPrices, triggerPositionBasedData } = usePerpData();
  const { symbol, position_qty, average_open_price, unsettled_pnl } = row;
  const [select, setSelect] = useState<any>('mark_price');
  const [showPnlSelector, setShowPnlSelector] = useState<boolean>(false);
  const [futureQuantityOpen, setFutureQuantityOpen] = useState<boolean>(false);
  const [futurePriceOpen, setFuturePriceOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(Math.abs(position_qty));
  const [priceMode, setPriceMode] = useState<'market_price' | 'limit_price'>('market_price');
  const mark_price = markPrices.find((i) => i.symbol === symbol)?.price;
  const [price, setPrice] = useState<number | 'Market'>('Market');
  const [orders, setOrders] = useState<any>([]);
  const [pendingOpen, setPendingOpen] = useState<boolean>(false);

  useEffect(() => {
    setQuantity(Math.abs(position_qty));
  }, [row])

  useEffect(() => {
    getPendingOrders();
  }, [])

  useEffect(() => {
    getPendingOrders();
  }, [triggerPositionBasedData])

  useEffect(() => {
    if (showPnlSelector)
      document.addEventListener('click', () => {
        setShowPnlSelector(false);
      });
  }, [showPnlSelector]);

  const getPendingOrders = async () => {
    const { data } = await getPortfolioAllOrders({
      accountId,
      OrderProps: {
        page: 1,
        size: 500,
        status: 'INCOMPLETE',
        symbol: row.symbol
      } 
    })

    setOrders(data.rows);
  }

  return (
    <>
      <div
        className={`w-full gap-2 rounded-xl my-3`}
        style={{ backgroundColor: '#7E8A931A' }}
      >
        <div className="w-full grid grid-cols-2 p-5">
          <div className="col-span-1 mb-3">
            <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
          </div>
          <div className="col-span-1 flex justify-end items-center mb-3">
            {orders.length > 0 && (
              <div
                className="cursor-pointer text-center py-1 px-3 mr-2 border border-orderTypeBg rounded-md"
                onClick={() => {
                  setPendingOpen(true);
                }}
              >
                {intl.formatMessage({ id: 'pending_cap' })}&#40;{orders.length}&#41;
              </div>
            )}
            <div
              className="cursor-pointer text-center py-1 px-3 border border-orderTypeBg rounded-md"
               onClick={() => {
                handleOpenClosing(quantity, price, row);
               }}
            >
              {intl.formatMessage({ id: 'close' })}
            </div>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'qty.' })}
              <div className="text-10px p-0.5 ml-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>USDC</div>
            </div>
            <span className="text-white">{position_qty?.toFixed(4) || '-' }</span>
          </div>
          <div className="col-span-1 my-3">
            <div>
              {intl.formatMessage({ id: 'avg_open' })}
            </div>
            <span className="text-white">{average_open_price?.toFixed(3) || '-'}</span>
          </div>
          <div className="col-span-1 my-3">
            <div
              className="relative flex items-center underline"
              style={{ textDecorationStyle: 'dashed' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPnlSelector(true)
              }}
            >
              {intl.formatMessage({ id: 'unreal_pnl' })}

              {showPnlSelector && (
                <div className="absolute top-full z-50">
                  <div
                    className={`flex flex-col min-w-28 items-start py-2 px-1.5 rounded-lg border border-borderC text-sm  bg-darkBg `}
                  >
                    {['mark_price', 'last_price'].map((item, index) => {
                      return (
                        <div
                          className={`whitespace-nowrap flex items-center justify-between cursor-pointer min-w-fit my-0.5 text-left px-1 py-1 w-full rounded-md`}
                          key={item + index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelect(item);
                            setShowPnlSelector(false);
                          }}
                        >
                          <div className="mr-2 border border-baseGreen bg-symbolHover2 border-solid w-3 h-3 rounded-full">
                            {select === item && <div className="w-2 h-2 bg-baseGreen rounded-full m-px" />}
                          </div>
                          <span className="whitespace-nowrap pr-2">{intl.formatMessage({ id: item })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <span className="text-white">{((mark_price - average_open_price) *  position_qty)?.toFixed(3) || '-' }</span>
          </div>
          <div className="col-span-1 my-3">
            <div>
              {intl.formatMessage({ id: 'fut_unsettle_pnl' })}
            </div>
            <span className="text-white">{unsettled_pnl?.toFixed(3) || '-'}</span>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'quantity' })}
            </div>
            <span
              className="text-white flex items-center cursor-pointer"
              onClick={() => setFutureQuantityOpen(true)}
            >
              {quantity}
              <MdArrowDropDown
                className="ml-0.5"
                style={{ flex: '0 0 22px' }}
                size={22}
                color={'#7E8A93'}
              />
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div>
              {intl.formatMessage({ id: 'price' })}
            </div>
            <span
              className="text-white flex items-center cursor-pointer"
              onClick={() => setFuturePriceOpen(true)}
            >
              {priceMode === 'market_price' ? 'Market' : price}
              <MdArrowDropDown
                className="ml-0.5"
                style={{ flex: '0 0 22px' }}
                size={22}
                color={'#7E8A93'}
              />
            </span>
          </div>
        </div>
      </div>

      <FutureQuantityModal
        isOpen={futureQuantityOpen}
        onClose={(input: number) => {
          setQuantity(input);
          setFutureQuantityOpen(false);
        }}
        position_qty={position_qty}
        quantity={quantity}
      />

      <FuturePriceModal
        isOpen={futurePriceOpen}
        onClose={(input: number | 'Market') => {
          setPrice((priceMode === 'market_price') ? 'Market' : input);
          
          setFuturePriceOpen(false);
        }}
        priceMode={priceMode}
        setPriceMode={setPriceMode}
        price={price}
        mark_price={mark_price}
      />

      <PendingOrdersModal
        isOpen={pendingOpen}
        onClose={() => {
          setPendingOpen(false);
        }}
        rows={orders}
      />
    </>
  )
}

export const FutureMobileView: React.FC<{
  rows: { symbol: string, position_qty:number, average_open_price: number, mark_price: number, unsettled_pnl: number }[],
  marketList: { text: JSX.Element; withSymbol: JSX.Element; textId: string; }[],
  handleOpenClosing: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
}> = ({
  marketList,
  children,
  handleOpenClosing
}) => {
  const intl = useIntl();
  const {
    portfolioUnsettle,
    totalPortfoliouPnl,
    totalDailyReal,
    totalNotional,
    newPositions
  } = usePerpData();

  const { rows } = newPositions || {};

  return (
    <div className="w-full p-3">
      <div
        className={`w-full gap-2 rounded-xl my-3`}
        style={{ backgroundColor: '#7E8A931A' }}
      >
        <div className="w-full grid grid-cols-2 p-5">
          <div className="col-span-1">
            {intl.formatMessage({
              id: 'fut_unreal_pnl',
              defaultMessage: 'Fut. Unreal. PnL',
            })}
            <span className={`pl-2 ${parseFloat(totalPortfoliouPnl) >= 0 ? 'text-buyGreen' : 'text-sellRed'}`}>{totalPortfoliouPnl}</span>
          </div>
          <div className="col-span-1 text-right">
            {intl.formatMessage({
              id: 'fut_daily_real',
              defaultMessage: 'Fut. Daily Real.',
            })}
            <span className={`pl-2 ${parseFloat(totalDailyReal) >= 0 ? 'text-buyGreen' : 'text-sellRed'}`}>{totalDailyReal}</span>
          </div>
          <div className="col-span-2 text-right mt-2">
            {intl.formatMessage({
              id: 'fut_notional',
              defaultMessage: 'Fut. Notional',
            })}
            <span className="text-white pl-2">{totalNotional}</span>
          </div>
          <div className="h-px col-span-2 w-full border border-white opacity-10 my-2.5" />
          <div className="col-span-1 flex items-center">
            {intl.formatMessage({
              id: 'fut_unsettle_pnl',
              defaultMessage: 'Unsettle PnL',
            })}
            <span className={`pl-2 ${parseFloat(portfolioUnsettle) >= 0 ? 'text-buyGreen' : 'text-sellRed'}`}>{portfolioUnsettle}</span>
          </div>
          <div className="col-span-1 text-right flex justify-end">
            {children}
          </div>
        </div>
      </div>
      {rows?.filter((row) => row.position_qty !== 0).map((row) => (
        <FutureMobileRow
          key={row.symbol}
          row={row}
          marketList={marketList}
          handleOpenClosing={handleOpenClosing}
        />
      ))}
    </div>
  )
}

export const FutureTopComponent = ({ mark }: { mark: boolean }) => {
  const intl = useIntl();
  const {
    portfolioUnsettle,
    totalPortfoliouPnl,
    totalDailyReal,
    totalNotional
  } = usePerpData({ markMode: mark });

  return (
    <div className="w-full px-5 mb-4">
      <div className="w-full flex justify-start items-center py-3 px-5 rounded-full" style={{ backgroundColor: '#7E8A931A' }}>
        <div className="mr-5">
          {intl.formatMessage({
            id: 'fut_unreal_pnl',
            defaultMessage: 'Fut. Unreal. PnL',
          })}
          <span className={`pl-2 ${parseFloat(portfolioUnsettle) >= 0 ? 'text-buyGreen' : 'text-sellRed'}`}>{totalPortfoliouPnl}</span>
        </div>
        <div className="mr-5">
          {intl.formatMessage({
            id: 'fut_daily_real',
            defaultMessage: 'Fut. Daily Real.',
          })}
          <span className={`pl-2 ${parseFloat(totalDailyReal) >= 0 ? 'text-buyGreen' : 'text-sellRed'}`}>{totalDailyReal}</span>
        </div>
        <div className="mr-5">
          {intl.formatMessage({
            id: 'fut_notional',
            defaultMessage: 'Fut. Notional',
          })}
          <span className="text-white pl-2">{totalNotional}</span>
        </div>
        <div className="ml-auto">
          {intl.formatMessage({
            id: 'fut_unsettle_pnl',
            defaultMessage: 'Unsettle PnL',
          })}
          <span className={`pl-2 ${parseFloat(portfolioUnsettle) >= 0 ? 'text-buyGreen' : 'text-sellRed'}`}>{portfolioUnsettle}</span>
        </div>
      </div>
    </div>
  )
}

