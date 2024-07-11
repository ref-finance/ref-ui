import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import MicroModal from 'react-micro-modal';
import { TokenMetadata } from '../../services/ft-contract';
import {
  ArrowDownGreen,
  ArrowDownWhite,
  QuestionMark,
  TokenRisk,
} from '../icon';
import { isMobile, getExplorer } from '../../utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  TokenBalancesView,
  getGlobalWhitelist,
  get_auto_whitelisted_postfix,
} from '../../services/token';
import { IoCloseOutline } from '../reactIcons';
import CommonBasses from '../../components/tokens/CommonBasses';
import Table from '../../components/table/Table';
import { useTokensData, useGlobalWhitelistTokens } from '../../state/token';
import { toRealSymbol } from '../../utils/token';
import { FaSearch } from '../reactIcons';
import AddToken from './AddToken';
import { getTokenPriceList } from '../../services/indexer';
import {
  toPrecision,
  divide,
  toInternationalCurrencySystem,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import {
  BTCIDS,
  BTC_CLASS_STABLE_TOKEN_IDS,
  CUSDIDS,
  LINEARIDS,
  NEARXIDS,
  NEAR_CLASS_STABLE_TOKEN_IDS,
  STABLE_TOKEN_USN_IDS,
  STNEARIDS,
  TOKEN_BLACK_LIST,
  USDC_TOKEN_ID,
  USDCe_TOKEN_ID,
  USDT_TOKEN_ID,
  USDTe_TOKEN_ID,
  BRRR_TOKEN_ID,
  USD_CLASS_STABLE_TOKEN_IDS,
} from '../../services/near';
import {
  STABLE_TOKEN_IDS,
  STABLE_POOL_TYPE,
  USD_CLASS_STABLE_POOL_IDS,
} from '../../services/near';
import {
  OutLinkIcon,
  DefaultTokenImg,
  SelectTokenCloseButton,
  TknIcon,
} from '../../components/icon/Common';
import _, { trimEnd } from 'lodash';
import {
  GradientButton,
  ButtonTextWrapper,
} from '../../components/button/Button';
import { registerTokenAndExchange } from '../../services/token';
import { WalletContext } from '../../utils/wallets-integration';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { REF_TOKEN_ID } from '../../services/near';
import { useAllPoolsV2 } from '../../state/swapV3';
import { Images, Symbols } from '../../components/stableswap/CommonComp';
import { IconLeftV3 } from '../tokens/Icon';
import { PoolInfo } from '../../services/swapV3';
import { sort_tokens_by_base, openUrl } from '../../services/commonV3';
import getConfigV2 from '../../services/configV2';
import SelectTokenTable from './SelectTokenTable';
import CustomTooltip from '../customTooltip/customTooltip';
const configV2 = getConfigV2();

export const USER_COMMON_TOKEN_LIST = 'USER_COMMON_TOKEN_LIST2';

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
      {`$${
        error || !price
          ? '-'
          : toInternationalCurrencySystemLongString(price, 2)
      }`}
    </span>
  );
}
export function SingleToken({
  token,
  price,
  isRisk,
}: {
  token: TokenMetadata;
  price: string;
  isRisk: boolean;
}) {
  const is_native_token = configV2.NATIVE_TOKENS.includes(token?.id);
  const [showTooltip, setShowTooltip] = useState(false);
  const isTokenAtRisk = !!token.isRisk;
  return (
    <>
      {token.icon ? (
        <div className="relative flex-shrink-0">
          <img
            src={token.icon}
            alt={toRealSymbol(token.symbol)}
            className="inline-block mr-2 border rounded-full border-black"
            style={{ width: '30px', height: '30px' }}
          />
          {isTokenAtRisk ? (
            <div className="absolute bottom-0 left-0">
              <TknIcon />
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className="inline-block mr-2 border rounded-full border-black relative"
          style={{ width: '30px', height: '30px' }}
        >
          {isTokenAtRisk ? (
            <div className="absolute bottom-0 left-0">
              <TknIcon />
            </div>
          ) : null}
        </div>
        // <DefaultTokenImg className="mr-2"></DefaultTokenImg>
      )}
      <div className="flex flex-col justify-between">
        <div className={`flex items-center`}>
          <span
            className="text-sm text-white overflow-hidden whitespace-nowrap max-w-28 truncate"
            title={toRealSymbol(token.symbol)}
          >
            {toRealSymbol(token.symbol)}
          </span>
          {isTokenAtRisk && (
            <div
              className="ml-2 relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <span>
                <TokenRisk />
              </span>
              {showTooltip && (
                <div className="absolute z-50 -top-3 left-5 px-2 w-max py-1.5 border border-borderColor text-farmText text-xs rounded-md bg-cardBg">
                  Uncertified token, higher risk.
                </div>
              )}
            </div>
          )}
          {is_native_token ? (
            <span className="text-gradientFromHover bg-gradientFromHover bg-opacity-30 text-sm px-1 rounded-md ml-2 border border-gradientFromHover">
              Native
            </span>
          ) : null}
        </div>
        <span
          className="text-xs text-primaryText overflow-hidden whitespace-nowrap w-32 truncate"
          title={token.name}
        >
          {token.name}
        </span>
      </div>
    </>
  );
}

export const StableSelectToken = ({
  onSelect,
  tokens,
  selected,
  preSelected,
  postSelected,
  onSelectPost,
  customWidth,
}: {
  tokens: TokenMetadata[];
  onSelect?: (token: TokenMetadata) => void;
  selected: string | React.ReactElement;
  preSelected?: TokenMetadata;
  postSelected?: TokenMetadata;
  onSelectPost?: (t: TokenMetadata) => void;
  customWidth?: boolean;
}) => {
  const USDTokenList = USD_CLASS_STABLE_TOKEN_IDS;
  const BTCTokenList = BTC_CLASS_STABLE_TOKEN_IDS;

  const NEARTokenList = NEAR_CLASS_STABLE_TOKEN_IDS;

  const [stableCoinType, setStableCoinType] = useState<STABLE_POOL_TYPE>(
    STABLE_POOL_TYPE.USD
  );

  const ref = useRef(null);

  const [visible, setVisible] = useState(false);

  const USDtokens = USDTokenList.map((id) => tokens.find((t) => t.id === id));

  const BTCtokens = BTCTokenList.map((id) => tokens.find((t) => t.id === id));

  const NEARtokens = NEARTokenList.map((id) => tokens.find((t) => t.id === id));

  const coverUSD =
    preSelected && !USDtokens.find((token) => token.id === preSelected.id);

  const coverBTC =
    preSelected && !BTCtokens.find((token) => token.id === preSelected.id);

  const coverNEAR =
    preSelected && !NEARtokens.find((token) => token.id === preSelected.id);

  const handleSelect = (token: TokenMetadata) => {
    if (token.id != NEARXIDS[0]) {
      onSelect(token);
    }

    if (!postSelected || !onSelectPost) {
      return;
    }

    const onTokenBTC = BTCtokens.find((t) => t.id === token.id);

    const onTokenUSD = USDtokens.find((t) => t.id === token.id);

    const onTokenNEAR = NEARtokens.find((t) => t.id === token.id);

    if (onTokenBTC && !BTCtokens.find((t) => t.id === postSelected.id)) {
      onSelectPost(BTCtokens.find((t) => t.id !== token.id));
    } else if (onTokenUSD && !USDtokens.find((t) => t.id === postSelected.id)) {
      onSelectPost(USDtokens.find((t) => t.id !== token.id));
    } else if (
      onTokenNEAR &&
      !NEARtokens.find((t) => t.id === postSelected.id)
    ) {
      onSelectPost(NEARtokens.find((t) => t.id !== token.id));
    }
  };

  useEffect(() => {
    if (!coverUSD) {
      setStableCoinType(STABLE_POOL_TYPE.USD);
    } else if (!coverBTC) {
      setStableCoinType(STABLE_POOL_TYPE.BTC);
    } else if (!coverNEAR) {
      setStableCoinType(STABLE_POOL_TYPE.NEAR);
    }
  }, [coverBTC, coverUSD, coverNEAR]);

  useEffect(() => {
    if (visible)
      document.addEventListener('click', () => {
        setVisible(false);
      });
  }, [visible]);

  const getDisplayList = (type: string) => {
    switch (type) {
      case 'USD':
        return USDtokens;
      case 'BTC':
        return BTCtokens;
      case 'NEAR':
        return NEARtokens;
    }
  };

  const displayList = getDisplayList(stableCoinType).filter(
    (t) => TOKEN_BLACK_LIST.indexOf(t.id) === -1
  );

  const maxList =
    NEARtokens > (USDtokens.length > BTCtokens.length ? USDtokens : BTCtokens)
      ? NEARtokens
      : USDtokens.length > BTCtokens.length
      ? USDtokens
      : BTCtokens;

  return (
    <div
      className={`${
        customWidth ? '' : 'w-2/5'
      }  outline-none my-auto relative overflow-visible`}
    >
      <div
        className={`w-full relative `}
        onClick={(e) => {
          e.nativeEvent.stopImmediatePropagation();
          if (
            !visible &&
            document.getElementsByClassName('stable-token-selector')?.[0]
          ) {
            ref.current = document.getElementsByClassName(
              'stable-token-selector'
            )?.[0];
            ref.current.click();
          }
          setVisible(!visible);
        }}
      >
        {selected}
      </div>
      <div
        className={`stable-token-selector rounded-2xl flex flex-col w-56 top-12 py-3 ${
          visible ? 'block' : 'hidden'
        } absolute`}
        style={{
          background:
            getExplorer() === 'Firefox' ? '#323E46' : 'rgba(58,69,77,0.6)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid #415462',
          zIndex: 999,
        }}
      >
        <div
          className="w-full flex items-center justify-between"
          style={{
            borderBottom: '1px solid #415462',
          }}
        >
          <div
            className={`rounded-lg py-1 w-full px-4 mb-2 text-center font-bold mt-1 ml-3 text-sm ${
              stableCoinType === 'USD'
                ? 'text-gradientFrom bg-black bg-opacity-20'
                : 'text-primaryText cursor-pointer'
            }  self-start ${coverUSD ? 'opacity-30' : ''}`}
            onClick={(e) => {
              e.nativeEvent.stopImmediatePropagation();
              if (coverUSD) return;
              else setStableCoinType(STABLE_POOL_TYPE.USD);
            }}
          >
            USD
          </div>
          <div
            className={`rounded-lg w-full py-1 text-center font-bold  px-4 mb-2 mt-1
          ${
            stableCoinType === 'BTC'
              ? 'text-BTCColor bg-black bg-opacity-20'
              : 'text-primaryText cursor-pointer'
          }
           text-sm  self-start
            ${coverBTC ? 'opacity-30' : ''}
            `}
            onClick={(e) => {
              e.nativeEvent.stopImmediatePropagation();
              if (coverBTC) return;
              else setStableCoinType(STABLE_POOL_TYPE.BTC);
            }}
          >
            BTC
          </div>

          <div
            className={`rounded-lg w-full py-1 text-center mr-3 font-bold  px-4 mb-2 mt-1
          ${
            stableCoinType === 'NEAR'
              ? 'text-NEARBlue bg-black bg-opacity-20'
              : 'text-primaryText cursor-pointer'
          }
           text-sm  self-start
            ${coverNEAR ? 'opacity-30' : ''}
            `}
            onClick={(e) => {
              e.nativeEvent.stopImmediatePropagation();
              if (coverNEAR) return;
              else setStableCoinType(STABLE_POOL_TYPE.NEAR);
            }}
          >
            NEAR
          </div>
        </div>
        <div
          className={`flex flex-col`}
          style={{
            height: `${maxList.length * 50 + 20}px`,
          }}
        >
          {displayList.map((token) => {
            return (
              <div
                key={`stable-token-${token.id}`}
                className={`flex items-center justify-between hover:bg-black hover:bg-opacity-20 cursor-pointer py-2 pl-4 pr-2 mx-3 mt-3 rounded-2xl `}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();

                  setVisible(!visible);
                  handleSelect(token);
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {toRealSymbol(token.symbol)}
                </span>
                <span>
                  {token.icon ? (
                    <img
                      className="rounded-full border border-gradientFromHover"
                      src={token.icon}
                      style={{
                        width: '26px',
                        height: '26px',
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-full border border-gradientFromHover"
                      style={{
                        width: '26px',
                        height: '26px',
                      }}
                    ></div>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export const localTokens = createContext(null);
export default function SelectToken({
  tokens,
  selected,
  render,
  onSelect,
  standalone,
  placeholder,
  balances,
  tokenPriceList,
  forCross,
  customWidth,
  allowWNEAR,
  className,
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
  forCross?: boolean;
  customWidth?: boolean;
  allowWNEAR?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [listData, setListData] = useState<TokenMetadata[]>([]);
  const [listTknData, setListTknData] = useState<TokenMetadata[]>([]);
  const [listTknxData, setListTknxData] = useState<TokenMetadata[]>([]);
  const [currentSort, setSort] = useState<string>('down');
  const [sortBy, setSortBy] = useState<string>('near');
  const [showCommonBasses, setShowCommonBasses] = useState<boolean>(true);
  const [commonBassesTokens, setCommonBassesTokens] = useState([]);
  const [searchNoData, setSearchNoData] = useState(false);
  const [tknSearchNoData, setTknSearchNoData] = useState(false);
  const [addTokenLoading, setAddTokenLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [addTokenError, setAddTokenError] = useState(false);
  const addToken = () => <AddToken />;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const dialogWidth = isMobile() ? '95%' : forCross ? '25%' : '420px';
  const dialogMinwidth = isMobile() ? 340 : 380;
  const dialogHeight = isMobile() ? '95%' : '57%';
  const dialogMinHeight = isMobile() ? '95%' : '540px';
  const intl = useIntl();
  const searchRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Default');
  const { tokensData, loading: loadingTokensData } = useTokensData(
    tokens.filter(
      (t) =>
        TOKEN_BLACK_LIST.indexOf(t.id) === -1 &&
        (!t.isRisk || (t.isRisk && t.isUserToken))
    ),
    balances,
    visible
  );
  const { tokensData: tknTokensData, loading: loadingTKNTokensData } =
    useTokensData(
      tokens.filter(
        (t) =>
          TOKEN_BLACK_LIST.indexOf(t.id) === -1 &&
          t.id.indexOf('tknx') == -1 &&
          t.isRisk &&
          !t.isUserToken
      ),
      balances,
      visible
    );
  const { tokensData: tknxTokensData, loading: loadingTKNXTokensData } =
    useTokensData(
      tokens.filter(
        (t) =>
          TOKEN_BLACK_LIST.indexOf(t.id) === -1 &&
          t.id.indexOf('tknx') != -1 &&
          t.isRisk &&
          !t.isUserToken
      ),
      balances,
      visible
    );
  useEffect(() => {
    if (tokensData?.length && !loadingTokensData) {
      tokensData.sort(sortTypes[currentSort].fn);
      setListData(tokensData);
    }
  }, [tokensData?.length, loadingTokensData, currentSort]);
  useEffect(() => {
    if (tknTokensData?.length && !loadingTKNTokensData) {
      tknTokensData.sort(sortTypes[currentSort].fn);
      setListTknData(tknTokensData);
    }
  }, [tknTokensData?.length, loadingTKNTokensData, currentSort]);

  useEffect(() => {
    if (tknTokensData?.length && !loadingTKNXTokensData) {
      tknxTokensData.sort(sortTypes[currentSort].fn);
      setListTknxData(tknxTokensData);
    }
  }, [tknxTokensData?.length, loadingTKNXTokensData, currentSort]);

  useEffect(() => {
    getLatestCommonBassesTokens();
  }, [tokensData]);

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
  const sortBySymbol = (a: TokenMetadata, b: TokenMetadata) => {
    if (+a.near == 0 && +b.near == 0) {
      const a_symbol = toRealSymbol(a.symbol).toLocaleLowerCase();
      const b_symbol = toRealSymbol(b.symbol).toLocaleLowerCase();
      return a_symbol.localeCompare(b_symbol);
    }
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
    setAddTokenError(false);
    setAddTokenLoading(false);
    setSearchValue(value);
    setShowCommonBasses(value.length === 0);
    const result = tokensData.filter((token) => {
      const symbol = token?.symbol === 'NEAR' ? 'wNEAR' : token?.symbol;
      if (!symbol) return false;
      const condition1 = toRealSymbol(symbol)
        .toLocaleUpperCase()
        .includes(value.toLocaleUpperCase());
      const condition2 =
        token.id.toLocaleLowerCase() == value.toLocaleLowerCase();
      return condition1 || condition2;
    });
    const resultTkn = tknTokensData.filter((token) => {
      const symbol = token?.symbol === 'NEAR' ? 'wNEAR' : token?.symbol;
      if (!symbol) return false;
      const condition1 = toRealSymbol(symbol)
        .toLocaleUpperCase()
        .includes(value.toLocaleUpperCase());
      const condition2 =
        token.id.toLocaleLowerCase() == value.toLocaleLowerCase();
      return condition1 || condition2;
    });
    result.sort(sortBySymbol);
    setListData(result);
    setListTknData(resultTkn);
    if (!loadingTokensData && value.length > 0 && result.length == 0) {
      setSearchNoData(true);
    } else {
      setSearchNoData(false);
    }
    if (!loadingTKNTokensData && value.length > 0 && resultTkn.length == 0) {
      setTknSearchNoData(true);
    } else {
      setTknSearchNoData(false);
    }
  };

  const debounceSearch = _.debounce(onSearch, 300);

  const handleClose = () => {
    const sortedData = [...tokensData].sort(sortTypes[currentSort].fn);
    if (tokensData.length > 0) {
      sortedData.sort(sortBySymbol);
      setListData(sortedData);
    }
    setVisible(false);
    setShowCommonBasses(true);
    setSearchNoData(false);
    setAddTokenError(false);
    clear();
  };
  function getLatestCommonBassesTokens() {
    const local_user_list = getLatestCommonBassesTokenIds();
    const temp_tokens: TokenMetadata[] = [];
    local_user_list.forEach((id: string) => {
      const t = tokens.find((token: TokenMetadata) => {
        if (id == 'near') {
          if (token.id == WRAP_NEAR_CONTRACT_ID && token.symbol == 'NEAR')
            return true;
        } else if (id == WRAP_NEAR_CONTRACT_ID) {
          if (token.id == WRAP_NEAR_CONTRACT_ID && token.symbol == 'wNEAR')
            return true;
        } else {
          if (token.id == id) return true;
        }
      });
      if (t) {
        temp_tokens.push(t);
      }
    });
    setCommonBassesTokens(temp_tokens);
  }
  function getLatestCommonBassesTokenIds() {
    const cur_status = localStorage.getItem(USER_COMMON_TOKEN_LIST);
    if (!cur_status) {
      const init = [
        'near',
        REF_TOKEN_ID,
        BRRR_TOKEN_ID,
        USDC_TOKEN_ID,
        USDT_TOKEN_ID,
        USDCe_TOKEN_ID,
        USDTe_TOKEN_ID,
      ];
      localStorage.setItem(USER_COMMON_TOKEN_LIST, JSON.stringify(init));
    }
    const local_user_list_str =
      localStorage.getItem(USER_COMMON_TOKEN_LIST) || '[]';
    const local_user_list = JSON.parse(local_user_list_str);
    return local_user_list;
  }
  function addTokenSubmit() {
    setAddTokenError(false);
    setAddTokenLoading(true);
    registerTokenAndExchange(searchValue)
      .then()
      .catch((error) => {
        setAddTokenError(true);
        setAddTokenLoading(false);
      });
  }
  function clear() {
    setSearchValue('');
    searchRef.current.value = '';
    onSearch('');
  }
  if (!onSelect) {
    return (
      <button className="focus:outline-none p-1" type="button">
        {selected}
      </button>
    );
  }
  const TknTip = `
    <div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">
    Created by any user on https://tkn.homes with the tkn.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>`;
  const TknxTip = `
    <div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">
    Created by any user on https://tkn.homes with the tknx.near suffix, poses high risks. Ref has not certified it. Exercise caution.
    </div>`;
  return (
    <MicroModal
      open={visible}
      handleClose={handleClose}
      trigger={() => (
        <div
          className={`focus:outline-none my-auto flex-shrink-0  ${
            !customWidth ? (standalone ? 'w-full' : className || 'w-2/5') : ''
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
            backgroundColor: 'rgba(0, 19, 32, 0.95)',
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
            height: dialogHeight,
            minHeight: dialogMinHeight,
            zIndex: 100,
            overflow: 'hidden',
            position: 'relative',
          },
        },
      }}
    >
      {() => (
        <section className="text-white">
          <div className="flex items-center justify-between pb-5 px-8 xsm:px-5 relative">
            <h2 className="text-center gotham_bold text-lg">
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
          <div className="flex flex-col  mb-5 mx-6 xsm:mx-3">
            <div className="relative flex items-center h-11 rounded-lg text-gray-400 searchBoxGradientBorder px-3">
              <FaSearch
                className={`mr-2 ${
                  searchValue ? 'text-greenColor' : 'text-farmText'
                }`}
              />
              <input
                ref={searchRef}
                className={`text-base text-white outline-none rounded w-full py-2 pl-1 mr-6`}
                placeholder={intl.formatMessage({
                  id: 'search_name_or_address',
                })}
                onChange={(evt) => debounceSearch(evt.target.value)}
              />
              <SelectTokenCloseButton
                onClick={clear}
                className={`absolute right-3 cursor-pointer ${
                  searchValue ? '' : 'hidden'
                }`}
              ></SelectTokenCloseButton>
            </div>
            {addTokenError ? (
              <div className="text-redwarningColor text-sm mt-2">
                <FormattedMessage id="token_address_invalid"></FormattedMessage>
              </div>
            ) : null}
          </div>
          <div
            className="overflow-auto overflow-x-hidden absolute w-full"
            style={{ height: 'calc(100% - 150px)' }}
          >
            <localTokens.Provider
              value={{
                commonBassesTokens,
                getLatestCommonBassesTokens,
                getLatestCommonBassesTokenIds,
              }}
            >
              {showCommonBasses && (
                <CommonBasses
                  onClick={(token) => {
                    onSelect && onSelect(token);
                  }}
                  tokenPriceList={tokenPriceList}
                  allowWNEAR={allowWNEAR}
                  handleClose={handleClose}
                />
              )}
              <div className="mt-4 mb-4 relative z-50 mx-6 flex w-max items-center justify-between border border-borderColor rounded-lg border-opacity-20 text-primaryText text-sm cursor-pointer">
                <div
                  className={`text-center px-2.5 py-2 ${
                    activeTab === 'Default'
                      ? 'text-white bg-primaryOrderly bg-opacity-20 rounded-lg'
                      : ''
                  }`}
                  onClick={() => setActiveTab('Default')}
                >
                  Default
                </div>
                {/* <div
                  className={`flex-1 text-center py-2.5 ${
                    activeTab === 'Watchlist'
                      ? 'text-white border-b-2 border-white'
                      : ''
                  }`}
                  onClick={() => setActiveTab('Watchlist')}
                >
                  Watchlist
                </div> */}
                <div
                  className={`text-center px-2.5 py-2 ${
                    activeTab === 'TKN'
                      ? 'text-white bg-primaryOrderly bg-opacity-20 rounded-lg'
                      : ''
                  }`}
                  onClick={() => setActiveTab('TKN')}
                >
                  TKN
                  <div
                    className="text-white text-right ml-1 inline-block"
                    data-class="reactTip"
                    data-tooltip-id="tknId"
                    data-place="left"
                    data-tooltip-html={TknTip}
                  >
                    <QuestionMark></QuestionMark>
                    <CustomTooltip id="tknId" />
                  </div>
                </div>
                {/* tknx */}
                {/* <div
                  className={`text-center px-2.5 py-2 ${
                    activeTab === 'TKNX'
                      ? 'text-white bg-primaryOrderly bg-opacity-20 rounded-lg'
                      : ''
                  }`}
                  onClick={() => setActiveTab('TKNX')}
                >
                  TKNX
                  <div
                    className="text-white text-right ml-1 inline-block"
                    data-class="reactTip"
                    data-tooltip-id="tknId"
                    data-place="left"
                    data-tooltip-html={TknxTip}
                  >
                    <QuestionMark></QuestionMark>
                    <CustomTooltip id="tknId" />
                  </div>
                </div> */}
              </div>
              <div>
                {activeTab === 'Default' && (
                  <SelectTokenTable
                    sortBy={sortBy}
                    tokenPriceList={tokenPriceList}
                    currentSort={currentSort}
                    onSortChange={onSortChange}
                    tokens={listData}
                    onClick={(token) => {
                      if (token.id != NEARXIDS[0]) {
                        if (
                          !(
                            token.id == WRAP_NEAR_CONTRACT_ID &&
                            token.symbol == 'wNEAR' &&
                            !allowWNEAR
                          )
                        ) {
                          onSelect && onSelect(token);
                        }
                      }
                      handleClose();
                    }}
                    balances={balances}
                    forCross={forCross}
                    showRiskTokens={false}
                  />
                )}
                {/* {activeTab === 'Watchlist' && (
                  <>
                    {showCommonBasses && (
                      <CommonBasses
                        sortBy={sortBy}
                        onClick={(token) => {
                          onSelect && onSelect(token);
                        }}
                        tokenPriceList={tokenPriceList}
                        allowWNEAR={allowWNEAR}
                        handleClose={handleClose}
                        balances={balances}
                        forCross={forCross}
                        tokens={listData.concat(listTknData)}
                      />
                    )}
                  </>
                )} */}
                {activeTab === 'TKN' && (
                  <SelectTokenTable
                    sortBy={sortBy}
                    tokenPriceList={tokenPriceList}
                    currentSort={currentSort}
                    onSortChange={onSortChange}
                    tokens={listTknData}
                    onClick={(token) => {
                      if (token.id != NEARXIDS[0]) {
                        if (
                          !(
                            token.id == WRAP_NEAR_CONTRACT_ID &&
                            token.symbol == 'wNEAR' &&
                            !allowWNEAR
                          )
                        ) {
                          onSelect && onSelect(token);
                        }
                      }
                      handleClose();
                    }}
                    balances={balances}
                    forCross={forCross}
                    showRiskTokens={true}
                  />
                )}

                {activeTab === 'TKNX' && (
                  <SelectTokenTable
                    sortBy={sortBy}
                    tokenPriceList={tokenPriceList}
                    currentSort={currentSort}
                    onSortChange={onSortChange}
                    tokens={listTknxData}
                    onClick={(token) => {
                      if (token.id != NEARXIDS[0]) {
                        if (
                          !(
                            token.id == WRAP_NEAR_CONTRACT_ID &&
                            token.symbol == 'wNEAR' &&
                            !allowWNEAR
                          )
                        ) {
                          onSelect && onSelect(token);
                        }
                      }
                      handleClose();
                    }}
                    balances={balances}
                    forCross={forCross}
                    showRiskTokens={true}
                  />
                )}
              </div>
            </localTokens.Provider>
          </div>
          {searchNoData && activeTab === 'Default' ? (
            <div className="flex flex-col  items-center justify-center mt-32 relative z-10">
              <div className="text-sm text-farmText">
                <FormattedMessage id="no_token_found"></FormattedMessage>
              </div>
              {isSignedIn ? (
                <GradientButton
                  onClick={addTokenSubmit}
                  color="#fff"
                  loading={addTokenLoading}
                  className={`h-9 mt-5 px-6 xsm:px-3.5 text-center text-sm text-white focus:outline-none`}
                >
                  <ButtonTextWrapper
                    loading={addTokenLoading}
                    Text={() => (
                      <FormattedMessage
                        id="add_token"
                        defaultMessage="Add token"
                      />
                    )}
                  />
                </GradientButton>
              ) : null}
            </div>
          ) : null}
          {tknSearchNoData && activeTab === 'TKN' ? (
            <div className="flex flex-col  items-center justify-center mt-32 relative z-10">
              <div className="text-sm text-farmText">
                <FormattedMessage id="no_token_found"></FormattedMessage>
              </div>
            </div>
          ) : null}
          {tknSearchNoData && activeTab === 'TKNX' ? (
            <div className="flex flex-col  items-center justify-center mt-32 relative z-10">
              <div className="text-sm text-farmText">
                <FormattedMessage id="no_token_found"></FormattedMessage>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </MicroModal>
  );
}

export function SelectTokenDCL({
  selectTokenIn,
  selectTokenOut,
  selectedToken,
  onSelect,
  selected,
  className,
  notNeedSortToken,
  limitOrder = false,
}: {
  selectTokenIn?: (token: TokenMetadata) => void;
  selectTokenOut?: (token: TokenMetadata) => void;
  onSelect?: (token: TokenMetadata) => void;
  selectedToken?: TokenMetadata;
  selected?: JSX.Element;
  className?: string;
  notNeedSortToken?: boolean;
  limitOrder?: boolean;
}) {
  const allPools = useAllPoolsV2(!limitOrder);

  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const intl = useIntl();

  const mobileDevice = isMobile();

  const globalWhiteList = useGlobalWhitelistTokens();

  const displayPools = allPools?.reduce((acc, cur, i) => {
    const id = [cur.token_x, cur.token_y].sort().join('|');
    if (!acc[id]) {
      acc[id] = cur;
    }
    return acc;
  }, {} as Record<string, PoolInfo>);

  const handleSelect = (p: PoolInfo) => {
    // select token in
    const { token_x_metadata, token_y_metadata } = p;
    const tokens = notNeedSortToken
      ? [token_x_metadata, token_y_metadata]
      : sort_tokens_by_base([token_x_metadata, token_y_metadata]);

    if (!selectedToken) {
      selectTokenIn(tokens[0]);
      selectTokenOut(tokens[1]);

      return;
    }

    if (!!selectTokenOut) {
      if (selectedToken?.id === tokens[0].id) {
        selectTokenOut(tokens[1]);
      } else if (selectedToken?.id === tokens[1].id) {
        selectTokenOut(tokens[0]);
      } else {
        onSelect(tokens[0]);
        selectTokenOut(tokens[1]);
      }

      return;
    }

    if (!!selectTokenIn) {
      if (selectedToken?.id === tokens[0].id) {
        selectTokenIn(tokens[1]);
      } else if (selectedToken?.id === tokens[1].id) {
        selectTokenIn(tokens[0]);
      } else {
        onSelect(tokens[1]);
        selectTokenIn(tokens[0]);
      }
      return;
    }
  };

  const renderPools = useMemo(
    () =>
      Object.values(displayPools || {})?.filter((p) => {
        const { token_x_metadata, token_y_metadata } = p;
        return (
          !!globalWhiteList.find((t) => t.id === token_x_metadata.id) &&
          !!globalWhiteList.find((t) => t.id === token_y_metadata.id)
        );
      }),
    [globalWhiteList]
  );

  const renderList = renderPools?.map((p) => {
    const { token_x_metadata, token_y_metadata } = p;
    const tokens = sort_tokens_by_base([token_x_metadata, token_y_metadata]);
    return (
      <div
        key={p.pool_id}
        className="flex items-center text-sm xs:text-base min-w-max px-1.5 bg-opacity-90 py-3 rounded-lg hover:bg-dclSelectTokenHover cursor-pointer"
        onClick={() => {
          handleSelect(p);
          setHoverSelectToken(false);
        }}
      >
        <Images tokens={tokens} size="5" className="mr-2 ml-1" />

        <Symbols tokens={tokens} separator="-" />
      </div>
    );
  });

  // fetch all dcl pools

  useEffect(() => {
    if (hoverSelectToken && mobileDevice) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'auto';
    }
  }, [hoverSelectToken]);

  return (
    <div
      className="outline-none relative my-auto flex-shrink-0"
      onMouseLeave={() => {
        if (!mobileDevice) {
          setHoverSelectToken(false);
        }
      }}
      onBlur={() => {
        if (mobileDevice) {
          setHoverSelectToken(false);
        }
      }}
    >
      {(selected || selectedToken) && (
        <div
          className="flex items-center relative justify-end font-semibold"
          onMouseEnter={() => {
            if (!mobileDevice) {
              setHoverSelectToken(true);
            }
          }}
          onClick={() => {
            if (mobileDevice) {
              setHoverSelectToken(!hoverSelectToken);
            }
          }}
          style={{
            zIndex: !!selectTokenOut ? 80 : 70,
          }}
        >
          {selected || (
            <IconLeftV3
              size={'7'}
              token={selectedToken}
              hover={hoverSelectToken}
              className={'p-1'}
            />
          )}
        </div>
      )}

      {hoverSelectToken && renderList?.length > 0 && (
        <div
          className={`${
            className ||
            'pt-2  absolute top-8 outline-none xs:text-white xs:font-bold xs:fixed xs:bottom-0 xs:w-full  right-0'
          }    `}
          onMouseLeave={() => {
            if (!mobileDevice) {
              setHoverSelectToken(false);
            }
          }}
          onBlur={() => {
            if (mobileDevice) {
              setHoverSelectToken(false);
            }
          }}
          style={{
            zIndex: mobileDevice ? 80 : !!selectTokenOut ? 80 : 75,
          }}
        >
          {mobileDevice && (
            <div
              className="fixed w-screen h-screen top-0"
              style={{
                zIndex: 150,
                background: 'rgba(0, 19, 32, 0.8)',
                position: 'fixed',
              }}
              onClick={() => {
                setHoverSelectToken(false);
              }}
            ></div>
          )}
          <div
            className="border border-menuMoreBoxBorderColor overflow-auto xs:absolute xs:w-full xs:bottom-0 xs:pb-8 xs:rounded-2xl rounded-lg bg-selectBoxBgColor px-2 py-3 "
            style={{
              zIndex: mobileDevice ? 300 : '',
              maxHeight: mobileDevice ? `${48 * 10 + 78}px` : '',
              minHeight: mobileDevice ? `${48 * 5 + 78}px` : '',
            }}
          >
            <div className="text-sm text-primaryText xs:text-white xs:text-base  ml-1.5   pb-2">
              {intl.formatMessage({
                id: 'instrument',
                defaultMessage: 'Instrument',
              })}
            </div>
            {renderList}
          </div>
        </div>
      )}
    </div>
  );
}

export const SelectTokenForList = ({
  onSelect,
  tokens,
  selected,
}: {
  tokens: TokenMetadata[];
  onSelect?: (token: TokenMetadata) => void;
  selected: string | React.ReactElement;
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (visible)
      document.addEventListener('click', () => {
        setVisible(false);
      });
  }, [visible]);

  return (
    <div className="w-2/5 left-0 outline-none my-auto relative overflow-visible">
      <div
        className={`w-full relative `}
        onClick={(e) => {
          e.nativeEvent.stopImmediatePropagation();
          setVisible(!visible);
        }}
      >
        {selected}
      </div>
      <div
        className={` rounded-2xl left-0 flex flex-col w-56 top-12 py-3 ${
          visible ? 'block' : 'hidden'
        } absolute`}
        style={{
          background:
            getExplorer() === 'Firefox' ? '#323E46' : 'rgba(58,69,77,0.6)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid #415462',
          zIndex: 999,
          right: 0,
        }}
      >
        <div className={`flex flex-col`}>
          {tokens.map((token) => {
            return (
              <div
                key={`${token.id}`}
                className={`flex items-center justify-between hover:bg-black hover:bg-opacity-20 cursor-pointer py-2 pl-4 pr-2 mx-3 mt-3 rounded-2xl `}
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  onSelect(token);
                  setVisible(!visible);
                }}
              >
                <span className="text-white font-semibold text-sm">
                  {toRealSymbol(token.symbol)}
                </span>
                <span>
                  {token.icon ? (
                    <img
                      className="rounded-full border border-gradientFromHover"
                      src={token.icon}
                      style={{
                        width: '26px',
                        height: '26px',
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-full border border-gradientFromHover"
                      style={{
                        width: '26px',
                        height: '26px',
                      }}
                    ></div>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
