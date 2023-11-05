import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  MenuREFIcon,
  MenuOrderlyIcon,
  OverviewMIcon,
  RefMIcon,
  OrderlyMIcon,
  BurrowMIcon,
  OverviewMenuIcon,
} from '../../components/icon/Portfolio';
import { useHistory, useLocation } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
export default function Navigation(props: any) {
  const history = useHistory();
  const location = useLocation();
  const [menuList, setMenuList] = useState([
    {
      Icon: OverviewMenuIcon,
      name: <FormattedMessage id="Overview" />,
      id: 'overview',
      url: '/overview',
      borderColor: '#ffffff',
    },
    {
      Icon: MenuREFIcon,
      name: <FormattedMessage id="RefFinance" />,
      id: 'ref',
      url: '/portfolio',
      borderColor: '#00D6AF',
    },
    {
      Icon: MenuOrderlyIcon,
      name: 'Orderly',
      id: 'orderly',
      url: '/orderly',
      borderColor: '#4527FF',
    },
  ]);
  const [activeMenu, setActiveMenu] = useState('');
  useEffect(() => {
    if (location.pathname.includes('portfolio')) {
      setActiveMenu('ref');
    } else if (location.pathname.includes('burrow')) {
      setActiveMenu('burrow');
    } else if (location.pathname.includes('overview')) {
      setActiveMenu('overview');
    } else if (location.pathname.includes('orderly')) {
      setActiveMenu('orderly');
    }
  }, [location.pathname]);

  return (
    <>
      <div className="flex items-center">
        <span className="text-sm text-white text-opacity-50">Dapp</span>
      </div>
      <div className="flex flex-col mt-2.5">
        {menuList.map((item, index: number) => {
          const { Icon, name, id, url, borderColor } = item;
          return (
            <div
              onClick={() => {
                history.push(url);
              }}
              key={`${id}_${index}`}
              style={{
                borderColor: activeMenu == id ? borderColor : '',
              }}
              className={`flex items-center rounded-md h-14 pl-5 mb-2 text-white  ${
                url ? 'cursor-pointer' : ''
              } ${
                activeMenu == id
                  ? 'bg-selectTokenV3BgColor border-l-4'
                  : 'text-opacity-50'
              }`}
            >
              <div className="w-7">
                <Icon activeMenu={activeMenu == id}></Icon>
              </div>
              <span className={`text-base  gotham_bold`}>{name}</span>
              <span
                className={`text-xs text-primaryText rounded-md bg-navGreyColor px-1.5 py-0.5 ${
                  url ? 'hidden' : 'ml-1.5'
                }`}
              >
                Soon
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function NavigationMobile(props: any) {
  const history = useHistory();
  const location = useLocation();
  const [menuList, setMenuList] = useState([
    {
      Icon: OverviewMIcon,
      name: <FormattedMessage id="Overview" />,
      id: 'overview',
      url: '/overview',
    },
    {
      Icon: RefMIcon,
      name: 'Ref',
      id: 'ref',
      url: '/portfolio',
    },
    {
      Icon: OrderlyMIcon,
      name: 'Orderly',
      id: 'orderly',
      url: '/orderly',
    },
  ]);
  const [activeMenu, setActiveMenu] = useState('');
  useEffect(() => {
    if (location.pathname.includes('portfolio')) {
      setActiveMenu('ref');
    }
    if (location.pathname.includes('orderly')) {
      setActiveMenu('orderly');
    } else if (location.pathname.includes('overview')) {
      setActiveMenu('overview');
    }
  }, [location.pathname]);
  return (
    <div
      className="flex items-center justify-between bg-cardBg py-1.5 fixed left-0 w-full z-50"
      style={{ height: '48px', bottom: '32px', borderTop: '1px solid #313a38' }}
    >
      {menuList.map((item: any) => {
        const { Icon, name, id, url } = item;
        return (
          <div
            key={id}
            onClick={() => {
              if (url) {
                history.push(url);
              }
            }}
            className={`flex flex-col items-center justify-between h-full gotham_bold text-sm border-r border-burrowTableBorderColor w-1/3 ${
              activeMenu == id ? 'text-senderHot' : 'text-primaryText'
            } ${url ? '' : 'text-opacity-40'}`}
          >
            <Icon></Icon>
            {name}
          </div>
        );
      })}
    </div>
  );
}
