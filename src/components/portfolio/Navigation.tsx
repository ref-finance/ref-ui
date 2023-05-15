import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  MenuREFIcon,
  MenuOrderlyIcon,
  MenuBurrowIcon,
} from '../../components/icon/Portfolio';
import { useHistory, useLocation } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
export default function Navigation(props: any) {
  const history = useHistory();
  const location = useLocation();
  const [menuList, setMenuList] = useState([
    {
      Icon: MenuREFIcon,
      name: 'Ref.finance',
      id: 'ref',
      url: '/portfolio/ref',
      borderColor: '#00D6AF',
    },
    { Icon: MenuOrderlyIcon, name: 'Orderly', id: 'orderly' },
    {
      Icon: MenuBurrowIcon,
      name: 'Burrow',
      id: 'burrow',
      url: '/portfolio/burrow',
      borderColor: '#745F4B',
    },
  ]);
  const [activeMenu, setActiveMenu] = useState('');
  useEffect(() => {
    if (location.pathname.includes('ref')) {
      setActiveMenu('ref');
    } else if (location.pathname.includes('burrow')) {
      setActiveMenu('burrow');
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
              className={`flex items-center rounded-md h-14 pl-5 mb-2 ${
                url ? 'cursor-pointer' : ''
              } ${
                activeMenu == id ? 'bg-selectTokenV3BgColor border-l-4' : ''
              }`}
            >
              <div className="w-7">
                <Icon></Icon>
              </div>
              <span
                className={`text-base text-white gotham_bold ${
                  activeMenu == id ? '' : 'text-opacity-50'
                }`}
              >
                {name}
              </span>
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
