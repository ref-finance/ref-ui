import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FormattedMessage, FormattedRelativeTime, useIntl } from 'react-intl';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Card } from 'src/components/card/Card';
import { NavLogoIcon, Near } from 'src/components/icon';
import { AccountIcon } from 'src/components/icon/Common';
import { Context } from 'src/components/wrapper';
import getConfig from 'src/services/config';
import { NEARXIDS, wallet } from 'src/services/near';
import {
  BridgeButton,
  menuItemType,
  useLanguageItems,
  useMenus,
} from 'src/utils/menu';
import { auroraAddr, useAuroraTokens } from '../../services/aurora/aurora';
import { ETH_DECIMAL } from '../../services/aurora/aurora';
import { useAuroraBalances } from '../../services/aurora/aurora';
import { getAuroraConfig } from '../../services/aurora/config';
import { ftGetTokensMetadata } from '../../services/ft-contract';
import { useTokenBalances } from '../../state/token';
import { useClientMobile, useMobile } from '../../utils/device';
import { toReadableNumber } from '../../utils/numbers';
import { getCurrentWallet } from '../../utils/wallets-integration';
import { WalletContext } from '../../utils/wallets-integration';
import { getAccountName } from '../../utils/wallets-integration';
import { AuroraIcon, CopyIcon, HasBalance } from '../icon/CrossSwapIcons';
import { FarmDot } from '../icon/FarmStamp';
import {
  FiChevronRight,
  HiOutlineExternalLink,
  IoChevronBack,
} from '../reactIcons';
import { MobileNavBar } from './MobileNav';
import { QuestionTip } from './TipWrapper';
import { getURLInfo } from './transactionTipPopUp';

import {
  useWalletSelector,
  ACCOUNT_ID_KEY,
} from 'src/context/WalletSelectorContext';

import { useDCLAccountBalance } from '../../services/aurora/aurora';
import { BuyNearButton } from '../button/Button';
import {
  get_orderly_public_key_path,
  get_orderly_private_key_path,
} from '../../pages/Orderly/orderly/utils';
import { REF_ORDERLY_ACCOUNT_VALID } from '../../pages/Orderly/components/UserBoard/index';
import {
  tradingKeyMap,
  REF_FI_SENDER_WALLET_ACCESS_KEY,
} from '../../pages/Orderly/orderly/utils';
import { ORDERLY_ASSET_MANAGER } from '../../pages/Orderly/near';
import { ArrowDownIcon, DownTriangleIcon } from 'src/components/icon/Nav';
import { openUrl } from '../../services/commonV3';
import { WalletRiskCheckBoxModal } from 'src/context/modal-ui/components/WalletOptions/WalletRiskCheckBox';
import { CONST_ACKNOWLEDGE_WALLET_RISK } from 'src/constants/constLocalStorage';
import { WalletSelectorModal } from './WalletSelector';
import { isNewHostName } from '../../services/config';
import { KeyIcon } from '../../components/portfolio/icons';
import AccessKeyModal from '../../components/portfolio/AccessKeyModal';
import Guider, { LinkLine } from 'src/components/layout/Guider';

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

function AccountEntry({
  setShowWalletSelector,
  showWalletSelector,
  hasBalanceOnRefAccount,
}: {
  setShowWalletSelector: (show: boolean) => void;
  showWalletSelector: boolean;
  hasBalanceOnRefAccount: boolean;
}) {
  const isInMemePage = window.location.pathname.includes('meme');
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

  const [showTip, setShowTip] = useState<boolean>(false);
  const [copyButtonDisabled, setCopyButtonDisabled] = useState<boolean>(false);

  const [showWalletRisk, setShowWalletRisk] = useState<boolean>(false);
  const [keyModalShow, setKeyModalShow] = useState<boolean>(false);
  const [showGuider, setShowGuider] = useState<boolean>(
    !!(localStorage.getItem('ACCESS_MODAL_GUIDER') !== '1' && accountId)
  );
  const handleWalletModalOpen = () => {
    const isAcknowledgeWalletRisk = localStorage.getItem(
      CONST_ACKNOWLEDGE_WALLET_RISK
    );
    if (!isAcknowledgeWalletRisk) {
      setShowWalletRisk(true);
    } else {
      modal.show();
    }
  };
  const handleAcknowledgeClick = (status) => {
    if (status === true) {
      setShowWalletRisk(false);
      localStorage.setItem(CONST_ACKNOWLEDGE_WALLET_RISK, '1');
      modal.show();
    }
  };

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

    if (curWallet.id === 'sender') {
      try {
        const senderAccessKey = localStorage.getItem(
          REF_FI_SENDER_WALLET_ACCESS_KEY
        );

        const allKeys = Object.keys(JSON.parse(senderAccessKey).allKeys);

        //@ts-ignore

        await window.near.signOut({
          contractId: allKeys.includes(ORDERLY_ASSET_MANAGER)
            ? ORDERLY_ASSET_MANAGER
            : allKeys[0],
        });
      } catch (error) {
        await window.near.signOut();
      }
    } else {
      await curWallet.signOut();
    }

    localStorage.removeItem(ACCOUNT_ID_KEY);

    const priKeyPath = get_orderly_private_key_path();

    const pubKeyPath = get_orderly_public_key_path();

    tradingKeyMap.clear();
    localStorage.removeItem(priKeyPath);
    localStorage.removeItem(pubKeyPath);

    localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);

    if (window.location.pathname === '/orderbook') {
      window.location.assign('/orderbook');
    } else {
      window.location.assign('/');
    }
  };

  const accountList = [
    {
      icon: <AccountIcon />,
      textId: 'your_assets',
      selected: location.pathname == '/overview',
      click: () => {
        history.push('/overview');
        clearGuilder();
      },
    },
  ];

  function showToast() {
    if (copyButtonDisabled) return;
    setCopyButtonDisabled(true);
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
      setCopyButtonDisabled(false);
    }, 1000);
  }
  function closeKeyModal() {
    setKeyModalShow(false);
  }
  function showkeyModal() {
    document.documentElement.style.overflow = 'visible';
    setKeyModalShow(true);
    clearGuilder();
  }
  function clearGuilder() {
    setShowGuider(false);
    localStorage.setItem('ACCESS_MODAL_GUIDER', '1');
  }
  const isMobile = useClientMobile();
  const isDisableChangeWallet = ['keypom', 'Keypom Account'].includes(
    currentWalletName
  );

  return (
    <div
      className="bubble-box relative user text-xs text-center justify-end z-40"
      style={{
        zIndex: 51,
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
                  //modal.show();
                  handleWalletModalOpen();
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

            <WalletRiskCheckBoxModal
              isOpen={showWalletRisk}
              setCheckedStatus={handleAcknowledgeClick}
              onClose={() => setShowWalletRisk(false)}
            />
          </div>
        </div>
        {(isSignedIn && hover) || (showGuider && !isInMemePage) ? (
          <div
            className={`absolute top-14 pt-2 right-0 w-64`}
            style={{ zIndex: showGuider ? '1000' : '40' }}
          >
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
                    {currentWalletIcon && (
                      <span className="mr-1">
                        <img
                          src={currentWalletIcon}
                          className="w-3 h-3 mr-1"
                          alt=""
                        />
                      </span>
                    )}
                    <span className="text-xs text-primaryText">
                      {currentWalletName || '-'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center justify-center relative">
                    <CopyToClipboard
                      text={wallet.getAccountId()}
                      onCopy={showToast}
                    >
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
                    {showTip ? (
                      <span className="text-xs text-white rounded-lg px-2.5 py-1.5 absolute bottom-8 bg-mobileOrderBg z-50">
                        Copied!
                      </span>
                    ) : null}
                  </div>

                  <button
                    className="hover:text-gradientFrom text-primaryText ml-2"
                    onClick={() => {
                      openUrl(
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
                  className={`mr-2 w-1/2 py-1.5 border rounded-lg border-opacity-30 ${
                    isDisableChangeWallet
                      ? 'border-gray-500 text-gray-500 cursor-default'
                      : 'text-BTCColor hover:border-transparent hover:bg-opacity-20 hover:bg-BTCColor border-BTCColor'
                  }`}
                  onClick={() => {
                    signOut();
                    clearGuilder();
                  }}
                  disabled={isDisableChangeWallet}
                >
                  <FormattedMessage
                    id="disconnect"
                    defaultMessage={'Disconnect'}
                  />
                </button>

                <button
                  className={`ml-2 w-1/2 py-1.5 border rounded-lg border-opacity-30 ${
                    isDisableChangeWallet
                      ? 'border-gray-500 text-gray-500 cursor-default'
                      : 'text-gradientFrom border-gradientFrom hover:border-transparent hover:bg-gradientFrom hover:bg-opacity-20'
                  }`}
                  onClick={async () => {
                    modal.show();
                    clearGuilder();
                  }}
                  disabled={isDisableChangeWallet}
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
                  <React.Fragment key={item.textId + index}>
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
                    </div>
                    <div
                      onClick={showkeyModal}
                      className={`flex items-center mx-3 text-sm cursor-pointer font-semibold py-4 pl-3 hover:text-white hover:bg-black rounded-lg hover:bg-opacity-10  ${
                        showGuider
                          ? 'text-white bg-black bg-opacity-10'
                          : 'text-primaryText'
                      }`}
                    >
                      <label className="w-9">
                        <KeyIcon />
                      </label>
                      <label className="cursor-pointer text-base">
                        Approved Key
                      </label>
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
                  </React.Fragment>
                );
              })}
            </Card>
          </div>
        ) : null}
      </div>
      {accountId && keyModalShow ? (
        <AccessKeyModal isOpen={keyModalShow} onRequestClose={closeKeyModal} />
      ) : null}
      {showGuider && !isMobile && !isInMemePage ? (
        <div>
          <Guider clearGuilder={clearGuilder} />
          <LinkLine
            className="absolute"
            style={{ zIndex: '1001', right: '240px', top: '265px' }}
          />
        </div>
      ) : null}
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
          openUrl('/account?tab=aurora');
          return;
        }
        if (isMobile) {
          if (!hasBalanceOnAurora) {
            openUrl('/account?tab=aurora');
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
            openUrl('/account?tab=aurora');
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
              rel="noopener noreferrer nofollow"
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

function NavigationBar() {
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
  const isMobile = useMobile();

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
      <div
        className="nav-wrap md:hidden xs:hidden text-center relative"
        style={{ zIndex: '91' }}
      >
        <div
          className={`relative z-10 ${
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
            onClick={() => openUrl('/account?tab=ref')}
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
          className="flex items-center justify-between px-9 border-b border-cardBg"
          style={{
            height: '55px',
          }}
        >
          <div className="flex items-center h-full">
            <div className="xsm:hidden transform mr-14 relative z-10">
              <NavLogoIcon
                className="cursor-pointer"
                onClick={() => {
                  openUrl('https://www.ref.finance/');
                }}
              />
            </div>
            <div className="flex items-center h-full">
              <MenuBar></MenuBar>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <div className="mr-3">
              <BridgeButton></BridgeButton>
            </div>

            {isMobile ? null : <BuyNearButton />}

            <div className="flex items-center mx-3">
              <AccountEntry
                hasBalanceOnRefAccount={hasBalanceOnRefAccount}
                setShowWalletSelector={setShowWalletSelector}
                showWalletSelector={showWalletSelector}
              />
              {/*<div className={isSignedIn ? 'flex items-center' : 'hidden'}>*/}
              {/*  <ConnectDot />*/}
              {/*  <ConnectDot />*/}
              {/*  <AuroraEntry hasBalanceOnAurora={hasAuroraBalance} />*/}
              {/*</div>*/}
            </div>
            <Language></Language>
          </div>
        </nav>
        {/* {isMobile ? null : <Marquee></Marquee>} */}
      </div>

      {isMobile && (
        <MobileNavBar
          hasBalanceOnRefAccount={hasBalanceOnRefAccount}
          isSignedIn={isSignedIn}
          setShowWalletSelector={setShowWalletSelector}
          showWalletSelector={showWalletSelector}
          hasAuroraBalance={hasAuroraBalance}
        />
      )}

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

export const commonLangKey = ['en', 'zh-CN', 'vi', 'ko', 'es'];

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

function MenuBar() {
  const history = useHistory();
  const [hover_two_level_items, set_hover_two_level_items] = useState<
    menuItemType[]
  >([]);
  const [hover_one_level_id, set_hover_one_level_id] = useState<string>();

  const [hover_two_level_id, set_hover_two_level_id] = useState<string>();

  const [back_one_level_item, set_back_one_level_item] =
    useState<JSX.Element>();
  const [one_level_selected, set_one_level_selected] = useState<string>('');
  const [two_level_selected, set_two_level_selected] = useState<string>('');

  function hover_on_one_level_item(item: menuItemType) {
    const { children, id } = item;
    if (children) {
      set_hover_two_level_items(children);
    }
    set_hover_one_level_id(id);
  }

  function hover_off_one_level_item() {
    set_hover_two_level_items([]);
    set_back_one_level_item(null);
    set_hover_two_level_id(undefined);
    set_hover_one_level_id('');
  }

  function click_one_level_item(item: menuItemType) {
    const { clickEvent, url, isExternal } = item;
    if (clickEvent) {
      clickEvent();
    } else if (url) {
      if (isExternal) {
        openUrl(url);
      } else {
        history.push(url);
      }
    }
    if (clickEvent && url) {
      hover_off_one_level_item();
    }
  }

  function click_two_level_item(item: menuItemType) {
    const { children, label, clickEvent, url, isExternal } = item;
    if (children) {
      set_hover_two_level_items(children);
      set_back_one_level_item(label);
    } else {
      if (clickEvent) {
        clickEvent();
      } else if (url) {
        if (isExternal) {
          openUrl(url);
        } else {
          history.push(url);
        }
      }

      if (clickEvent) {
        hover_off_one_level_item();
      }
    }
  }

  function click_three_level_title_to_back(menuItem: menuItemType) {
    const { children } = menuItem;
    set_hover_two_level_items(children);
    set_back_one_level_item(null);
  }

  const menus_temp = useMenus(() => {
    hover_off_one_level_item();
    set_hover_two_level_id(undefined);
  });
  const menus = useMemo(() => {
    if (menus_temp) {
      const menus_final = menus_temp.filter((m: menuItemType) => {
        return !m.hidden;
      });
      return menus_final;
    }
  }, [menus_temp]);
  useEffect(() => {
    const pathname = '/' + location.pathname.split('/')[1];
    let one_level_selected_id = '';
    let two_level_selected_id = '';
    const swap_mode_in_localstorage =
      localStorage.getItem('SWAP_MODE_VALUE') || 'normal';

    if (menus) {
      const one_level_menu = menus.find((item: menuItemType) => {
        const { links } = item;
        return links?.indexOf(pathname) > -1;
      });
      if (one_level_menu) {
        const { id, children } = one_level_menu;
        one_level_selected_id = id;
        const second_children: any = children;
        if (second_children) {
          const two_level_menu = second_children.find((item: menuItemType) => {
            const { links, swap_mode } = item;
            const condition = isNewHostName
              ? pathname == '/swap'
              : pathname == '/' || pathname == '/swap';
            if (condition) {
              return swap_mode_in_localstorage == swap_mode;
            } else {
              return links?.indexOf(pathname) > -1;
            }
          });
          if (two_level_menu) {
            two_level_selected_id = two_level_menu.id;
          }
        }
      } else {
        menus.find((d) => {
          const match = d.links.includes(pathname);
          if (!match && Array.isArray(d.children)) {
            const level2Match = d.children.find((c) =>
              c.links?.includes(pathname)
            );

            if (level2Match) {
              two_level_selected_id = level2Match.id;
              one_level_selected_id = d.id;
            }
          }
          return match;
        });
      }

      set_one_level_selected(one_level_selected_id);
      set_two_level_selected(two_level_selected_id);
    }
  }, [location.pathname, menus]);
  return (
    <div className="flex items-center h-full z-50">
      {menus?.map((menuItem: menuItemType, indexP) => {
        const { label, logo, children, id, hoverLabel } = menuItem;
        return (
          <div
            id={`menu-${id}`}
            key={indexP}
            className="relative flex items-center justify-center cursor-pointer h-full z-50"
            onMouseEnter={() => hover_on_one_level_item(menuItem)}
            onMouseLeave={() => hover_off_one_level_item()}
          >
            {/* one-level */}
            <div
              onClick={() => {
                click_one_level_item(menuItem);
              }}
              className={`flex items-center h-full  ${
                indexP != menus.length - 1 ? 'mr-10' : ''
              } ${
                one_level_selected == id || hover_one_level_id == id
                  ? 'text-white'
                  : 'text-primaryText'
              }`}
            >
              {logo ? <span className="mr-1">{logo}</span> : null}
              <div className={`text-base `}>{label}</div>
              {children ? (
                <DownTriangleIcon className="ml-1 mt-1"></DownTriangleIcon>
              ) : null}
            </div>
            {/* two-level */}
            <div
              className={`absolute rounded-2xl border border-menuMoreBoxBorderColor bg-priceBoardColor top-12 cursor-pointer px-2.5 py-1 pc-menu-bar-one-level ${
                hover_one_level_id == id &&
                children &&
                hover_two_level_items.length > 0
                  ? ''
                  : 'hidden'
              }`}
              style={{ minWidth: '220px', left: '-80px' }}
            >
              {back_one_level_item && (
                <div
                  className="whitespace-nowrap hover:text-white text-left items-center flex justify-start text-sm  text-primaryText cursor-pointer pt-4 pb-2"
                  onClick={() => {
                    click_three_level_title_to_back(menuItem);
                  }}
                >
                  <IoChevronBack className="text-xl " />
                  <span className="ml-3">{back_one_level_item}</span>
                </div>
              )}
              {hover_two_level_items?.map((item: menuItemType, indexC) => {
                const {
                  label,
                  logo,
                  children,
                  id: id_two_level,
                  icon,
                  hoverLabel,
                  renderLogo,
                } = item;
                return (
                  <div
                    key={indexC}
                    onClick={() => {
                      click_two_level_item(item);
                    }}
                    onMouseEnter={() => {
                      set_hover_two_level_id(id_two_level);
                    }}
                    onMouseLeave={() => {
                      set_hover_two_level_id(id_two_level);
                    }}
                    className={`flex items-center rounded-xl whitespace-nowrap hover:bg-menuMoreBgColor hover:text-white text-sm py-3 my-1.5 px-2 cursor-pointer ${
                      two_level_selected == id_two_level
                        ? 'bg-menuMoreBgColor text-white'
                        : 'text-primaryText'
                    }`}
                  >
                    {logo || renderLogo ? (
                      <div className="w-8 mr-2">
                        {renderLogo
                          ? renderLogo({
                              activeMenu: two_level_selected == id_two_level,
                            })
                          : logo}
                      </div>
                    ) : null}
                    <div className="text-base ">
                      {hover_two_level_id == id_two_level && hoverLabel
                        ? hoverLabel
                        : label}
                    </div>
                    {children ? (
                      <span className="text-xl ml-2">
                        <FiChevronRight />
                      </span>
                    ) : null}
                    {icon ? <span className="ml-4 text-xl">{icon}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
