import React, { useEffect, useState } from 'react';

import { AiOutlineMedium } from '@react-icons/all-files/ai/AiOutlineMedium';

import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';

import { FooterLogo, FooterLogoREF } from '~components/icon/FooterLogo';
import { RefAnalytics, RefAnalyticsGary } from '~components/icon/RefAnalytics';
import { useRefPrice } from '~state/account';
import { toPrecision } from '~utils/numbers';
import RpcList from '~components/rpc/index';
import { IconForum, MailBoxIcon } from '~components/icon/Nav';
import ReactTooltip from 'react-tooltip';

const CommunityLinks = [
  {
    label: 'Discord',
    url: 'https://discord.gg/SJBGcfMxJz',
    icon: <FaDiscord></FaDiscord>,
  },
  {
    label: 'Twitter',
    url: 'https://twitter.com/finance_ref',
    icon: <FaTwitter></FaTwitter>,
  },
  {
    label: 'Telegram',
    url: 'https://t.me/ref_finance',
    icon: <FaTelegramPlane></FaTelegramPlane>,
  },
  {
    label: 'Medium',
    url: 'https://ref-finance.medium.com/',
    icon: <AiOutlineMedium></AiOutlineMedium>,
  },
  {
    label: 'Forum',
    url: 'https://gov.ref.finance',
    icon: <IconForum />,
  },
];
function Footer() {
  const { data } = useRefPrice('Footer');
  const [hoverLogo, setHoverLogo] = useState(false);
  if (!data) return null;

  return (
    <>
      <div className="absolute w-full bottom-6 xs:bottom-0 md:bottom-0">
        <footer className="flex items-center justify-center pl-9 pr-9 xs:pb-9 md:pb-9">
          <div className="fixed left-8 bottom-5 md:hidden xs:hidden">
            <div className="flex items-center bg-cardBg rounded-2xl p-0.5 w-24">
              <FooterLogoREF
                className="rounded-full mr-1.5"
                style={{ width: '28px', height: '28px' }}
              ></FooterLogoREF>
              <span className="text-sm text-white">
                ${data === '-' ? '-' : toPrecision(data, 2)}
              </span>
            </div>
            <div className="flex items-center mt-5">
              <div
                className="cursor-pointer"
                onMouseOver={() => setHoverLogo(true)}
                onMouseLeave={() => setHoverLogo(false)}
                onClick={() => window.open('https://stats.ref.finance/')}
              >
                {!hoverLogo && (
                  <RefAnalyticsGary
                    style={{
                      transform: 'scale(0.9)',
                      transformOrigin: '30% 0%',
                    }}
                  />
                )}
                {hoverLogo && (
                  <RefAnalytics
                    style={{
                      transform: 'scale(0.9)',
                      transformOrigin: '30% 0%',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex w-72 justify-between md:justify-around xs:justify-around">
            {CommunityLinks.map((link) => {
              return (
                <div
                  key={link.url}
                  className={`text-2xl font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenColor`}
                  onClick={() => window.open(link.url)}
                >
                  {link.icon}
                </div>
              );
            })}
          </div>
        </footer>
        <RpcList></RpcList>
      </div>
    </>
  );
}
export default Footer;
