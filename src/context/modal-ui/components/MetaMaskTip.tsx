import React from 'react';
import { Wallet } from '@near-wallet-selector/core';
import { BeatLoader } from 'react-spinners';
import { FormattedMessage } from 'react-intl';
import { GradientWrapper } from './BorderWrapper';
import { useClientMobile } from '../../../utils/device';
import { BeatLoading } from 'respinner';
import { walletIcons } from '../../walletIcons';
import getConfig from '../../../services/config';
import { openUrl } from '../../../services/commonV3';

export const MetaMaskTip = ({ inMeta }: { inMeta?: boolean }) => {
  const clientMobie = useClientMobile();

  return (
    <div
      className="flex flex-col items-center "
      style={{
        minWidth: !clientMobie ? '300px' : '',
      }}
    >
      {!inMeta && (
        <>
          <div className=" rounded-full flex items-center justify-center">
            <div className="rounded-2xl mr-2 w-14  bg-opacity-20 h-14 flex items-center justify-center">
              <img src={walletIcons['neth']} alt="" />
            </div>

            <div className="rounded-2xl w-14 ml-2 h-14 bg-opacity-20 items-center justify-center flex ">
              <img
                // className="rounded-full"
                src={walletIcons['metaMask']}
                alt=""
                style={{
                  width: '32px',
                }}
              />
            </div>
          </div>

          <div className="text-center px-4">
            <FormattedMessage
              id="neth_supports_on_built_in_metamask_app"
              defaultMessage={'NETH supports on MetaMask built-in browser'}
            />
          </div>

          <button
            className="py-1.5 mt-6 flex items-center justify-center mx-auto text-sm rounded-lg"
            style={{
              width: '242px',
              background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
              height: '40px',
              marginBottom: '5px',
            }}
            onClick={() => {
              openUrl(`https://metamask.app.link/dapp/${window.location.host}`);

              return;
            }}
          >
            <span>
              <FormattedMessage
                id="open_on_meta_mask"
                defaultMessage="Open on MetaMask"
              />
            </span>
          </button>
        </>
      )}
      {inMeta && (
        <>
          <div className="mb-5">
            <FormattedMessage
              id="please_follow_steps"
              defaultMessage={'Please follow steps:'}
            />
          </div>

          <div
            className="py-4 w-full  font-bold px-4 rounded-3xl bg-black bg-opacity-20 flex items-center"
            style={{
              width: '105%',
            }}
          >
            <span className="mr-3 text-gradientFrom">
              <FormattedMessage id="Step" defaultMessage={'Step'} />
              1.
            </span>

            <span className="whitespace-nowrap">
              <FormattedMessage
                id="connect_aurora_network"
                defaultMessage={'Connect Aurora network '}
              />
            </span>
          </div>

          <a
            className="text-center ml-8 mt-2 mb-5 text-sm text-blueTip"
            href="https://aurora.dev/start"
            target={'_blank'}
          >
            <FormattedMessage
              id="how_to_add_aurora_chain"
              defaultMessage={'How to add Aurora Chain?'}
            />
          </a>

          <div
            className="py-4 w-full font-bold px-4 rounded-3xl bg-black bg-opacity-20 flex items-center"
            style={{
              width: '105%',
            }}
          >
            <span className="mr-3 text-gradientFrom">
              <FormattedMessage id="Step" defaultMessage={'Step'} />
              2.
            </span>

            <span>
              <FormattedMessage
                id="bind_neth_account"
                defaultMessage={'Bind NETH account '}
              />
            </span>
          </div>

          <div className="text-primaryText mt-2 text-sm flex items-center ">
            <span className="mr-1">
              <FormattedMessage id="bind_one" defaultMessage={'Bind one on'} />
            </span>
            <span>
              <a
                className="text-center text-sm  text-blueTip"
                href={`https://neth.app?networkId=${getConfig().networkId}`}
                target={'_blank'}
              >
                neth.app
              </a>
            </span>
          </div>
        </>
      )}
    </div>
  );
};
