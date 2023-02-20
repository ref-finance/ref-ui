import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import getConfig from '~services/config';
import ReactTooltip from 'react-tooltip';
import {
  Logo,
  Near,
  IconBubble,
  IconMyLiquidity,
  IconCreateNew,
  IconPools,
  IconAirDropGreenTip,
  WrapNearEnter,
  WrapNearIconDark,
  GreenArrowIcon,
  MoreMenuIcon,
  NavLogo,
  NavLogoSimple,
  AuroraIconSwapNav,
} from '~components/icon';
import { SmallWallet } from '~components/icon/SmallWallet';
import {
  AccountIcon,
  ActivityIcon,
  WalletIcon,
  SignoutIcon,
  WNEARExchngeIcon,
} from '~components/icon/Common';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { NEARXIDS, wallet } from '~services/near';
import { Card } from '~components/card/Card';

import { FormattedMessage, useIntl, FormattedRelativeTime } from 'react-intl';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { IoChevronBack, IoClose } from 'react-icons/io5';

import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useMenuItems, useLanguageItems } from '~utils/menu';
import { MobileNavBar } from './MobileNav';
import WrapNear from '~components/forms/WrapNear';
import { WrapNearIcon } from './WrapNear';
import { XrefIcon } from '~components/icon/Xref';
import { getAccount } from '../../services/airdrop';
import {
  senderWallet,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { WalletSelectorModal } from './WalletSelector';
import { WalletContext } from '../../utils/wallets-integration';
import {
  getAccountName,
  saveSenderLoginRes,
} from '../../utils/wallets-integration';
import { ftGetTokensMetadata } from '../../services/ft-contract';
import { useTokenBalances } from '../../state/token';
import { toReadableNumber } from '../../utils/numbers';
import { FarmDot } from '../icon/FarmStamp';
import {
  ConnectDot,
  AuroraIcon,
  HasBalance,
  CopyIcon,
} from '../icon/CrossSwapIcons';
import { QuestionTip } from './TipWrapper';
import {
  auroraAddr,
  useAuroraTokens,
  batchCallWithdraw,
} from '../../services/aurora/aurora';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { isMobile, useMobile, useClientMobile } from '../../utils/device';
import { getAuroraConfig } from '../../services/aurora/config';
import {
  ETH_DECIMAL,
  withdrawBalanceAfterTransaction,
} from '../../services/aurora/aurora';
import {
  useAuroraBalances,
  // withdrawBalanceAfterTransaction,
} from '../../services/aurora/aurora';
import { getURLInfo } from './transactionTipPopUp';
import USNBuyComponent from '~components/forms/USNBuyComponent';
import USNPage, { BorrowLinkCard } from '~components/usn/USNPage';
import {
  REF_FI_SWAP_SWAPPAGE_TAB_KEY,
  SWAP_MODE_KEY,
} from '../../pages/SwapPage';
import Marquee from '~components/layout/Marquee';
import {
  REF_FARM_CONTRACT_ID,
  REF_FARM_BOOST_CONTRACT_ID,
} from '../../services/near';

import {
  useWalletSelector,
  ACCOUNT_ID_KEY,
} from '~context/WalletSelectorContext';

import { Modal } from '~context/modal-ui/components/Modal';
import { SWAP_MODE } from '../../pages/SwapPage';
import { Item } from '../airdrop/Item';
import { useDCLAccountBalance } from '../../services/aurora/aurora';
import { openTransak } from '../alert/Transak';
import { BuyNearButton, ConnectToNearBtn } from '../button/Button';
import {
  MoreIcon,
  SauceIcon,
  SauceText,
  ArrowDownIcon,
} from '~components/icon/Nav';

const config = getConfig();

export function AccountTipDownByAccountID({ show }: { show: boolean }) {
  return (
    <div
      className={`account-tip-popup  ${show ? 'block' : 'hidden'} text-xs`}
      style={{
        zIndex: 120,
      }}
    >
      <span>
        <em></em>
      </span>
      <FormattedMessage
        id="ref_account_tip_2"
        defaultMessage="You have token(s) in your REF Account"
      />
    </div>
  );
}

function Anchor({
  to,
  pattern,
  name,
  className,
  newFuntion,
  subMenu,
}: {
  to?: string;
  pattern: string;
  name: string;
  className?: string;
  newFuntion?: boolean;
  subMenu?: {
    name: string;
    display?: string | JSX.Element;
    path?: string;
    click: (e?: any) => void;
    chosen?: boolean;
  }[];
}) {
  const location = useLocation();
  let isSelected;

  const [hover, setHover] = useState<boolean>(false);

  const defaultChosed = subMenu?.find((m) => !!m.chosen)?.name;

  const { pathname } = useLocation();

  const isSwap =
    pathname === '/' || pathname === '/swap' || pathname === '/myOrder';

  const [chosenSub, setChosenSub] = useState<string>(
    isSwap ? defaultChosed : null
  );

  useEffect(() => {
    if (!isSwap) {
      setChosenSub(null);
    }
  }, [isSwap, pathname]);

  useEffect(() => {
    if (!isSwap) return;

    if (pathname === '/myOrder') {
      setChosenSub('limit');
    }

    window.addEventListener('setItemEvent', (e: any) => {
      const storageSwapTab = localStorage
        .getItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY)
        ?.toString();

      const storageSwapMode = localStorage.getItem(SWAP_MODE_KEY)?.toString();
      if (typeof e?.[SWAP_MODE_KEY] === 'string') {
        const curMode = e?.[SWAP_MODE_KEY];

        if (curMode == SWAP_MODE.NORMAL && storageSwapTab === 'normal') {
          setChosenSub('swap');
        } else if (
          e[SWAP_MODE_KEY] == SWAP_MODE.STABLE &&
          storageSwapTab === 'normal'
        ) {
          setChosenSub('stable');
        } else if (
          e[SWAP_MODE_KEY] == SWAP_MODE.LIMIT &&
          storageSwapTab === 'normal'
        ) {
          setChosenSub('limit');
        }
      }
      if (typeof e?.[REF_FI_SWAP_SWAPPAGE_TAB_KEY] === 'string') {
        const curTab = e?.[REF_FI_SWAP_SWAPPAGE_TAB_KEY];

        console.log(e);

        if (curTab === 'normal') {
          setChosenSub(storageSwapMode);
        } else {
          setChosenSub('pro');
        }
      }
    });
  }, [isSwap]);

  if (pattern == '/pools') {
    isSelected =
      location.pathname.startsWith('/pools') ||
      location.pathname.startsWith('/pool') ||
      location.pathname.startsWith('/more_pools') ||
      location.pathname.startsWith('/yourliquidity') ||
      location.pathname.startsWith('/addLiquidityV2') ||
      location.pathname.startsWith('/yoursLiquidityDetailV2');
  } else if (pattern == '/') {
    isSelected = location.pathname === '/' || location.pathname === '/swap';
  } else if (pattern === '/sauce' || pattern === '/v2farms') {
    isSelected = matchPath(location.pathname, {
      path: pattern,
      exact: false,
      strict: false,
    });
  } else {
    isSelected = matchPath(location.pathname, {
      path: pattern,
      exact: true,
      strict: false,
    });
  }

  return (
    <>
      <Link
        to={to}
        className={`relative flex items-center justify-center h-full  mx-4 `}
        onMouseLeave={() => setHover(false)}
        onMouseEnter={() => setHover(true)}
      >
        <span
          className={`link hover:text-white text-base font-bold py-4 cursor-pointer relative z-10 ${className} ${
            isSelected ? 'text-white' : 'text-gray-400'
          }`}
        >
          <FormattedMessage id={name} defaultMessage={name} />
          {newFuntion ? (
            <span className="absolute top-5 right-2">
              <IconAirDropGreenTip />
            </span>
          ) : null}
        </span>

        {!!subMenu && hover && (
          <span
            className="top-10 pt-2 absolute"
            style={{
              zIndex: 9999,
            }}
          >
            <div
              className="py-2  px-1.5 rounded-xl min-w-28 flex flex-col"
              style={{
                background: 'rgba(23,32,38)',
                border: '1px solid #415462',
              }}
            >
              {subMenu.map((m) => {
                return (
                  <span
                    className={`${
                      (chosenSub === m.name && isSwap) ||
                      pathname.toLocaleLowerCase().indexOf(m.path) > -1
                        ? 'bg-primaryText bg-opacity-30 text-white'
                        : 'text-primaryText'
                    } hover:bg-primaryText hover:bg-opacity-30 items-center
                    flex justify-center py-0.5 h-11 mb-0.5 hover:text-white rounded-lg 
                   text-center text-base cursor-pointer my-auto whitespace-nowrap px-2`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      m.click();
                      setChosenSub(m.name);
                      setHover(false);
                    }}
                  >
                    {m.display || <FormattedMessage id={m.name} />}
                  </span>
                );
              })}
            </div>
          </span>
        )}
      </Link>
    </>
  );
}

function AccountEntry({
  setShowWalletSelector,
  showWalletSelector,
  hasBalanceOnRefAccount,
}: {
  setShowWalletSelector: (show: boolean) => void;
  showWalletSelector: boolean;
  hasBalanceOnRefAccount: boolean;
}) {
  const history = useHistory();
  const [hover, setHover] = useState(false);

  const { globalState } = useContext(WalletContext);
  const { wallet } = getCurrentWallet();

  const [copyIconHover, setCopyIconHover] = useState<boolean>(false);

  const [showAccountTip, setShowAccountTip] = useState<boolean>(false);

  const [currentWalletName, setCurrentWalletName] = useState<string>();

  const [currentWalletIcon, setCurrentWalletIcon] = useState<string>();

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    wallet.wallet().then((res) => {
      setCurrentWalletName(res.metadata.name);
      setCurrentWalletIcon(res.metadata.iconUrl);
    });
  }, [accountId]);

  useEffect(() => {
    setShowAccountTip(hasBalanceOnRefAccount);
  }, [hasBalanceOnRefAccount]);

  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAccountTip(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showAccountTip]);

  const signOut = async () => {
    const curWallet = await wallet.wallet();

    await curWallet.signOut();

    localStorage.removeItem(ACCOUNT_ID_KEY);

    window.location.assign('/');
  };

  const accountList = [
    {
      icon: <AccountIcon />,
      textId: 'your_assets',
      selected: location.pathname == '/account',
      click: () => {
        if (location.pathname == '/account') {
          localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          window.location.href = '/account?tab=ref';
        } else {
          history.push('/account?tab=ref');
        }
      },
    },
    {
      icon: <ActivityIcon />,
      textId: 'recent_activity',
      selected: location.pathname == '/recent',
      click: () => {
        history.push('/recent');
      },
    },
    {
      icon: <WalletIcon />,
      textId: 'go_to_near_wallet',
      // subIcon: <HiOutlineExternalLink />,
      click: () => {
        window.open(
          selector.store.getState().selectedWalletId === 'my-near-wallet'
            ? config.myNearWalletUrl
            : config.walletUrl,
          '_blank'
        );
      },
    },
  ];

  const isMobile = useClientMobile();

  return (
    <div
      className="bubble-box relative user text-xs text-center justify-end z-40"
      style={{
        zIndex: 120,
      }}
    >
      {showAccountTip ? (
        <AccountTipDownByAccountID show={showAccountTip} />
      ) : null}
      <div
        className={`cursor-pointer font-bold items-center justify-end text-center overflow-visible relative py-5`}
        onMouseEnter={() => {
          setShowAccountTip(false);
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        {/* todo x */}
        <div
          className={`flex items-center justify-center rounded-xl ${
            isSignedIn
              ? hover
                ? 'py-1.5 text-white text-opacity-50 px-3 bg-accountHoverBgColor'
                : 'py-1.5 text-white text-opacity-50 px-3 bg-accountBgColor'
              : hover
              ? 'py-2 text-white px-5 bg-buttonGradientBg'
              : 'py-2 text-white px-5 bg-unLoginButtonBgColor'
          }`}
        >
          <div className="pr-1">
            <Near
              color={
                isSignedIn
                  ? hover
                    ? '#fff'
                    : 'rgba(255,255,255,0.5)'
                  : hover
                  ? '#fff'
                  : '#00C6A2'
              }
            />
          </div>
          <div className="overflow-ellipsis overflow-hidden whitespace-nowrap account-name">
            {isSignedIn ? (
              <span
                className={`flex ml-1 items-center text-sm ${
                  hover ? 'text-white text-opacity-100' : ''
                }`}
              >
                {getAccountName(wallet.getAccountId())}
                {hasBalanceOnRefAccount ? (
                  <span className="ml-1.5">
                    <FarmDot inFarm={hasBalanceOnRefAccount} />
                  </span>
                ) : null}
                <ArrowDownIcon
                  className={`flex-shrink-0 ml-2 text-white ${
                    hover ? '' : 'text-opacity-50'
                  }`}
                />
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  modal.show();

                  setHover(false);
                }}
                type="button"
              >
                <span
                  className={`ml-1 text-xs gotham_bold ${
                    hover ? 'text-white' : 'text-greenColor'
                  }`}
                >
                  <FormattedMessage
                    id="connect_to_wallet"
                    defaultMessage="Connect Wallet"
                  />
                </span>
              </button>
            )}
          </div>
        </div>
        {isSignedIn && hover ? (
          <div className={`absolute top-14 pt-2 right-0 w-64 z-40`}>
            <Card
              className="menu-max-height bg-cardBg cursor-default shadow-4xl "
              width="w-72"
              padding="py-4"
              style={{
                border: '1px solid #415462',
              }}
            >
              <div className="mx-7 flex justify-between items-start">
                <div className="text-white text-lg text-left flex-col flex">
                  <span>{getAccountName(wallet.getAccountId())}</span>

                  <span className="flex items-center ">
                    <span className="mr-1">
                      {!currentWalletIcon ? (
                        <div className="w-3 h-3"></div>
                      ) : (
                        <img
                          src={currentWalletIcon}
                          className="w-3 h-3"
                          alt=""
                        />
                      )}
                    </span>
                    <span className="text-xs text-primaryText">
                      {currentWalletName || '-'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center">
                  <CopyToClipboard text={wallet.getAccountId()}>
                    <div
                      className={` bg-opacity-20 rounded-lg flex items-center justify-center p-1.5 cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseEnter={() => {
                        !isMobile && setCopyIconHover(true);
                      }}
                      onMouseLeave={() => {
                        !isMobile && setCopyIconHover(false);
                      }}
                      onTouchStart={() => {
                        setCopyIconHover(true);
                      }}
                      onTouchEnd={() => {
                        setCopyIconHover(false);
                      }}
                    >
                      <CopyIcon
                        fillColor={copyIconHover ? '#4075FF' : '#7E8A93'}
                      />
                    </div>
                  </CopyToClipboard>

                  <button
                    className="hover:text-gradientFrom text-primaryText ml-2"
                    onClick={() => {
                      window.open(
                        `https://${
                          getConfig().networkId === 'testnet' ? 'testnet.' : ''
                        }nearblocks.io/address/${wallet.getAccountId()}#transaction`
                      );
                    }}
                  >
                    <HiOutlineExternalLink size={18} />
                  </button>
                </div>
              </div>

              <div className="flex mx-7 my-3 items-center text-xs justify-center">
                <button
                  className="text-BTCColor mr-2 w-1/2 py-1.5 border rounded-lg hover:border-transparent hover:bg-BTCColor hover:bg-opacity-20 border-BTCColor border-opacity-30"
                  onClick={() => {
                    signOut();
                  }}
                >
                  <FormattedMessage
                    id="disconnect"
                    defaultMessage={'Disconnect'}
                  />
                </button>

                <button
                  className="text-gradientFrom ml-2 w-1/2 py-1.5 border rounded-lg hover:border-transparent hover:bg-gradientFrom hover:bg-opacity-20 border-gradientFrom border-opacity-30"
                  onClick={async () => {
                    modal.show();
                  }}
                >
                  <FormattedMessage id="change" defaultMessage={'Change'} />
                </button>
              </div>

              <div
                className="my-3 mx-7 "
                style={{
                  borderBottom: '1px solid rgba(126, 138, 147, 0.3)',
                }}
              ></div>

              {accountList.map((item, index) => {
                return (
                  <>
                    <div
                      onClick={item.click}
                      key={item.textId + index}
                      className={`flex items-center mx-3 text-sm cursor-pointer font-semibold py-4 pl-3 hover:text-white hover:bg-black rounded-lg hover:bg-opacity-10 ${
                        item.selected
                          ? 'text-white bg-black bg-opacity-10'
                          : 'text-primaryText'
                      }`}
                    >
                      <label className="w-9 text-left cursor-pointer">
                        {item.icon}
                      </label>
                      <label className="cursor-pointer text-base">
                        <FormattedMessage id={item.textId} />
                      </label>
                      <label htmlFor="" className="ml-1.5">
                        {item.textId === 'your_assets' &&
                        hasBalanceOnRefAccount ? (
                          <FarmDot inFarm={hasBalanceOnRefAccount} />
                        ) : null}
                      </label>
                      {/* {item.subIcon ? (
                        <label className="text-lg ml-2">{item.subIcon}</label>
                      ) : null} */}
                    </div>
                    {hasBalanceOnRefAccount && item.textId === 'your_assets' ? (
                      <div
                        className="text-center py-0.5 font-normal bg-gradientFrom w-full cursor-pointer text-xs"
                        onClick={item.click}
                        style={{
                          color: '#001320',
                        }}
                      >
                        <FormattedMessage
                          id="ref_account_tip_2"
                          defaultMessage="You have token(s) in your REF Account"
                        />
                      </div>
                    ) : null}
                  </>
                );
              })}
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AuroraEntry({
  hasBalanceOnAurora,
  extraClick,
}: {
  hasBalanceOnAurora?: boolean;
  extraClick?: (e?: any) => void;
}) {
  const nearAccount = getCurrentWallet()?.wallet?.getAccountId() || '';
  const auroraAddress = auroraAddr(nearAccount);

  const isMobile = useMobile();

  const [copyIconHover, setCopyIconHover] = useState<boolean>(false);
  const [copyIconBgColor, setCopyIconBgColor] = useState<string>('black');

  const [hover, setHover] = useState(false);

  const displayAddr = `${auroraAddress?.substring(
    0,
    6
  )}...${auroraAddress?.substring(
    auroraAddress.length - 6,
    auroraAddress.length
  )}`;

  useEffect(() => {
    document.addEventListener('click', () => {
      if (hover) setHover(false);
    });
    return () => document.removeEventListener('click', () => {});
  }, [hover]);

  return (
    <div
      className="lg:py-5 relative z-50 flex items-center cursor-pointer"
      onMouseEnter={() => !isMobile && setHover(true)}
      onMouseLeave={() => !isMobile && setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        extraClick && extraClick();
        if (!isMobile) {
          window.open('/account?tab=aurora', '_blank');
          return;
        }
        if (isMobile) {
          if (!hasBalanceOnAurora) {
            window.open('/account?tab=aurora', '_blank');
          } else {
            setHover(!hover);
          }
        }
      }}
    >
      <div
        className={`flex items-center rounded-lg px-2 py-2 ml-px relative ${
          hover ? 'bg-auroraGreen' : 'bg-white bg-opacity-20'
        }`}
      >
        <AuroraIcon hover={hover} />

        {hasBalanceOnAurora ? <HasBalance hover={hover} /> : null}
      </div>
      {hover ? (
        <div
          className=" absolute pt-2 right-0 lg:top-14 xs:top-8 md:top-8"
          onClick={(e) => {
            window.open('/account?tab=aurora', '_blank');
            e.stopPropagation();
          }}
        >
          <div
            className="bg-cardBg rounded-lg border border-farmText flex flex-col overflow-hidden  z-50"
            style={{
              minWidth: '256px',
            }}
          >
            <div className="flex items-center pl-5 pt-4">
              <span
                className="text-farmText text-sm"
                style={{
                  maxWidth: '180px',
                }}
              >
                <FormattedMessage
                  id="mapping_account"
                  defaultMessage="Mapping Account"
                />
              </span>

              <QuestionTip id="mapping_account_explanation" />

              {hasBalanceOnAurora ? <HasBalance /> : null}
            </div>

            <div className="px-5 flex justify-between items-center py-4">
              <span className="text-white font-bold xs:text-base md:text-base">
                {displayAddr}
              </span>

              <CopyToClipboard text={auroraAddress}>
                <div
                  className={`bg-${copyIconBgColor} bg-opacity-20 rounded-lg flex items-center justify-center p-1.5 cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => {
                    !isMobile && setCopyIconHover(true);
                  }}
                  onMouseLeave={() => {
                    !isMobile && setCopyIconHover(false);
                  }}
                  onMouseDown={() => !isMobile && setCopyIconBgColor('white')}
                  onMouseUp={() => !isMobile && setCopyIconBgColor('black')}
                  onTouchStart={() => {
                    setCopyIconBgColor('white');
                    setCopyIconHover(true);
                  }}
                  onTouchEnd={() => {
                    setCopyIconBgColor('black');
                    setCopyIconHover(false);
                  }}
                >
                  <CopyIcon fillColor={copyIconHover ? '#00C6A2' : '#7E8A93'} />
                </div>
              </CopyToClipboard>
            </div>

            <Link
              to={{
                pathname: '/account?tab=aurora',
              }}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className={`w-full px-3 py-1 text-xs bg-auroraGreen text-chartBg flex items-center justify-center cursor-pointer ${
                hasBalanceOnAurora ? 'block' : 'hidden'
              }`}
            >
              <span>
                <FormattedMessage
                  id="mapping_account_tip"
                  defaultMessage="You have token(s) in Mapping Account"
                />
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Xref() {
  const history = useHistory();
  const location = useLocation();
  // const [hover, setHover] = useState(false);
  const goXrefPage = () => {
    history.push('/xref');
  };
  return (
    <div
      className={`h-full flex items-center justify-center z-20 relative py-4 mx-4 cursor-pointer hover:opacity-100 ${
        location.pathname == '/xref' ? 'opacity-100' : 'opacity-60'
      }`}
      onClick={goXrefPage}
    >
      <XrefIcon className="relative -top-px cursor-pointer"></XrefIcon>
      {/* <GreenArrow hover={hover}></GreenArrow> */}
    </div>
  );
}

function MoreMenu() {
  const [showWrapNear, setShowWrapNear] = useState(false);
  const [hover, setHover] = useState(false);
  const [sauceHover, setSauceHover] = useState(false);
  const [parentLabel, setParentLabel] = useState('');
  const { menuData } = useMenuItems();
  const [curMenuItems, setCurMenuItems] = useState(menuData);
  const location = useLocation();
  const history = useHistory();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const onClickMenuItem = (items: any[], label: string) => {
    setCurMenuItems(items);
    setParentLabel(label);
  };
  const handleMoreMenuClick = (
    url: string,
    isExternal: boolean,
    label: string,
    children?: any
  ) => {
    if (url) {
      if (isExternal) {
        window.open(url);
      } else {
        history.push(url);
      }
    } else if (children) {
      onClickMenuItem?.(children, label);
    }
  };
  const hasSubMenu = curMenuItems.some(({ children }) => !!children?.length);
  return (
    <>
      <div
        className="relative z-30"
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          onClickMenuItem?.(menuData, '');
        }}
        style={{ zIndex: '99' }}
      >
        <div
          className={`rounded-xl p-3 mx-4 cursor-pointer xsm:bg-transparent ${
            hover ? 'text-white bg-menuMoreBgColor' : 'text-primaryText'
          }`}
        >
          <MoreIcon></MoreIcon>
        </div>
        <div
          className={`${
            hover ? 'block' : 'hidden'
          } absolute top-7 pt-3 -right-20 rounded-md`}
        >
          <Card
            rounded="rounded-md"
            className="p-2.5 w-full rounded-2xl border border-menuMoreBoxBorderColor bg-priceBoardColor"
          >
            {!hasSubMenu && parentLabel && (
              <div
                className="whitespace-nowrap hover:text-white text-left items-center flex justify-start text-sm font-semibold text-primaryText cursor-pointer pt-4 pb-2"
                onClick={() => onClickMenuItem?.(menuData, '')}
              >
                <IoChevronBack className="text-xl " />
                <span className="ml-3">{parentLabel}</span>
              </div>
            )}
            {curMenuItems.map(
              (
                {
                  url,
                  children,
                  label,
                  icon,
                  logo,
                  isExternal,
                  specialMenuKey,
                },
                index
              ) => {
                const isSelected =
                  url &&
                  !isExternal &&
                  matchPath(location.pathname, {
                    path: url,
                    exact: true,
                    strict: false,
                  });
                if (specialMenuKey == 'sauce')
                  return (
                    <div
                      onMouseOver={() => setSauceHover(true)}
                      onMouseLeave={() => {
                        setSauceHover(false);
                      }}
                      key={index}
                      className={`flex items-end rounded-xl whitespace-nowrap hover:bg-menuMoreBgColor hover:text-white text-sm font-semibold py-3 my-1.5 cursor-pointer px-2
                    ${
                      isSelected
                        ? 'bg-menuMoreBgColor text-white'
                        : 'text-primaryText'
                    }`}
                      onClick={() =>
                        handleMoreMenuClick(url, isExternal, label, children)
                      }
                    >
                      <div className="flex items-center mr-1.5">
                        <SauceIcon
                          className={`${
                            isSelected || sauceHover
                              ? 'text-greenColor'
                              : 'text-primaryText'
                          }`}
                        ></SauceIcon>
                        <SauceText className="ml-2.5"></SauceText>
                      </div>
                      <span className="text-xs">{label}</span>
                    </div>
                  );
                return (
                  <div
                    key={index}
                    className={`flex items-center rounded-xl whitespace-nowrap hover:bg-menuMoreBgColor hover:text-white text-sm font-semibold py-3 my-1.5 cursor-pointer ${
                      !hasSubMenu && parentLabel ? 'px-5' : 'px-2'
                    }
                    ${
                      isSelected
                        ? 'bg-menuMoreBgColor text-white'
                        : 'text-primaryText'
                    }`}
                    onClick={() =>
                      handleMoreMenuClick(url, isExternal, label, children)
                    }
                  >
                    {logo && (
                      <span
                        className={`text-xl w-8 text-left flex justify-center mr-2`}
                      >
                        {logo}
                      </span>
                    )}
                    {label}
                    <span className="ml-4 text-xl">{icon}</span>
                    {children && (
                      <span className="text-xl">
                        <FiChevronRight />
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function USNButton() {
  const [USNButtonHover, setUSNButtonHover] = useState<boolean>(false);
  const [showUSN, setShowUSN] = useState<boolean>(false);

  const [showeBorrowCard, setShowBorrowCard] = useState(false);
  function goLink() {
    window.open('https://usnpp.auroralabs.dev/');
  }
  return (
    <>
      <div
        onMouseEnter={() => setUSNButtonHover(true)}
        onMouseLeave={() => setUSNButtonHover(false)}
        className="relative lg:py-4 top-0.5 z-50"
      ></div>
      <USNPage
        isOpen={showUSN}
        onRequestClose={(e) => {
          setShowUSN(false);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      ></USNPage>
      <BorrowLinkCard
        isOpen={showeBorrowCard}
        onRequestClose={(e) => {
          setShowBorrowCard(false);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            width: isMobile() ? '98%' : 550,
            bottom: '50%',
          },
        }}
      />
    </>
  );
}

function NavigationBar() {
  const [showWrapNear, setShowWrapNear] = useState(false);
  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const [hoverClick, setHoverClick] = useState<boolean>(false);

  const auroraTokens = useAuroraTokens();

  const { accountId } = useWalletSelector();

  const auroraAddress = auroraAddr(accountId || '');

  const [withdrawDone, setWithdrawDone] = useState<any>();

  const auroraBalances = useAuroraBalances(auroraAddress);

  const [hasAuroraBalance, setHasAuroraBalance] = useState(false);

  const { txHash } = getURLInfo();

  useEffect(() => {
    if (!auroraBalances || !isSignedIn) return;

    setWithdrawDone(false);
  }, [auroraBalances, txHash, isSignedIn]);

  useEffect(() => {
    if (
      !auroraBalances ||
      !auroraTokens ||
      !(typeof withdrawDone === 'boolean' && withdrawDone === false)
    ) {
      return;
    }

    if (Object.keys(auroraBalances).length === 0) {
      setHasAuroraBalance(false);
      return;
    }

    const balanceOver = Object.entries(auroraBalances).some(
      ([address, balance]) => {
        if (!balance) return false;
        return (
          Number(
            toReadableNumber(
              address === getAuroraConfig().WETH
                ? ETH_DECIMAL
                : auroraTokens.tokensByAddress[address]?.decimals,
              balance as string
            )
          ) > 0
        );
      }
    );

    setHasAuroraBalance(balanceOver);
  }, [
    auroraTokens,
    Object.values(auroraBalances || {}).join('-'),
    withdrawDone,
    isSignedIn,
    accountId,
  ]);

  const [tokensMeta, setTokensMeta] = useState<{}>();

  const [pathnameState, setPathnameState] = useState<boolean>(
    window.location.pathname !== '/account'
  );
  const setPatheState = () =>
    setPathnameState(window.location.pathname !== '/account');

  useEffect(() => {
    const _historyWrap = function (type: any) {
      const orig = history[type];
      const e = new Event(type);
      return function () {
        const rv = orig.apply(this, arguments);
        //@ts-ignore
        e.arguments = arguments;
        window.dispatchEvent(e);
        return rv;
      };
    };
    history.pushState = _historyWrap('pushState');
    history.replaceState = _historyWrap('replaceState');
    window.addEventListener('popstate', (e) => {
      setPatheState();
    });
    window.addEventListener('pushState', function (e) {
      setPatheState();
    });
    window.addEventListener('replaceState', function (e) {
      setPatheState();
    });
  }, []);

  const [hasBalanceOnRefAccount, setHasBalanceOnRefAccount] =
    useState<boolean>(false);

  const refAccountBalances = useTokenBalances();

  const dclAccountBalances = useDCLAccountBalance(isSignedIn);

  const historyInit = useHistory();

  useEffect(() => {
    if (!refAccountBalances || !dclAccountBalances) return;

    const ids = Object.keys(refAccountBalances).concat(
      Object.keys(dclAccountBalances)
    );

    ftGetTokensMetadata(ids).then(setTokensMeta);
  }, [
    Object.values(refAccountBalances || {}).join('-'),
    Object.values(dclAccountBalances || {}).join('-'),
    refAccountBalances,
    isSignedIn,
  ]);

  useEffect(() => {
    if (!refAccountBalances || !tokensMeta || !dclAccountBalances) {
      setHasBalanceOnRefAccount(false);
      return;
    }
    const hasRefBalanceOver = Object.entries(refAccountBalances).some(
      ([id, balance]) => {
        if (id === NEARXIDS[0]) return false;
        return (
          Number(
            toReadableNumber(tokensMeta?.[id]?.decimals || 24, balance) || '0'
          ) > 0.001
        );
      }
    );

    const hasDCLBalanceOver = Object.entries(dclAccountBalances).some(
      ([id, balance]) => {
        return (
          Number(
            toReadableNumber(
              tokensMeta?.[id]?.decimals || 24,
              balance as string
            ) || '0'
          ) > 0
        );
      }
    );

    setHasBalanceOnRefAccount(hasRefBalanceOver || hasDCLBalanceOver);
  }, [
    refAccountBalances,
    dclAccountBalances,
    Object.values(refAccountBalances || {}).join('-'),
    Object.values(dclAccountBalances || {}).join('-'),
    tokensMeta,
    isSignedIn,
  ]);

  return (
    <>
      <div className="nav-wrap md:hidden xs:hidden text-center relative">
        <div
          className={`${
            hasBalanceOnRefAccount && pathnameState ? 'block' : 'hidden'
          } text-xs py-1.5`}
          style={{
            backgroundColor: '#FFC940',
          }}
        >
          👀 &nbsp;
          <FormattedMessage
            id="ref_account_balance_tip"
            defaultMessage="It seems like an error occurred while adding/removing liquidity to the pool"
          />
          {`, `}
          <FormattedMessage
            id="ref_account_tip_top"
            defaultMessage="your token(s) may be now in your Ref inner account"
          />
          {`.`}
          <span
            className={`${
              hoverClick ? 'font-bold' : 'font-normal'
            } underline cursor-pointer mx-1`}
            onClick={() => window.open('/account?tab=ref', '_blank')}
            onMouseEnter={() => setHoverClick(true)}
            onMouseLeave={() => setHoverClick(false)}
          >
            <FormattedMessage id="click_here" defaultMessage="Click here" />
          </span>
          <FormattedMessage
            id="to_recover_them"
            defaultMessage="to recover them"
          />
          .
        </div>
        <nav
          className="flex items-center justify-between px-9"
          style={{
            height: '70px',
          }}
        >
          <div className="flex-1 xs:hidden md:hidden transform">
            <NavLogoSimple
              className="cursor-pointer"
              onClick={() => {
                window.open('https://www.ref.finance/');
              }}
            />
          </div>
          <div className="flex items-center h-full relative">
            <Anchor to="/" pattern="/" name="trade_capital" />
            <Anchor to={'/yourliquidity'} pattern="/pools" name="POOL" />
            <Anchor to="/v2farms" pattern="/v2farms" name="farm_capital" />
            <Xref></Xref>
            {!!getConfig().REF_VE_CONTRACT_ID ? (
              <Anchor
                to="/referendum"
                pattern="/referendum"
                name="vote_capital"
              />
            ) : null}
            <MoreMenu></MoreMenu>
          </div>
          <div className="flex-1 flex items-center justify-end">
            {isMobile() ? null : <BuyNearButton />}

            <div className="flex items-center mx-3">
              <AccountEntry
                hasBalanceOnRefAccount={hasBalanceOnRefAccount}
                setShowWalletSelector={setShowWalletSelector}
                showWalletSelector={showWalletSelector}
              />
              <div className={isSignedIn ? 'flex items-center' : 'hidden'}>
                <ConnectDot />
                <ConnectDot />
                <AuroraEntry hasBalanceOnAurora={hasAuroraBalance} />
              </div>
            </div>
            <Language></Language>
          </div>
        </nav>
        {isMobile ? null : <Marquee></Marquee>}
      </div>
      <MobileNavBar
        hasBalanceOnRefAccount={hasBalanceOnRefAccount}
        isSignedIn={isSignedIn}
        setShowWalletSelector={setShowWalletSelector}
        showWalletSelector={showWalletSelector}
        hasAuroraBalance={hasAuroraBalance}
      />
      <WalletSelectorModal
        setShowWalletSelector={setShowWalletSelector}
        isOpen={showWalletSelector}
        onRequestClose={() => {
          window.location.reload();
          setShowWalletSelector(false);
        }}
      />
    </>
  );
}
export const commonLangKey = [
  'en',
  'zh-CN',
  'vi',
  'uk',
  'ru',
  'ja',
  'ko',
  'es',
];
export function formatItem(local: string) {
  if (commonLangKey.indexOf(local) > -1) {
    return local;
  } else {
    return 'en';
  }
}
function Language() {
  const context = useContext(Context);
  const [hover, setHover] = useState(false);
  const lans = useLanguageItems();
  const currentLocal = formatItem(localStorage.getItem('local'));
  const switchLanuage = (language: string) => {
    context.selectLanguage(language);
  };
  const displayLanguage = () => {
    if (commonLangKey.indexOf(currentLocal) > -1) {
      if (currentLocal == 'zh-CN') {
        return '中';
      } else {
        return currentLocal?.toUpperCase();
      }
    } else {
      return 'EN';
    }
  };
  return (
    <div
      className="relative z-30"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
      }}
      style={{ zIndex: '99' }}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 text-xs rounded-lg text-primaryText cursor-pointer ${
          hover
            ? 'border border-transparent bg-menuMoreBgColor'
            : 'border border-laguageBorderColor bg-transparent'
        }`}
      >
        {displayLanguage()}
      </span>
      <div
        className={`${
          hover ? 'block' : 'hidden'
        } absolute top-5 pt-5 right-0 rounded-md`}
        style={{ minWidth: '180px' }}
      >
        <Card
          rounded="rounded-md"
          className="p-2.5 w-full rounded-2xl border border-menuMoreBoxBorderColor bg-priceBoardColor"
        >
          {lans.map(({ label, language, logo }, index) => {
            return (
              <div
                key={index}
                className={`rounded-xl whitespace-nowrap text-left items-center flex justify-start hover:bg-menuMoreBgColor hover:text-white text-sm font-semibold py-3 my-1.5 cursor-pointer px-2 ${
                  currentLocal === language
                    ? 'bg-navHighLightBg text-white'
                    : 'text-primaryText'
                }`}
                onClick={() => {
                  switchLanuage(language);
                }}
              >
                {logo && (
                  <span
                    className={`text-xl w-8 text-left flex justify-center mr-2`}
                  >
                    {logo}
                  </span>
                )}
                {label}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
export default NavigationBar;

export function USNCard({
  showUSN,
  setShowUSN,
  showeBorrowCard,
  setShowBorrowCard,
}: {
  showUSN: boolean;
  setShowUSN: (e: boolean) => void;
  showeBorrowCard: boolean;
  setShowBorrowCard: (e: boolean) => void;
}) {
  return (
    <>
      <USNPage
        isOpen={showUSN}
        onRequestClose={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowUSN(false);
          setShowBorrowCard(false);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            width: isMobile() ? '98%' : 550,
            bottom: '50%',
            left: '1%',
            transform: null,
          },
        }}
      ></USNPage>

      <BorrowLinkCard
        isOpen={showeBorrowCard}
        onRequestClose={(e) => {
          setShowBorrowCard(false);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            width: isMobile() ? '98%' : 550,

            bottom: '50%',
          },
        }}
      />
    </>
  );
}
