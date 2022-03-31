import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import { TokenMetadata } from '../../services/ft-contract';
import { ArrowDownGreen, ArrowDownWhite } from '../icon';
import { isMobile } from '../../utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import { TokenBalancesView } from '~services/token';
import { IoCloseOutline } from 'react-icons/io5';
import CommonBasses from '../../components/tokens/CommonBasses';
import Table from '../../components/table/Table';
import { useTokensData } from '../../state/token';
import { toRealSymbol } from '../../utils/token';
import { FaSearch } from 'react-icons/fa';
import AddToken from './AddToken';
import { getTokenPriceList } from '../../services/indexer';
import { toPrecision } from '../../utils/numbers';

function sort(a: any, b: any) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  } else if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else {
    return a;
  }
}
export function tokenPrice(price: string, error?: boolean) {
  return (
    <span className="text-xs text-primaryText">
      {`$${error || !price ? '-' : toPrecision(price, 2)}`}
    </span>
  );
}

export function SingleToken({
  token,
  price,
}: {
  token: TokenMetadata;
  price: string;
}) {
  return (
    <>
      {token.icon ? (
        <img
          src={token.icon}
          alt={toRealSymbol(token.symbol)}
          style={{
            width: '25px',
            height: '25px',
          }}
          className="inline-block mr-2 border rounded-full border-greenLight"
        />
      ) : (
        <div
          className="inline-block mr-2 border rounded-full border-greenLight"
          style={{
            width: '25px',
            height: '25px',
          }}
        ></div>
      )}
      <span className="text-white">
        <div
          style={{
            position: 'relative',
            top: `${price ? '2px' : ''}`,
          }}
        >
          {toRealSymbol(token.symbol)}
        </div>
        <span
          style={{
            position: 'relative',
            bottom: `${price ? '2px' : ''}`,
          }}
        >
          {price ? tokenPrice(price) : null}
        </span>
      </span>
    </>
  );
}

export default function SelectToken({
  tokens,
  selected,
  render,
  onSelect,
  standalone,
  placeholder,
  balances,
  tokenPriceList,
}: {
  tokens: TokenMetadata[];
  selected: string | React.ReactElement;
  standalone?: boolean;
  placeholder?: string;
  render?: (token: TokenMetadata) => string;
  onSelect?: (token: TokenMetadata) => void;
  onSearch?: (value: string) => void;
  balances?: TokenBalancesView;
  tokenPriceList?: Record<string, any>;
}) {
  const [visible, setVisible] = useState(false);
  const [listData, setListData] = useState<TokenMetadata[]>([]);
  const [currentSort, setSort] = useState<string>('down');
  const [sortBy, setSortBy] = useState<string>('near');
  const [showCommonBasses, setShowCommonBasses] = useState<boolean>(true);
  const addToken = () => <AddToken />;

  if (!onSelect) {
    return (
      <button className="focus:outline-none p-1" type="button">
        {selected}
      </button>
    );
  }
  const dialogWidth = isMobile() ? '75%' : '20%';
  const dialogMinwidth = isMobile() ? 340 : 380;
  const dialogHidth = isMobile() ? '95%' : '57%';
  const intl = useIntl();
  const {
    tokensData,
    loading: loadingTokensData,
    trigger,
  } = useTokensData(tokens, balances);
  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    if (!loadingTokensData) {
      const sortedData = [...tokensData].sort(sortTypes[currentSort].fn);
      setListData(sortedData);
    }
  }, [loadingTokensData, tokensData]);

  useEffect(() => {
    if (!!tokensData) {
      const sortedData = [...tokensData].sort(sortTypes[currentSort].fn);
      setListData(sortedData);
    }
  }, [currentSort, sortBy]);

  const sortTypes: { [key: string]: any } = {
    up: {
      class: 'sort-up',
      fn: (a: any, b: any) => sort(a[sortBy], b[sortBy]),
    },
    down: {
      class: 'sort-down',
      fn: (a: any, b: any) => sort(b[sortBy], a[sortBy]),
    },
    default: {
      class: 'sort',
      fn: (a: any, b: any) => a,
    },
  };

  const onSortChange = (params: string) => {
    if (params === sortBy) {
      let nextSort;
      if (currentSort === 'down') nextSort = 'up';
      else if (currentSort === 'up') nextSort = 'down';
      setSort(nextSort);
    } else {
      setSort('up');
    }
    setSortBy(params);
  };

  const onSearch = (value: string) => {
    setShowCommonBasses(value.length === 0);
    const result = tokensData.filter(({ symbol }) =>
      toRealSymbol(symbol)
        .toLocaleUpperCase()
        .includes(value.toLocaleUpperCase())
    );
    setListData(result);
  };

  const handleClose = () => {
    const sortedData = [...tokensData].sort(sortTypes[currentSort].fn);
    setListData(sortedData);
    setVisible(false);
    setShowCommonBasses(true);
  };

  return (
    <MicroModal
      open={visible}
      handleClose={handleClose}
      trigger={() => (
        <div
          className={`focus:outline-none my-auto  ${
            standalone ? 'w-full' : 'w-2/5'
          }`}
          onClick={() => setVisible(true)}
        >
          {selected || (
            <section
              className={`flex justify-between items-center px-3 py-2 ${
                standalone
                  ? 'bg-inputDarkBg text-white relative flex overflow-hidden rounded align-center my-2'
                  : ''
              }`}
            >
              <p
                className="text-lg text-gray-400 font-semibold leading-none"
                style={{ lineHeight: 'unset' }}
              >
                {placeholder ?? 'Select'}
              </p>
              <div className="pl-2">
                <ArrowDownWhite />
              </div>
            </section>
          )}
        </div>
      )}
      overrides={{
        Overlay: {
          style: {
            zIndex: 110,
            backgroundColor: 'rgba(0, 19, 32, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
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
      {() => (
        <section className="text-white">
          <div className="flex items-center justify-between pb-5 px-8 relative">
            <h2 className="text-sm font-bold text-center">
              <FormattedMessage
                id="select_token"
                defaultMessage="Select Token"
              />
            </h2>
            <IoCloseOutline
              onClick={() => handleClose()}
              className="absolute text-gray-400 text-2xl right-6 cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center mb-5 mx-8">
            <div className="flex-auto rounded text-gray-400 flex items-center pr-2 mr-4 bg-inputDarkBg">
              <input
                className={`text-sm outline-none rounded w-full py-2 px-1`}
                placeholder={intl.formatMessage({ id: 'search_token' })}
                onChange={(evt) => onSearch(evt.target.value)}
              />
              <FaSearch />
            </div>
            {addToken()}
          </div>
          {showCommonBasses && (
            <CommonBasses
              tokens={tokensData}
              onClick={(token) => {
                onSelect && onSelect(token);
                handleClose();
              }}
              tokenPriceList={tokenPriceList}
            />
          )}
          <Table
            sortBy={sortBy}
            tokenPriceList={tokenPriceList}
            currentSort={currentSort}
            onSortChange={onSortChange}
            tokens={listData}
            onClick={(token) => {
              onSelect && onSelect(token);
              handleClose();
            }}
            balances={balances}
          />
        </section>
      )}
    </MicroModal>
  );
}
