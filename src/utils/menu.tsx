import React, { ReactNode, useContext } from 'react';
import { AiOutlineMedium } from 'react-icons/ai';
import { FaDiscord, FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  IconAirDrop,
  IconCommunity,
  IconCreateNew,
  IconDocs,
  IconEn,
  IconForum,
  IconLanguage,
  IconPools,
  IconRainbow,
  IconZh,
  IconVi,
  IconBridge,
  IconEthereum,
  IconAurora,
  IconSolana,
  IconTerra,
  IconCelo,
  UkIcon,
  RuIcon,
  JaIcon,
  KoIcon,
  IconRisk,
  AuroraIconSwapNav,
  MobileYourLiqudityIcon,
  MobilePoolsIcon,
  BridgeIcon,
  RisksIcon,
  EsIcon,
  WrapNearIcon,
  MobileBridgeIcon,
  InquiriesIcon,
} from '~components/icon/Nav';
import { XrefIcon } from '~components/icon/Xref';
import getConfig from '../services/config';
import { MobileNavLimitOrder } from '../components/icon/Nav';
import {
  SWAP_MODE_KEY,
  SWAP_MODE,
  REF_FI_SWAP_SWAPPAGE_TAB_KEY,
} from '../pages/SwapPage';
import {
  MobileNavSwap,
  MobileNavStable,
  MobileNavSwapPro,
} from '../components/icon/Nav';
import { WalletContext } from '../utils/wallets-integration';

export type MenuItem = {
  id: number;
  label: string;
  url: string;
  icon?: ReactNode;
  isExternal: boolean;
  children?: MenuItem[];
  logo?: ReactNode;
  language?: string;
};
export const useMenuItems = () => {
  const intl = useIntl();
  const menuData: any[] = [
    // {
    //   label: intl.formatMessage({ id: 'stable_pool' }),
    //   specialMenuKey: 'sauce',
    //   url: '/sauce',
    // },
    {
      label: intl.formatMessage({ id: 'bridge' }),
      url: '',
      isExternal: false,
      logo: <BridgeIcon />,
      children: [
        {
          label: intl.formatMessage({ id: 'from_ethereum' }),
          url: 'https://rainbowbridge.app/transfer',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-1',
          logo: <IconEthereum />,
        },
        {
          label: intl.formatMessage({ id: 'from_aurora' }),
          url: 'https://rainbowbridge.app/transfer',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-2',
          logo: <IconAurora />,
        },
        {
          label: intl.formatMessage({ id: 'from_solana' }),
          url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-3',
          logo: <IconSolana />,
        },
        {
          label: intl.formatMessage({ id: 'from_terra' }),
          url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-4',
          logo: <IconTerra />,
        },
        {
          label: intl.formatMessage({ id: 'from_celo' }),
          url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-5',
          logo: <IconCelo />,
        },
      ],
    },
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
      // icon: <HiOutlineExternalLink />,
      isExternal: true,
      logo: <IconDocs />,
    },
    {
      label: intl.formatMessage({ id: 'risks' }),
      url: '/risks',
      isExternal: false,
      logo: <RisksIcon />,
    },
    {
      label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
      url: '/airdrop',
      isExternal: false,
      logo: <IconAirDrop />,
    },
    {
      label: 'Business Inquiries',
      url: 'https://form.typeform.com/to/onOPhJ6Y',
      isExternal: true,
      logo: <InquiriesIcon />,
    },
  ];
  return { menuData };
};

export const useLanguageItems = () => {
  const lan = [
    {
      label: 'English',
      language: 'en',
      logo: <IconEn />,
    },
    {
      label: '中文',
      language: 'zh-CN',
      logo: <IconZh />,
    },
    {
      label: 'Việt',
      language: 'vi',
      logo: <IconVi />,
    },
    {
      label: 'Українська',
      language: 'uk',
      logo: <UkIcon />,
    },
    {
      label: 'Pусский',
      language: 'ru',
      logo: <RuIcon />,
    },
    {
      label: '日本語',
      language: 'ja',
      logo: <JaIcon />,
    },
    {
      label: '한국어',
      language: 'ko',
      logo: <KoIcon />,
    },
    {
      label: 'Español',
      language: 'es',
      logo: <EsIcon />,
    },
  ];
  return lan;
};

export type MobileMenuItem = {
  id: string;
  label?: string;
  url: string;
  icon?: ReactNode;
  isExternal?: boolean;
  children?: MobileMenuItem[];
  logo?: ReactNode;
  pattern?: string;
  tip?: string;
  subRoute?: string[];
  showIcon?: boolean;
  iconElement?: ReactNode;
  hidden?: boolean;
  idElement?: JSX.Element | string;
  subMenuDefaultChosen?: boolean;
  specialMenuKey?: string;
  defaultClick?: (e?: any) => void;
};
export const moreLinks: MobileMenuItem[] = [
  {
    id: 'trade_capital',
    label: 'TRADE',
    pattern: '/',
    url: '/',
    isExternal: false,
  },
  {
    id: 'POOL',
    label: 'POOL',
    pattern: '/pools',
    url: '/yourliquidity',
    isExternal: false,
  },
  {
    id: 'farm_capital',
    label: 'FARMS',
    pattern: '/v2farms',
    url: '/v2farms',
    isExternal: false,
  },
  {
    id: 'xref',
    label: 'xREF',
    pattern: '/xref',
    url: '/xref',
    isExternal: false,
    showIcon: true,
    iconElement: <XrefIcon></XrefIcon>,
  },
  {
    id: 'vote_capital',
    label: 'VOTE',
    pattern: '/referendum',
    url: '/referendum',
    isExternal: false,
    hidden: !getConfig().REF_VE_CONTRACT_ID,
  },
  {
    id: 'MORE',
    label: 'MORE',
    url: '',
    isExternal: false,
    subRoute: ['/airdrop', '/risks', '/sauce'],
    children: [
      // {
      //   id: 'stable_pool',
      //   label: 'Stable Pool',
      //   pattern: '/sauce',
      //   specialMenuKey: 'sauce',
      //   url: '/sauce',
      // },
      {
        id: 'bridge',
        label: 'bridge',
        url: '',
        isExternal: false,
        logo: <MobileBridgeIcon />,
        children: [
          {
            id: 'from_ethereum',
            label: 'From Ethereum',
            url: 'https://rainbowbridge.app/transfer',
            isExternal: true,
            logo: <IconEthereum />,
          },
          {
            id: 'from_aurora',
            label: 'From Aurora',
            url: 'https://rainbowbridge.app/transfer',
            isExternal: true,
            logo: <IconAurora />,
          },
          {
            id: 'from_solana',
            label: 'From Solana',
            url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
            isExternal: true,
            logo: <IconSolana />,
          },
          {
            id: 'from_terra',
            label: 'From Terra',
            url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
            isExternal: true,
            logo: <IconTerra />,
          },
          {
            id: 'from_celo',
            label: 'From Celo',
            url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
            isExternal: true,
            logo: <IconCelo />,
          },
        ],
      },
      {
        id: 'docs',
        label: 'docs',
        url: 'https://guide.ref.finance',
        isExternal: true,
        logo: <IconDocs />,
      },
      {
        label: 'Risks',
        id: 'risks',
        pattern: '/risks',
        url: '/risks',
        isExternal: false,
        logo: <RisksIcon />,
      },
      {
        id: 'airdrop',
        label: 'Airdrop',
        url: '/airdrop',
        pattern: '/airdrop',
        isExternal: false,
        logo: <IconAirDrop />,
      },
      {
        id: 'inquiries',
        label: 'Business Inquiries',
        url: 'https://form.typeform.com/to/onOPhJ6Y',
        isExternal: true,
        logo: <InquiriesIcon />,
      },
    ],
  },
];
export const moreLinksOld: MobileMenuItem[] = [
  {
    id: 'trade_capital',
    label: 'TRADE',
    pattern: '/',
    url: '/',
    isExternal: false,
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    url: '',
    isExternal: false,
    children: [
      {
        id: 'your_liquidity',
        label: 'Your Liquidity',
        url: '/yourliquidity',
        isExternal: false,
        logo: <MobileYourLiqudityIcon />,
        defaultClick: () => {
          window.open('/yourliquidity', '_self');
        },
      },
      {
        id: 'pools',
        label: 'Pools',
        url: '/pools',
        isExternal: false,
        logo: <MobilePoolsIcon />,
        defaultClick: () => {
          window.open('/pools', '_self');
        },
      },
    ],
  },
  {
    id: 'sauce_capital',
    label: 'Sauce',
    pattern: '/sauce',
    url: '/sauce',
    isExternal: false,
  },
  {
    id: 'Farms',
    label: 'Farms',
    pattern: '/v2farms',
    url: '/v2farms',
    isExternal: false,
  },
  {
    id: 'xref',
    label: 'xREF',
    pattern: '/xref',
    url: '/xref',
    isExternal: false,
    showIcon: true,
    iconElement: <XrefIcon></XrefIcon>,
  },
  {
    id: 'vote_capital',
    label: 'VOTE!',
    pattern: '/referendum',
    url: '/referendum',
    isExternal: false,
    hidden: !getConfig().REF_VE_CONTRACT_ID,
  },
  {
    id: 'bridge',
    label: 'bridge',
    url: '',
    isExternal: false,
    children: [
      {
        id: 'from_ethereum',
        label: 'From Ethereum',
        url: 'https://rainbowbridge.app/transfer',
        isExternal: true,
        logo: <IconEthereum />,
      },
      {
        id: 'from_aurora',
        label: 'From Aurora',
        url: 'https://rainbowbridge.app/transfer',
        isExternal: true,
        logo: <IconAurora />,
      },
      {
        id: 'from_solana',
        label: 'From Solana',
        url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
        isExternal: true,
        logo: <IconSolana />,
      },
      {
        id: 'from_terra',
        label: 'From Terra',
        url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
        isExternal: true,
        logo: <IconTerra />,
      },
      {
        id: 'from_celo',
        label: 'From Celo',
        url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
        isExternal: true,
        logo: <IconCelo />,
      },
    ],
  },
  {
    id: 'more',
    label: 'More',
    url: '',
    isExternal: false,
    subRoute: ['/airdrop', '/risks'],
    children: [
      {
        id: 'airdrop',
        label: 'Airdrop',
        url: '/airdrop',
        pattern: '/airdrop',
        isExternal: false,
        logo: <IconAirDrop />,
      },
      {
        id: 'docs',
        label: 'docs',
        url: 'https://guide.ref.finance',
        isExternal: true,
        logo: <IconDocs />,
      },
      {
        label: 'Risks',
        id: 'risks',
        pattern: '/risks',
        url: '/risks',
        isExternal: false,
        logo: <RisksIcon />,
      },
    ],
  },
  // {
  //   id: 'community',
  //   label: 'Community',
  //   url: '',
  //   isExternal: false,
  //   children: [
  //     {
  //       logo: <FaDiscord />,
  //       label: 'Discord',
  //       id: 'Discord',
  //       url: 'https://discord.gg/SJBGcfMxJz',
  //       isExternal: true,
  //     },
  //     {
  //       logo: <FaTelegramPlane />,
  //       label: 'Telegram',
  //       id: 'Telegram',
  //       url: 'https://t.me/ref_finance',
  //       isExternal: true,
  //     },
  //     {
  //       logo: <FaTwitter />,
  //       id: 'Twitter',
  //       label: 'Twitter',
  //       url: 'https://twitter.com/finance_ref',
  //       isExternal: true,
  //     },
  //     {
  //       logo: <AiOutlineMedium />,
  //       id: 'Medium',
  //       label: 'Medium',
  //       url: 'https://ref-finance.medium.com/',
  //       isExternal: true,
  //     },
  //   ],
  // },
];
