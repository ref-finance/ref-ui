import React, { useEffect, useMemo, useState, useContext } from 'react';
import { OverviewIcon, PositionsIcon, TokenIcon } from '../icon/Portfolio';
import { PortfolioData } from '../../pages/Portfolio';
import { FormattedMessage, useIntl } from 'react-intl';
export default function MainTab() {
  const { main_active_tab, set_main_active_tab } = useContext(PortfolioData);

  const [mainTabList, setMainTabList] = useState([
    { name: '', icon: <OverviewIcon />, id: 'Summary' },
    { name: '', icon: <PositionsIcon />, id: 'positions_2' },
  ]);

  function switchMainTab(id: string) {
    set_main_active_tab(id);
  }
  return (
    <div className="flex items-center justify-between mx-4 bg-darkBg2 rounded-lg p-1 h-9">
      {mainTabList.map((tab: { name: string; icon: any; id: string }) => {
        const { name, icon, id } = tab;
        return (
          <div
            onClick={() => {
              switchMainTab(id);
            }}
            key={id}
            className={`flex w-1 flex-grow items-center justify-center h-full rounded-lg ${
              main_active_tab == id
                ? 'text-black bg-senderHot'
                : 'text-primaryText'
            }`}
          >
            {icon}
            <span className="ml-1.5 text-sm gotham_bold">
              {name || <FormattedMessage id={id}></FormattedMessage>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
