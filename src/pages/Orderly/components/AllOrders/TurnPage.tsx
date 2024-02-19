import React from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { ArrowPageIcon } from '../Common/Icons';
// TODOX
function TurnPage() {
  const { orderPageNum, setOrderPageNum, orderTotalPage } = useOrderlyContext();
  if ((orderTotalPage || 0) <= 1) return null;
  const multiple = Math.floor((orderPageNum - 1) / 3);
  const pre = multiple * 3 + 1;
  const mid = multiple * 3 + 2;
  const next = multiple * 3 + 3;
  const preDisabled = orderPageNum == 1;
  const nextDisabled = orderPageNum == orderTotalPage;
  return (
    <div className="flex items-center gap-2 ml-5">
      <span
        onClick={() => {
          if (!preDisabled) {
            setOrderPageNum(orderPageNum - 1);
          }
        }}
        className={`flex items-center justify-center w-6 h-6 rounded-md bg-primaryText bg-opacity-20 ${
          preDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <ArrowPageIcon />
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${
            orderPageNum == pre
              ? 'text-white gotham_bold'
              : 'text-lightPurpleColorOrder'
          }`}
        >
          {pre}
        </span>
        <span
          className={`text-xs ${orderTotalPage < mid ? 'hidden' : ''} ${
            orderPageNum == mid
              ? 'text-white gotham_bold'
              : 'text-lightPurpleColorOrder'
          }`}
        >
          {mid}
        </span>
        <span
          className={`text-xs ${orderTotalPage < next ? 'hidden' : ''} ${
            orderPageNum == next
              ? 'text-white gotham_bold'
              : 'text-lightPurpleColorOrder'
          }`}
        >
          {next}
        </span>
      </div>
      <span
        onClick={() => {
          if (!nextDisabled) {
            setOrderPageNum(orderPageNum + 1);
          }
        }}
        className={`flex items-center justify-center w-6 h-6 rounded-md bg-primaryText bg-opacity-20 transform rotate-180 ${
          nextDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <ArrowPageIcon />
      </span>
    </div>
  );
}
export default TurnPage;
