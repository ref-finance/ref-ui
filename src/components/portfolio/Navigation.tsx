import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  MenuREFIcon,
  MenuOrderlyIcon,
  MenuBurrowIcon,
} from '../../components/icon/Portfolio';
export default function Navigation(props: any) {
  const [menuList, setMenuList] = useState([
    { Icon: MenuREFIcon, name: 'Ref.finance', id: 'ref' },
    { Icon: MenuOrderlyIcon, name: 'Orderly', id: 'orderly' },
    { Icon: MenuBurrowIcon, name: 'Burrow', id: 'burrow' },
  ]);
  const [activeMenu, setActiveMenu] = useState('ref');
  return (
    <>
      <div className="flex items-center">
        <span className="text-sm text-white text-opacity-50">Dapp</span>
      </div>
      <div className="flex flex-col mt-2.5">
        {menuList.map((item, index: number) => {
          const { Icon, name, id } = item;
          return (
            <div
              key={name}
              className={`flex items-center rounded-md h-14 pl-5 mb-2 ${
                activeMenu == id
                  ? 'bg-selectTokenV3BgColor border-l-4 border-gradientFromHover'
                  : ''
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
                  index == 0 ? 'hidden' : 'ml-1.5'
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
