import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/ft-contract';
import { ArrowDownGreen } from '../icon';
import { isMobile } from '~utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import { TokenBalancesView } from '~services/token';
import { IoCloseOutline } from 'react-icons/io5';
import CommenBasses from '~components/tokens/CommenBasses';
import Table from '~components/table/Table';
import {
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '~utils/numbers';
import { useDepositableBalance } from '~state/token';
import { toRealSymbol } from '~utils/token';

export default function OldSelectToken({
  tokens,
  selected,
  render,
  onSelect,
  addToken,
  standalone,
  placeholder,
  balances,
}: {
  tokens: TokenMetadata[];
  selected: string | React.ReactElement;
  standalone?: boolean;
  placeholder?: string;
  render?: (token: TokenMetadata) => React.ReactElement;
  onSelect?: (token: TokenMetadata) => void;
  onSearch?: (value: string) => void;
  addToken?: () => JSX.Element;
  balances?: TokenBalancesView;
}) {
  const [listData, setListData] = useState<any[]>([]);

  if (!onSelect) {
    return (
      <button className="focus:outline-none p-1" type="button">
        {selected}
      </button>
    );
  }
  const dialogWidth = isMobile() ? '75%' : '35%';
  const dialogMinwidth = isMobile() ? 340 : 490;
  const dialogHidth = isMobile() ? '95%' : '57%';
  const intl = useIntl();
  const tokensData =
    tokens?.length > 0 &&
    tokens.map((item) => {
      const totalTokenAmount = toReadableNumber(
        item.decimals,
        useDepositableBalance(item.id)
      );
      const nearCount = toPrecision(totalTokenAmount, 6) || '0';
      const refCount = toRoundedReadableNumber({
        decimals: item.decimals,
        number: balances ? balances[item.id] : '0',
      });
      return {
        ...item,
        asset: toRealSymbol(item.symbol),
        near: Number(nearCount),
        ref: Number(refCount),
        total: Number(nearCount) + Number(refCount),
      };
    });

  useEffect(() => {
    setListData(tokensData);
  }, [tokens]);

  const onSearch = (value: string) => {
    const result = tokens.filter(({ symbol }) =>
      toRealSymbol(symbol)
        .toLocaleUpperCase()
        .includes(value.toLocaleUpperCase())
    );
    setListData(result);
  };

  return (
    <MicroModal
      trigger={(open) => (
        <button
          className={`focus:outline-none ${standalone ? 'w-full' : ''}`}
          type="button"
          onClick={open}
        >
          {selected || (
            <section
              className={`flex justify-between items-center px-3 py-3 ${
                standalone
                  ? 'bg-inputBg relative flex overflow-hidden rounded-lg align-center my-2 border'
                  : ''
              }`}
            >
              <p
                className="text-xs font-semibold leading-none"
                style={{ lineHeight: 'unset' }}
              >
                {placeholder ?? 'Select'}
              </p>
              <div className="pl-2">
                <ArrowDownGreen />
              </div>
            </section>
          )}
        </button>
      )}
      overrides={{
        Overlay: {
          style: {
            zIndex: 110,
            backgroundColor: 'rgba(0, 19, 32, 0.65)',
          },
        },
        Dialog: {
          style: {
            width: dialogWidth,
            minWidth: dialogMinwidth,
            borderRadius: '0.75rem',
            border: '1px solid rgba(0, 198, 162, 0.5)',
            padding: '1.5rem 0',
            background: '#1D2932',
            height: dialogHidth,
            zIndex: 100,
          },
        },
      }}
    >
      {(close) => (
        <section className="text-white">
          <div className="flex items-center justify-between pb-5 pr-8 px-6 relative">
            <h2 className="text-sm font-bold text-center">
              <FormattedMessage
                id="select_token"
                defaultMessage="Select Token"
              />
            </h2>
            {addToken && addToken()}
            <IoCloseOutline
              onClick={() => close()}
              className="absolute text-gray-400 text-2xl right-6"
            />
          </div>
          <div className="rounded-lg w-full my-2 px-6">
            <input
              className={`text-sm min bg-black bg-opacity-25 focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
              placeholder={intl.formatMessage({ id: 'search_pools' })}
              onChange={(evt) => onSearch(evt.target.value)}
            />
          </div>
          <CommenBasses
            tokens={tokensData}
            onClick={(token) => {
              onSelect && onSelect(token);
              close();
            }}
          />
          <Table
            tokens={listData}
            render={render}
            onClick={(token) => {
              onSelect && onSelect(token);
              close();
            }}
            balances={balances}
          />
        </section>
      )}
    </MicroModal>
  );
}
