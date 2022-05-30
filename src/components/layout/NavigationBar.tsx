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
import { wallet } from '~services/near';
import { Card } from '~components/card/Card';

import { FormattedMessage, useIntl } from 'react-intl';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { IoChevronBack, IoClose } from 'react-icons/io5';

import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useMenuItems } from '~utils/menu';
import { MobileNavBar } from './MobileNav';
import WrapNear from '~components/forms/WrapNear';
import { WrapNearIcon } from './WrapNear';
import { XrefIcon } from '~components/icon/Xref';
import { getAccount } from '../../services/airdrop';
import { senderWallet, getCurrentWallet } from '../../utils/sender-wallet';
import { WalletSelectorModal } from './WalletSelector';
import { WalletContext } from '../../utils/sender-wallet';
import { getAccountName } from '../../utils/sender-wallet';
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
import { isMobile, useMobile } from '../../utils/device';
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
import { REF_FI_SWAP_SWAPPAGE_TAB_KEY } from '../../pages/SwapPage';
import Marquee from '~components/layout/Marquee';

const config = getConfig();

export function AccountTipDownByAccountID({ show }: { show: boolean }) {
  return (
    <div className={`account-tip-popup ${show ? 'block' : 'hidden'} text-xs`}>
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
}: {
  to: string;
  pattern: string;
  name: string;
  className?: string;
  newFuntion?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const location = useLocation();
  const isSelected = matchPath(location.pathname, {
    path: pattern,
    exact: true,
    strict: false,
  });

  return (
    <Link
      to={to}
      className={`relative ${name === 'Risks' ? 'lg:hidden lg2:block' : ''}`}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <h2
        className={`link hover:text-greenColor text-lg font-bold p-4 cursor-pointer relative z-10 ${className} ${
          isSelected ? 'text-greenColor' : 'text-gray-400'
        }`}
      >
        <FormattedMessage id={name} defaultMessage={name} />
        {newFuntion ? (
          <span className="absolute top-5 right-2">
            <IconAirDropGreenTip />
          </span>
        ) : null}
      </h2>
      <GreenArrow hover={hover}></GreenArrow>
    </Link>
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
  const isSignedIn = globalState.isSignedIn;

  const { wallet, wallet_type } = getCurrentWallet();

  const [showAccountTip, setShowAccountTip] = useState<boolean>(false);

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

  const accountList = [
    {
      icon: <AccountIcon />,
      textId: 'view_account',
      selected: location.pathname == '/account',
      click: () => {
        if (location.pathname == '/account') {
          localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          window.location.reload();
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
      subIcon: <HiOutlineExternalLink />,
      click: () => {
        window.open(config.walletUrl, '_blank');
      },
    },
    {
      icon: <SignoutIcon />,
      textId: 'sign_out',
      click: () => {
        wallet.signOut();
        wallet_type === 'near-wallet' && window.location.assign('/');
      },
    },
  ];

  return (
    <div className="bubble-box relative user text-xs text-center justify-end z-30 mx-3.5">
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
        <div
          className={`inline-flex px-1 py-0.5 items-center justify-center rounded-full border border-gray-700 ${
            hover ? 'border-gradientFrom bg-opacity-0' : ''
          } ${
            isSignedIn
              ? 'bg-gray-700 text-white'
              : 'border border-gradientFrom text-gradientFrom'
          } pl-3 pr-3`}
        >
          <div className="pr-1">
            <Near color={isSignedIn ? 'white' : '#00c6a2'} />
          </div>
          <div className="overflow-ellipsis overflow-hidden whitespace-nowrap account-name">
            {isSignedIn ? (
              <span className="flex ml-1 items-center">
                {getAccountName(wallet.getAccountId())}
                {hasBalanceOnRefAccount ? (
                  <span className="ml-1.5">
                    <FarmDot inFarm={hasBalanceOnRefAccount} />
                  </span>
                ) : null}
                <FiChevronDown className="text-base ml-1" />
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowWalletSelector(true);

                  setHover(false);
                }}
                type="button"
              >
                <span className="ml-1 text-xs">
                  <FormattedMessage
                    id="connect_to_near"
                    defaultMessage="Connect to NEAR"
                  />
                </span>
              </button>
            )}
          </div>
        </div>
        {isSignedIn && hover ? (
          <div className={`absolute top-14 pt-2 right-0 w-64 z-20`}>
            <Card
              className="menu-max-height cursor-default shadow-4xl  border border-primaryText"
              width="w-72"
              padding="py-4"
            >
              {accountList.map((item, index) => {
                return (
                  <>
                    <div
                      onClick={item.click}
                      key={item.textId + index}
                      className={`flex items-center text-sm cursor-pointer font-semibold py-4 pl-7 hover:text-white hover:bg-navHighLightBg ${
                        item.selected
                          ? 'text-white bg-navHighLightBg'
                          : 'text-primaryText'
                      }`}
                    >
                      <label className="w-9 text-left cursor-pointer">
                        {item.icon}
                      </label>
                      <label className="cursor-pointer">
                        <FormattedMessage id={item.textId} />
                      </label>
                      <label htmlFor="" className="ml-1.5">
                        {item.textId === 'view_account' &&
                        hasBalanceOnRefAccount ? (
                          <FarmDot inFarm={hasBalanceOnRefAccount} />
                        ) : null}
                      </label>
                      {item.subIcon ? (
                        <label className="text-lg ml-2">{item.subIcon}</label>
                      ) : null}
                    </div>
                    {hasBalanceOnRefAccount &&
                    item.textId === 'view_account' ? (
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
  const nearAccount = getCurrentWallet().wallet.getAccountId();
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
      <div className="flex items-center">
        <div
          className={`flex items-center rounded-2xl  ${
            hover ? 'bg-auroraGreen' : 'bg-gray-700'
          } px-2 py-1 ml-px relative `}
        >
          <AuroraIcon hover={hover} />

          {hasBalanceOnAurora ? <HasBalance hover={hover} /> : null}
        </div>
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
  const [hover, setHover] = useState(false);
  const goXrefPage = () => {
    history.push('/xref');
  };
  return (
    <div
      className={`relative p-4 cursor-pointer hover:opacity-100 ${
        location.pathname == '/xref' ? 'opacity-100' : 'opacity-60'
      }`}
      onClick={goXrefPage}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <XrefIcon className="cursor-pointer"></XrefIcon>
      <GreenArrow hover={hover}></GreenArrow>
    </div>
  );
}
function GreenArrow(props: any) {
  const { hover } = props;
  return (
    <div
      className={`flex absolute w-full h-full left-0 top-0 justify-between items-center ${
        hover ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span>
        <GreenArrowIcon></GreenArrowIcon>
      </span>
      <span style={{ transform: 'rotateY(180deg)' }}>
        <GreenArrowIcon></GreenArrowIcon>
      </span>
    </div>
  );
}
function PoolsMenu() {
  const location = useLocation();
  const isSelected =
    location.pathname.startsWith('/pools') ||
    location.pathname.startsWith('/pool') ||
    location.pathname.startsWith('/more_pools');
  const [hover, setHover] = useState(false);
  const history = useHistory();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const links = [
    {
      label: <FormattedMessage id="view_pools" defaultMessage="View Pools" />,
      path: '/pools',
      logo: <IconPools />,
    },
    {
      label: (
        <FormattedMessage
          id="Create_New_Pool"
          defaultMessage="Create New Pool"
        />
      ),
      path: '/pools/add',
      logo: <IconCreateNew />,
    },
  ];

  if (isSignedIn) {
    links.push({
      label: (
        <FormattedMessage id="Your_Liquidity" defaultMessage="Your Liquidity" />
      ),
      path: '/pools/yours',
      logo: <IconMyLiquidity />,
    });
  }

  return (
    <div
      className="relative"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`flex items-center justify-center ${
          isSelected || hover ? 'text-greenColor' : 'text-gray-400'
        }`}
      >
        <div className="relative">
          <h2
            className={`flex items-center link hover:text-greenColor text-lg font-bold p-4 cursor-pointer`}
          >
            <FormattedMessage id="pools" defaultMessage="Pools" />
            <label className="text-xl ml-1">
              <FiChevronDown />
            </label>
          </h2>
          <GreenArrow hover={hover}></GreenArrow>
        </div>
      </div>
      <div
        className={`${
          hover ? 'block' : 'hidden'
        } absolute top-12 -left-20 rounded-md`}
        style={{
          zIndex: 999,
        }}
      >
        <Card
          width="w-64"
          padding="py-4"
          rounded="rounded-md"
          className="border border-primaryText shadow-4xl z-40"
        >
          {links.map((link) => {
            let isSelected = link.path === location.pathname;
            if (
              location.pathname.startsWith('/pool/') ||
              location.pathname.startsWith('/more_pools/')
            ) {
              if (link.path === '/pools') {
                isSelected = true;
              }
            }

            return (
              <div
                key={link.path}
                className={`flex justify-start items-center hover:bg-navHighLightBg text-sm font-semibold z-40  hover:text-white cursor-pointer py-4 pl-7 ${
                  isSelected
                    ? 'text-white bg-navHighLightBg'
                    : 'text-primaryText'
                }`}
                onClick={() => history.push(link.path)}
              >
                <span className="inline-block mr-3">{link.logo}</span>
                {link.label}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function MoreMenu() {
  const [hover, setHover] = useState(false);
  const [parentLabel, setParentLabel] = useState('');
  const { menuData } = useMenuItems();
  const [curMenuItems, setCurMenuItems] = useState(menuData);
  const context = useContext(Context);
  const currentLocal = localStorage.getItem('local');
  const location = useLocation();
  const history = useHistory();
  const onClickMenuItem = (items: any[], label: string) => {
    setCurMenuItems(items);
    setParentLabel(label);
  };
  const switchLanuage = (label: string) => {
    context.selectLanguage(label);
  };
  const handleMoreMenuClick = (
    url: string,
    isExternal: boolean,
    label: string,
    children?: any,
    language?: string
  ) => {
    if (url) {
      if (isExternal) {
        window.open(url);
      } else {
        history.push(url);
      }
    } else if (children) {
      onClickMenuItem?.(children, label);
    } else {
      switchLanuage(language);
    }
  };
  const hasSubMenu = curMenuItems.some(({ children }) => !!children?.length);
  return (
    <div
      className="relative z-30"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        onClickMenuItem?.(menuData, '');
      }}
    >
      <div className="text-primaryText hover:text-greenColor cursor-pointer py-5">
        <MoreMenuIcon></MoreMenuIcon>
      </div>
      <div
        className={`${
          hover ? 'block' : 'hidden'
        } absolute top-14 pt-2 -right-4 rounded-md`}
      >
        <Card
          width="w-64"
          padding="py-4"
          rounded="rounded-md"
          className="shadow-4xl border border-primaryText"
        >
          {!hasSubMenu && parentLabel && (
            <div
              className="whitespace-nowrap hover:text-white text-left items-center flex justify-start text-sm font-semibold text-primaryText cursor-pointer py-4 pl-4"
              onClick={() => onClickMenuItem?.(menuData, '')}
            >
              <IoChevronBack className="text-xl " />
              <span className=" ml-8">{parentLabel}</span>
            </div>
          )}
          {curMenuItems.map(
            ({
              id,
              url,
              children,
              label,
              icon,
              logo,
              isExternal,
              language,
            }) => {
              const isSelected =
                url &&
                !isExternal &&
                matchPath(location.pathname, {
                  path: url,
                  exact: true,
                  strict: false,
                });

              return (
                <div
                  key={id}
                  className={`whitespace-nowrap ${
                    id === 0 ? 'lg:flex lg2:hidden' : ''
                  } text-left items-center flex justify-start hover:bg-navHighLightBg text-sm font-semibold hover:text-white
                 ${
                   (language && currentLocal === language) || isSelected
                     ? 'bg-navHighLightBg text-white'
                     : 'text-primaryText'
                 }
                 cursor-pointer py-4 pl-7 ${parentLabel ? 'pl-14' : ''}`}
                  onClick={() =>
                    handleMoreMenuClick(
                      url,
                      isExternal,
                      label,
                      children,
                      language
                    )
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
                    <span className="text-xl absolute right-4">
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
  );
}

function USNButton() {
  const [USNButtonHover, setUSNButtonHover] = useState<boolean>(false);
  const [showUSN, setShowUSN] = useState<boolean>(false);

  const [showeBorrowCard, setShowBorrowCard] = useState(false);

  return (
    <>
      <div
        onMouseEnter={() => setUSNButtonHover(true)}
        onMouseLeave={() => setUSNButtonHover(false)}
        className="relative lg:py-5 z-50"
      >
        <div className="mr-3">
          <USNBuyComponent hover={USNButtonHover} />
        </div>

        {USNButtonHover ? (
          <div className=" absolute pt-2 right-0 lg:top-14 xs:top-8 md:top-8 ">
            <div
              style={{
                border: '1px solid #415462',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                background: '#323E46',
              }}
              className="py-2.5 px-1.5 text-sm  flex flex-col items-center rounded-xl z-50 text-primaryText "
            >
              <div
                className="whitespace-nowrap px-4 py-2 hover:bg-black hover:bg-opacity-20 rounded-lg hover:text-white w-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUSN(true);
                  setUSNButtonHover(false);
                }}
              >
                <FormattedMessage id="buy" defaultMessage="Buy" />
              </div>

              <div
                className="whitespace-nowrap flex items-center px-4 py-2 hover:bg-black hover:bg-opacity-20 rounded-lg hover:text-white w-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBorrowCard(true);
                  setUSNButtonHover(false);
                }}
              >
                <span className="mr-1">
                  <FormattedMessage id="borrow" defaultMessage="Borrow" />
                </span>
                <span>
                  <HiOutlineExternalLink />
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
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
            width: isMobile() ? '98%' : 550,
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
  const auroraAddress = auroraAddr(getCurrentWallet().wallet.getAccountId());

  const [withdrawDone, setWithdrawDone] = useState<any>();

  const auroraBalances = useAuroraBalances(auroraAddress);

  const [hasAuroraBalance, setHasAuroraBalance] = useState(false);

  const { txHash } = getURLInfo();

  useEffect(() => {
    if (!auroraBalances || !isSignedIn) return;
    const auroraAddresses = Object.keys(auroraBalances);

    const amounts = Object.values(auroraBalances) as string[];

    // withdrawBalanceAfterTransaction(auroraAddresses, amounts).then(
    //   setWithdrawDone
    // );

    setWithdrawDone(false);
  }, [auroraBalances, txHash, isSignedIn]);

  useEffect(() => {
    if (
      !auroraBalances ||
      !auroraTokens ||
      !(typeof withdrawDone === 'boolean' && withdrawDone === false) ||
      Object.keys(auroraBalances).length === 0
    )
      return;

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
  }, [auroraTokens, auroraBalances, withdrawDone, isSignedIn]);

  const [tokensMeta, setTokensMeta] = useState<{}>();

  const [pathnameState, setPathnameState] = useState<boolean>(
    window.location.pathname !== '/account'
  );
  const historyInit = useHistory();
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

  useEffect(() => {
    if (!refAccountBalances) return;

    const ids = Object.keys(refAccountBalances);

    ftGetTokensMetadata(ids).then(setTokensMeta);
  }, [refAccountBalances, isSignedIn]);

  useEffect(() => {
    if (!refAccountBalances || !tokensMeta) {
      setHasBalanceOnRefAccount(false);
      return;
    }
    const hasRefBalanceOver = Object.entries(refAccountBalances).some(
      ([id, balance]) => {
        return (
          Number(
            toReadableNumber(tokensMeta?.[id]?.decimals || 24, balance) || '0'
          ) > 0.001
        );
      }
    );

    setHasBalanceOnRefAccount(hasRefBalanceOver);
  }, [refAccountBalances, tokensMeta, isSignedIn]);
  return (
    <>
      <div className="nav-wrap md:hidden xs:hidden text-center relative">
        <div
          className={`${
            hasBalanceOnRefAccount && pathnameState ? 'block' : 'hidden'
          } text-xs py-1.5`}
          style={{
            backgroundColor: '#CFCEFE',
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
        <nav className="flex items-center justify-between px-9 pt-6 col-span-8 ">
          <div className="relative -top-0.5 flex-1 lg:hidden xl:block">
            <Logo />
          </div>

          <div className="relative -top-0.5 flex-1 lg:block xs:hidden md:hidden xl:hidden">
            <NavLogo />
          </div>
          <div className="flex items-center">
            <Anchor to="/" pattern="/" name="Swap" />
            <Anchor to="/sauce" pattern="/sauce" name="Sauce" />
            <PoolsMenu />
            <Anchor to="/farms" pattern="/farms" name="Farms" />
            <Xref></Xref>
            <Anchor to="/risks" pattern="/risks" name="Risks" />
          </div>
          <div className="flex items-center justify-end flex-1">
            <USNButton />
            {isSignedIn && (
              <div className="flex items-center text-white">
                <div
                  className=" py-1 cursor-pointer items-center flex"
                  onClick={() => setShowWrapNear(true)}
                >
                  <WNEARExchngeIcon />
                </div>
                <WrapNear
                  isOpen={showWrapNear}
                  onRequestClose={() => setShowWrapNear(false)}
                  style={{
                    overlay: {
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                    },
                    content: {
                      outline: 'none',
                      position: 'fixed',
                      width: 550,
                      bottom: '50%',
                    },
                  }}
                />
              </div>
            )}
            <AccountEntry
              hasBalanceOnRefAccount={hasBalanceOnRefAccount}
              setShowWalletSelector={setShowWalletSelector}
              showWalletSelector={showWalletSelector}
            />
            <div
              className={
                isSignedIn ? ' relative right-3 flex items-center' : 'hidden'
              }
            >
              <ConnectDot />
              <ConnectDot />

              <AuroraEntry hasBalanceOnAurora={hasAuroraBalance} />
            </div>

            <MoreMenu />
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
