import React, { ReactNode } from 'react';
import { AiOutlineMedium } from 'react-icons/ai';
import {
  FaDiscord,
  FaExternalLinkAlt,
  FaTelegramPlane,
  FaTwitter,
} from 'react-icons/fa';
import { FormattedMessage, useIntl } from 'react-intl';

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
      label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
      url: '/airdrop',
      isExternal: false,
      id: 1,
    },
    {
      label: (
        <FormattedMessage id="rainbow_bridge" defaultMessage="RainBow Bridge" />
      ),
      url: 'https://ethereum.bridgetonear.org/',
      icon: <FaExternalLinkAlt />,
      isExternal: true,
      id: 2,
    },
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
      icon: <FaExternalLinkAlt />,
      isExternal: true,
      id: 3,
    },
    { label: 'Forum', url: 'https://gov.ref.finance', isExternal: true, id: 4 },

    {
      label: 'Community',
      url: '',
      icon: <FaExternalLinkAlt />,
      id: 5,
      children: [
        {
          logo: <FaTwitter />,
          label: 'Twitter',
          icon: <FaExternalLinkAlt />,
          url: 'https://twitter.com/finance_ref',
          isExternal: true,
          id: 6,
        },
        {
          logo: <FaTelegramPlane />,
          icon: <FaExternalLinkAlt />,
          label: 'Telegram',
          url: 'https://t.me/ref_finance',
          isExternal: true,
          id: 7,
        },
        {
          logo: <FaDiscord />,
          icon: <FaExternalLinkAlt />,
          label: 'Discord',
          url: 'https://discord.gg/SJBGcfMxJz',
          isExternal: true,
          id: 8,
        },
        {
          logo: <AiOutlineMedium />,
          icon: <FaExternalLinkAlt />,
          label: 'Medium',
          url: 'https://ref-finance.medium.com/',
          isExternal: true,
          id: 9,
        },
      ],
    },
    {
      label: <FormattedMessage id="language" defaultMessage="Language" />,
      url: '',
      isExternal: false,
      id: 10,

      children: [
        {
          label: 'English',
          isExternal: false,
          language: 'en',
          url: '',
          id: 11,
        },
        {
          label: '中文',
          isExternal: false,
          language: 'zh-CN',
          url: '',
          id: 12,
        },
      ],
    },
  ];

  return { menuData };
};
