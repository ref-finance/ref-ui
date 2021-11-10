import React, { useEffect, useState } from 'react';
import { AiOutlineMedium } from 'react-icons/ai';
import { FaDiscord, FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { FooterLogo } from '~components/icon/FooterLogo';
import { RefAnalytics, RefAnalyticsGary } from '~components/icon/RefAnalytics';
import { useRefPrice } from '~state/account';
import { toPrecision } from '~utils/numbers';

const CommunityLinks = [
  {
    label: 'Discord',
    url: 'https://discord.gg/SJBGcfMxJz',
    icon: <FaDiscord />,
  },
  {
    label: 'Twitter',
    url: 'https://twitter.com/finance_ref',
    icon: <FaTwitter />,
  },
  {
    label: 'Telegram',
    url: 'https://t.me/ref_finance',
    icon: <FaTelegramPlane />,
  },
  {
    label: 'Medium',
    url: 'https://ref-finance.medium.com/',
    icon: <AiOutlineMedium />,
  },
];
function Footer() {
  const { data } = useRefPrice();
  const [hoverLogo, setHoverLogo] = useState(false);
  if (!data) return null;

  return (
    <>
      <div className="absolute w-full bottom-6">
        <footer className="flex items-center justify-center pl-9 pr-9">
          <div className="fixed left-3 bottom-5 md:hidden xs:hidden">
            <FooterLogo />
            <div className="flex justify-star items-center pl-14 text-white">
              ${data === '-' ? '-' : toPrecision(data, 2)}
            </div>
            <div
              className="mt-5 ml-5 cursor-pointer"
              onMouseOver={() => setHoverLogo(true)}
              onMouseLeave={() => setHoverLogo(false)}
              onClick={() => window.open('https://sodaki.com/')}
            >
              {!hoverLogo && <RefAnalyticsGary />}
              {hoverLogo && <RefAnalytics />}
            </div>
          </div>
          <div className="flex w-72 justify-between md:justify-around xs:justify-around">
            {CommunityLinks.map((link) => {
              return (
                <div
                  key={link.url}
                  className={`text-2xl font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenLight`}
                  onClick={() => window.open(link.url)}
                >
                  {link.icon}
                </div>
              );
            })}
          </div>
        </footer>
      </div>
    </>
  );
}
export default Footer;
