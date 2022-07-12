import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/sender-wallet';
import { useHistory } from 'react-router-dom';
export const PoolTab = () => {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [choosedTab, setChoosedTab] = useState('');
  const history = useHistory();
  useEffect(() => {
    const pathname = location.pathname;
    if (
      pathname.startsWith('/pool/') ||
      pathname.startsWith('/more_pools/') ||
      pathname == '/pools' ||
      pathname == '/pools/add'
    ) {
      setChoosedTab('1');
    } else if (pathname == '/pools/yours') {
      setChoosedTab('3');
    }
  }, []);
  function goPage(url: string) {
    history.push(url);
  }
  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-cardBg text-primaryText font-normal mb-4 text-lg  p-1 mx-auto  xs:text-sm md:text-sm ${
        isSignedIn
          ? 'xl:w-1/3 2xl:w-1/3 3xl:w-1/4 lg:w-1/2 md:w-5/6 xs:w-auto xs:mx-2'
          : 'xl:w-1/4 2xl:w-1/4 3xl:w-1/4 lg:w-1/3 md:w-5/6 xs:w-5/6'
      }`}
      style={{
        height: '50px',
      }}
    >
      <span
        className={`flex items-center justify-center h-full flex-grow text-center cursor-pointer ${
          choosedTab == '1' ? 'bg-tabChosen text-white rounded-xl' : ''
        }`}
        onClick={() => {
          goPage('/pools');
        }}
      >
        <FormattedMessage id="view_pools" defaultMessage="View Pools" />
      </span>
      {/* {
        <span
          className={`flex items-center justify-center h-full  flex-grow text-center cursor-pointer ${
            choosedTab == '2' ? 'bg-tabChosen text-white rounded-xl' : ''
          }`}
          onClick={() => {
            goPage('/pools/add');
          }}
        >
          <FormattedMessage
            id="Create_New_Pool"
            defaultMessage="Create New Pool"
          />
        </span>
      } */}

      {isSignedIn ? (
        <span
          className={`flex items-center justify-center h-full  flex-grow text-center cursor-pointer ${
            choosedTab == '3' ? 'bg-tabChosen text-white rounded-xl' : ''
          }`}
          onClick={() => {
            goPage('/pools/yours');
          }}
        >
          <FormattedMessage
            id="Your_Liquidity"
            defaultMessage="Your Liquidity"
          />
        </span>
      ) : null}
    </div>
  );
};
