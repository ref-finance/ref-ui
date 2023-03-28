import React, { useCallback, useEffect, useState } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { FlexRow, FlexRowBetween } from '../Common';
import { parseSymbol } from '../RecentTrade';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MdArrowDropDown } from 'react-icons/md';
import {
  MyOrder,
  EditOrderlyOrder,
  orderStatus,
  OrderTrade,
  TokenInfo,
} from '../../orderly/type';
import { OrderStateOutline, CheckSelector } from '../Common/Icons';
import { TextWrapper } from '../UserBoard';
import Big from 'big.js';

import moment from 'moment';

import { AiOutlineClose } from '@react-icons/all-files/ai/AiOutlineClose';
import { AiOutlineCheck } from '@react-icons/all-files/ai/AiOutlineCheck';

import { FlexRowStart } from '../Common/index';
import {
  cancelOrder,
  cancelOrders,
  editOrder,
  getOrderTrades,
} from '../../orderly/off-chain-api';
import { EditConfirmOrderModal } from '../AllOrders/index';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useHistory } from 'react-router-dom';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { ButtonTextWrapper } from '../../../../components/button/Button';

export function CancelButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <button
      className={`px-1.5 ${
        loading ? 'opacity-70' : ''
      } rounded-lg py-1 flex items-center border  text-xs border-opacity-50 justify-center cursor-pointer text-warn border-warn`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        onClick();
      }}
      disabled={loading}
    >
      <ButtonTextWrapper
        loading={loading}
        loadingColor={'#FFA24D'}
        Text={() => {
          return (
            <span className="whitespace-nowrap text-opacity-50">{text}</span>
          );
        }}
      ></ButtonTextWrapper>
    </button>
  );
}

export function formatTimeDate(ts: number) {
  return moment(ts).format('YYYY-MM-DD HH:mm:ss');
}

export function Selector({
  list,
  selected,
  setSelect,
  className,
  width,
}: {
  list: { text: JSX.Element | string; textId: string; className?: string }[];
  selected: string;
  setSelect: (value: any) => void;
  className?: string;
  width?: string;
}) {
  return (
    <div className="absolute top-6 z-50">
      <div
        className={`${className}  flex flex-col ${
          width || 'min-w-28'
        }  items-start py-2 px-1.5 rounded-lg border border-borderC text-sm  bg-darkBg `}
      >
        {list.map((item, index) => {
          return (
            <div
              className={`whitespace-nowrap flex items-center justify-between cursor-pointer min-w-fit my-0.5 text-left px-1 py-1 w-full rounded-md ${
                item.className
              } ${
                selected === item.textId ? 'bg-symbolHover2' : ''
              } hover:bg-symbolHover2 `}
              key={item.textId + index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelect(item.textId);
              }}
            >
              <span className="whitespace-nowrap pr-2">{item.text}</span>
              {selected === item.textId && <CheckSelector />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
