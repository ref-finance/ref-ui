import React from 'react';
import { ModuleState } from '@near-wallet-selector/core';
import { FormattedMessage } from 'react-intl';
import { WalletSelectorFooter } from './WalletOptions/WalletOptions';
import { openUrl } from '../../../services/commonV3';

interface WalletNotInstalledProps {
  module: ModuleState & {
    metadata: {
      downloadUrl?: string;
    };
  };
}

const getDownloadUrl = (
  module: ModuleState & {
    metadata: {
      downloadUrl?: string;
    };
  }
) =>
  module.id === 'sender'
    ? 'https://sender.org/?origin=ref'
    : module.metadata.downloadUrl;

export const WalletNotInstalled: React.FC<WalletNotInstalledProps> = ({
  module,
}) => {
  return (
    <div className="wallet-not-installed-wrapper">
      <div className="wallet-data">
        <div className={`wallet-icon-box ${module.id}`}>
          <img src={module.metadata.iconUrl} alt={module.metadata.name} />
        </div>
      </div>

      <div className="mx-auto text-lg">
        <span>
          <FormattedMessage id="install" defaultMessage={'Install'} />{' '}
          {module.metadata.name}{' '}
          <FormattedMessage id="now_wallet_selector" defaultMessage={'Now'} />
        </span>
      </div>

      <div className="mx-auto text-xs pt-10 pb-4">
        <span>
          <FormattedMessage
            id="connect_to_dapps_with_one_click"
            defaultMessage="Connect to dApps with one click"
          />
        </span>
      </div>

      <button
        className="py-1.5 flex items-center justify-center mx-auto text-xs rounded-lg"
        style={{
          width: '242px',
          background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
          height: '40px',
          marginBottom: '5px',
        }}
        onClick={() => {
          openUrl(getDownloadUrl(module));
        }}
      >
        <span>
          <FormattedMessage id="install" defaultMessage="Install" />
        </span>
      </button>

      <WalletSelectorFooter></WalletSelectorFooter>

      {/* <div className="action-buttons">
        <button className="left-button" onClick={onBack}>
          Back
        </button>
        <button
          className="right-button"
          onClick={() => {
            if (module.type !== 'injected') {
              return;
            }

            openUrl(module.metadata.downloadUrl, '_blank');
          }}
        >
          {`Open ${module.metadata.name}`}
        </button>
      </div> */}
    </div>
  );
};
