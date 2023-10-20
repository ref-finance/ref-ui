import React, { useState, useEffect, useRef, useContext } from 'react';
import ActionSheet, { ActionSheetRef } from 'actionsheet-react';
import { getLatestActions, ActionData } from 'src/services/indexer';
import Loading from 'src/components/layout/Loading';
import { Card } from 'src/components/card/Card';
import { FormattedMessage } from 'react-intl';
import { mapToView } from 'src/components/icon/Actions';
import moment from 'moment';
import { wallet as webWallet } from 'src/services/near';
import getConfig from 'src/services/config';
import { GradientButton, GrayButton } from 'src/components/button/Button';
import Modal from 'react-modal';
import { isMobile } from 'src/utils/device';
const config = getConfig();
import { useHistory } from 'react-router';
import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import { getSenderLoginRes } from '../utils/wallets-integration';
import { openUrl } from '../services/commonV3';

function useLastActions() {
  const [actions, setActions] = useState<ActionData[]>(null);

  useEffect(() => {
    const isSignedIn = getCurrentWallet()?.wallet?.isSignedIn();

    if (!isSignedIn) return;
    else
      getLatestActions().then((resp) => {
        setActions(resp);
      });
  }, [getCurrentWallet()?.wallet?.isSignedIn()]);

  return actions;
}
export default function RecentActivityPage() {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const { wallet } = getCurrentWallet();
  const history = useHistory();

  const senderLoginRes = getSenderLoginRes();
  // todo
  // if (!isSignedIn) {
  //   history.push('/');
  //   return null;
  // }

  const actions = useLastActions();
  const ref = useRef<ActionSheetRef>();
  const [detail, setDetail] = useState<ActionData | null>(null);
  if (!actions) return <Loading />;
  return (
    <div className="flex justify-center relative xs:w-11/12 md:w-11/12 lg:w-1/3 m-auto xs:mt-0 md:mt-0 lg:mt-16">
      <Card className="w-full px-0 py-6">
        <div
          className="flex items-center justify-between pb-4 px-6"
          style={{ borderBottom: '1px solid rgba(126, 138, 147, 0.3)' }}
        >
          <div className="font-semibold text-white text-2xl">
            <FormattedMessage
              id="recent_one_mounth_activity"
              // defaultMessage="Recent Activity"
            />
          </div>
          <div></div>
        </div>
        <div className="border-b border-gray-500 border-opacity-30">
          {actions.map((action, i) => {
            let icon = mapToView(action.data?.Action);
            icon = icon ? (
              <div className="mr-4">{icon}</div>
            ) : (
              <div className="rounded-full h-4 w-4 bg-gray-300 mr-3"></div>
            );
            return (
              <div
                key={i}
                className="flex items-center justify-between py-4 px-6 cursor-pointer hover:bg-chartBg hover:bg-opacity-20"
                style={{ borderBottom: '1px solid rgba(126, 138, 147, 0.3)' }}
                onClick={() => {
                  setDetail(action);
                  ref?.current?.open();
                }}
              >
                <div className="flex items-center justify-between">
                  {icon}
                  <span className="text-xs font-semibold text-white">
                    {action.data?.Action}
                  </span>
                </div>
                <div className="text-gray-400 text-xs">
                  {moment(action.datetime).fromNow(true)} ago
                </div>
              </div>
            );
          })}
        </div>
        <div className=" text-center pt-4">
          <div
            className="h-8 w-36 text-center inline-block rounded border-gradientFrom border py-2 text-xs text-gradientFrom font-semibold cursor-pointer"
            onClick={() => {
              const url =
                config.explorerUrl +
                '/address/' +
                getCurrentWallet()?.wallet?.getAccountId();
              openUrl(url);
            }}
          >
            <FormattedMessage id="view_all" defaultMessage="View All" />
          </div>
        </div>
        {isMobile() ? (
          <ActionSheet ref={ref}>
            {detail ? (
              <div className="text-black px-4 py-6 pb-10">
                <div className="text-center pb-6 font-semibold">
                  {detail.data.Action}
                </div>
                <div className="border-b">
                  {Object.keys(detail.data).map((k, i) => {
                    if (k === 'Action') return null;
                    const value = String((detail.data as any)[k]) || '';
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between  py-3 text-sm"
                      >
                        <div>{k}</div>
                        <div title={value}>{`${value.substring(0, 25)}${
                          value.length > 25 ? '...' : ''
                        }`}</div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between py-3 text-sm">
                    <div>Status</div>
                    <div>{detail.status ? 'Success' : 'Failed'}</div>
                  </div>
                </div>
                <div className="pt-2">
                  <GrayButton className="text-white text-xs w-full justify-center py-2 mt-4">
                    <div
                      onClick={() => {
                        openUrl(detail.txUrl);
                      }}
                    >
                      View on Explorer
                    </div>
                  </GrayButton>
                </div>
              </div>
            ) : null}
          </ActionSheet>
        ) : (
          <Modal
            isOpen={!!detail}
            onRequestClose={() => setDetail(null)}
            style={{
              overlay: {
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
              },
              content: {
                outline: 'none',
              },
            }}
          >
            {detail ? (
              <Card
                style={{ width: '30vw', minWidth: '400px' }}
                className="outline-none border border-gradientFrom border-opacity-50"
              >
                <div className="text-white text-center pb-4 font-semibold">
                  {detail.data.Action}
                </div>
                <div className="text-white">
                  {Object.keys(detail.data).map((k, i) => {
                    if (k === 'Action') return null;
                    const value = String((detail.data as any)[k]) || '';
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <div>{k}</div>
                        <div title={value}>{`${value.substring(0, 25)}${
                          value.length > 25 ? '...' : ''
                        }`}</div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between py-3 text-sm">
                    <div>Status</div>
                    <div>{detail.status ? 'Success' : 'Failed'}</div>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <GradientButton className="inline-block w-36 text-white text-xs py-2 mt-4">
                    <div
                      onClick={() => {
                        openUrl(detail.txUrl);
                      }}
                    >
                      View on Explorer
                    </div>
                  </GradientButton>
                </div>
              </Card>
            ) : null}
          </Modal>
        )}
      </Card>
    </div>
  );
}
