import React, { ReactNode } from 'react';
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
} from '~components/icon/Nav';
import { XrefIcon } from '~components/icon/Xref';

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
    {
      label: <FormattedMessage id="Risks" defaultMessage="Risks" />,
      url: '/risks',
      isExternal: false,
      id: 0,
      logo: <IconRisk />,
    },
    {
      label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
      url: '/airdrop',
      isExternal: false,
      id: 1,
      logo: <IconAirDrop />,
    },
    {
      label: intl.formatMessage({ id: 'bridge' }),
      url: '',
      id: 2,
      isExternal: false,
      logo: <IconBridge />,
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
      icon: <HiOutlineExternalLink />,
      isExternal: true,
      id: 3,
      logo: <IconDocs />,
    },
    {
      label: <FormattedMessage id="language" defaultMessage="Language" />,
      url: '',
      isExternal: false,
      id: 10,
      logo: <IconLanguage />,
      children: [
        {
          label: 'English',
          isExternal: false,
          language: 'en',
          url: '',
          id: 11,
          logo: <IconEn />,
        },
        {
          label: '中文',
          isExternal: false,
          language: 'zh-CN',
          url: '',
          id: 12,
          logo: <IconZh />,
        },
        {
          label: 'Việt',
          isExternal: false,
          language: 'vi',
          url: '',
          id: 13,
          logo: <IconVi />,
        },
        {
          label: 'Yкраїнський',
          isExternal: false,
          language: 'uk',
          url: '',
          id: 14,
          logo: <UkIcon />,
        },
        {
          label: 'Pусский',
          isExternal: false,
          language: 'ru',
          url: '',
          id: 15,
          logo: <RuIcon />,
        },
        {
          label: '日本語',
          isExternal: false,
          language: 'ja',
          url: '',
          id: 16,
          logo: <JaIcon />,
        },
        {
          label: '한국어',
          isExternal: false,
          language: 'ko',
          url: '',
          id: 17,
          logo: <KoIcon />,
        },
      ],
    },
  ];

  return { menuData };
};

export type MobileMenuItem = {
  id: string;
  label: string;
  url: string;
  icon?: ReactNode;
  isExternal: boolean;
  children?: MobileMenuItem[];
  logo?: ReactNode;
  pattern?: string;
  tip?: string;
  subRoute?: string[];
  newFunction?: boolean;
  showIcon?: boolean;
  iconElement?: ReactNode;
};
export const moreLinks: MobileMenuItem[] = [
  {
    id: 'Swap',
    label: 'Swap',
    pattern: '/',
    url: '/',
    isExternal: false,
  },
  {
    id: 'Sauce',
    label: 'Sauce',
    pattern: '/sauce',
    url: '/sauce',
    isExternal: false,
  },
  {
    id: 'pools',
    label: 'Pools',
    url: '',
    subRoute: ['/pools', '/pools/add', '/pools/yours'],
    isExternal: false,
    children: [
      {
        id: 'view_pools',
        label: 'View Pools',
        url: '/pools',
        pattern: '/pools',
        isExternal: false,
        logo: <IconPools />,
      },
      {
        id: 'Create_New_Pool',
        label: 'Create New Pool',
        url: '/pools/add',
        pattern: '/pools/add',
        isExternal: false,
        logo: <IconCreateNew />,
      },
    ],
  },
  {
    id: 'Farms',
    label: 'Farms',
    pattern: '/farms',
    url: '/farms',
    isExternal: false,
  },
  {
    id: 'xref',
    label: 'xREF',
    pattern: '/xref',
    url: '/xref',
    isExternal: false,
    newFunction: true,
    showIcon: true,
    iconElement: <XrefIcon></XrefIcon>,
  },
  {
    id: 'Risks',
    label: 'Risks',
    pattern: '/risks',
    url: '/risks',
    isExternal: false,
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
    subRoute: ['/airdrop'],
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
      // {
      //   label: 'Forum',
      //   id: 'Forum',
      //   url: 'https://gov.ref.finance',
      //   isExternal: true,
      //   logo: <IconForum />,
      // },
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
