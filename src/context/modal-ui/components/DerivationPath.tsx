import React, { KeyboardEventHandler, useState } from 'react';
import type {
  HardwareWallet,
  HardwareWalletAccount,
  Wallet,
  WalletSelector,
} from '@near-wallet-selector/core';
import type { ModalOptions } from '../modal.types';
import type { DerivationPathModalRouteParams } from './Modal.types';
import HardwareWalletAccountsForm from './HardwareWalletAccountsForm';
import { WalletConnecting } from './WalletConnecting';
import { GradientWrapper } from './BorderWrapper';
import { FormattedMessage, useIntl } from 'react-intl';
import getConfig from '../../../services/config';
import { walletIcons } from '../../walletIcons';

export const WarningTip = () => {
  return (
    <svg
      width="39"
      height="39"
      viewBox="0 0 39 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5006 36.487C10.1346 36.487 2.51367 28.8673 2.51367 19.5C2.51367 10.1339 10.1345 2.51306 19.5006 2.51306C28.868 2.51306 36.4876 10.1327 36.4876 19.5C36.4876 28.8673 28.868 36.487 19.5006 36.487ZM19.5006 4.95056C11.4776 4.95056 4.95117 11.4769 4.95117 19.5C4.95117 27.5219 11.4776 34.0495 19.5006 34.0495C27.5225 34.0495 34.0501 27.5231 34.0501 19.5C34.0501 11.4769 27.5225 4.95056 19.5006 4.95056Z"
        fill="#F49F50"
      />
      <path
        d="M17.6719 11.5781C17.6719 12.5878 18.4904 13.4063 19.5 13.4063C20.5097 13.4063 21.3282 12.5878 21.3282 11.5781C21.3282 10.5685 20.5097 9.75 19.5 9.75C18.4904 9.75 17.6719 10.5685 17.6719 11.5781Z"
        fill="#F49F50"
      />
      <path
        d="M19.5 29.25C18.8273 29.25 18.2812 28.7052 18.2812 28.0312V17.0625C18.2812 16.3897 18.8273 15.8437 19.5 15.8437C20.1728 15.8437 20.7188 16.3897 20.7188 17.0625V28.0312C20.7188 28.7052 20.1728 29.25 19.5 29.25Z"
        fill="#F49F50"
      />
    </svg>
  );
};
export type HardwareRoutes =
  | 'EnterDerivationPath'
  | 'ChooseAccount'
  | 'AddCustomAccountId'
  | 'OverviewAccounts'
  | 'ErrorRoute';
interface DerivationPathProps {
  selector: WalletSelector;
  options: ModalOptions;
  onBack: () => void;
  onConnected: () => void;
  params: DerivationPathModalRouteParams;
  onError: (message: string) => void;
  initError?: string | JSX.Element;
}

export type HardwareWalletAccountState = HardwareWalletAccount & {
  selected: boolean;
};

export const DEFAULT_DERIVATION_PATH = "44'/397'/0'/0'/1'";

export const BASE_DERIVATION_PATH = "44'/397'/0'/0'/";

export const DerivationPath: React.FC<DerivationPathProps> = ({
  selector,
  options,
  onBack,
  onConnected,
  params,
  onError,
  initError,
}) => {
  const [route, setRoute] = useState<HardwareRoutes>(
    !!initError ? 'ErrorRoute' : 'EnterDerivationPath'
  );
  const [derivationPath, setDerivationPath] = useState(DEFAULT_DERIVATION_PATH);

  const [error, setError] = useState<string | JSX.Element>(initError);

  const [derivationPathLastCode, setDerivationPathLastCode] = useState('1');

  const [accounts, setAccounts] = useState<Array<HardwareWalletAccountState>>(
    []
  );
  const [hardwareWallet, setHardwareWallet] = useState<Wallet>();
  const [customAccountId, setCustomAccountId] = useState('');
  const [connecting, setConnecting] = useState(false);

  const intl = useIntl();

  const getAccountIds = async (publicKey: string): Promise<Array<string>> => {
    const response = await fetch(
      `${selector.options.network.indexerUrl}/publicKey/ed25519:${publicKey}/accounts`
    );

    if (!response.ok) {
      throw new Error('Failed to get account id from public key');
    }

    const accountIds = await response.json();

    if (!Array.isArray(accountIds) || !accountIds.length) {
      return [];
    }
    // return [];

    if (
      typeof getConfig().kitWalletOn === 'boolean' &&
      !getConfig().kitWalletOn
    ) {
      throw new Error();
    } else {
      return accountIds;
    }
  };

  const resolveAccounts = async (
    wallet: Wallet
  ): Promise<Array<HardwareWalletAccountState> | null> => {
    const publicKey = await (wallet as HardwareWallet).getPublicKey(
      derivationPath
    );
    try {
      const accountIds = await getAccountIds(publicKey);

      return accountIds.map((accountId, index) => {
        return {
          derivationPath,
          publicKey,
          accountId,
          selected: index === 0,
        };
      });
    } catch (e) {
      return null;
    }
  };

  const handleValidateAccount = async () => {
    const wallet = await selector.wallet(params.walletId);

    if (wallet.type !== 'hardware') {
      return;
    }

    setConnecting(true);
    setHardwareWallet(wallet);

    try {
      const resolvedAccounts = await resolveAccounts(wallet);
      if (!resolvedAccounts) {
        setRoute('AddCustomAccountId');
        return;
      }
      const noAccounts = resolvedAccounts.length === 0;
      const multipleAccounts = resolvedAccounts.length > 1;

      if (noAccounts) {
        setError(
          <span>
            <FormattedMessage id="can_not_find_any_accounts" />{' '}
            <a
              href={`https://${
                selector.options.network.networkId === 'testnet'
                  ? 'testnet'
                  : 'app'
              }.mynearwallet.com/create`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              style={{
                color: 'rgba(0, 148, 255, 1)',
              }}
            >
              MyNearWallet
            </a>{' '}
            <FormattedMessage id="or_connect_another_ledger" />.
          </span>
        );
        setRoute('ErrorRoute');
        return;
      }
      setAccounts(resolvedAccounts);

      if (!multipleAccounts) {
        setRoute('OverviewAccounts');
      } else {
        setRoute('ChooseAccount');
      }
    } catch (err) {
      setConnecting(false);
      const message =
        err instanceof Error ? err.message : 'Something went wrong';

      if (/Ledger device:/.test(message)) {
        const content = message.split(':')[1];

        setError(
          <span>
            Ledger device:
            <span className="text-warn ml-0.5">{content}</span>
          </span>
        );
      } else {
        setError(message);
      }

      // setError(message);
      setRoute('ErrorRoute');
    } finally {
      setConnecting(false);
    }
  };

  const handleAddCustomAccountId = async () => {
    try {
      setConnecting(true);

      const publicKey = await (hardwareWallet as HardwareWallet).getPublicKey(
        derivationPath
      );
      setAccounts([
        {
          derivationPath: derivationPath,
          publicKey,
          accountId: customAccountId,
          selected: true,
        },
      ]);
      setRoute('OverviewAccounts');
    } catch (err) {
      setConnecting(false);
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setRoute('ErrorRoute');
    } finally {
      setConnecting(false);
    }
  };

  const handleSignIn = async () => {
    const mapAccounts = accounts.map((account: HardwareWalletAccount) => {
      return {
        derivationPath: account.derivationPath,
        publicKey: account.publicKey,
        accountId: account.accountId,
      };
    });

    return hardwareWallet!
      .signIn({
        contractId: options.contractId,
        methodNames: options.methodNames,
        accounts: mapAccounts,
      })
      .then(() => onConnected())
      .catch((err) => {
        setError(`Error: ${err.message}`);
        setRoute('ErrorRoute');
      });
  };

  const handleEnterClick: KeyboardEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (e.key === 'Enter') {
      await handleValidateAccount();
    }
  };

  if (connecting) {
    return (
      <div className="derivation-path-wrapper">
        <WalletConnecting
          wallet={hardwareWallet}
          onBack={() => {
            setConnecting(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="derivation-path-wrapper px-3">
      {route !== 'ErrorRoute' && (
        <>
          <div className="flex items-centerk justify-center mb-7">
            <img src={walletIcons['ledger']} alt="" className="w-12" />
          </div>
          <div className="pb-4 text-xl">Ledger</div>
        </>
      )}

      {route === 'EnterDerivationPath' && (
        <div className="enter-derivation-path">
          <div>
            <p className="text-center mb-7">
              <FormattedMessage
                id="make_sure_device_plugged_in"
                defaultMessage={'Make sure your device is plugged in'}
              />
              ,{' '}
              <FormattedMessage
                id="then_enter_a_derivation_path_to_connect"
                defaultMessage={'then enter a derivation path to connect'}
              />
              .
            </p>
            <div className="bg-black bg-opacity-20 rounded-md flex items-center justify-center mx-10">
              <span className="text-primaryText">{BASE_DERIVATION_PATH}</span>
              <input
                className="pl-1 py-2 text-white   rounded-full "
                type="text"
                // placeholder="Derivation Path"
                value={derivationPathLastCode}
                onChange={(e) => {
                  setDerivationPathLastCode(e.target.value);
                  setDerivationPath(
                    BASE_DERIVATION_PATH + e.target.value + "'"
                  );
                }}
                style={{
                  minWidth: '14px',
                  width: `${derivationPathLastCode.length * 12}px`,
                }}
                onKeyPress={handleEnterClick}
              />
              <span className="text-primaryText">'</span>
            </div>
          </div>
          <div className="px-10">
            <button
              className="py-1.5 mt-7 w-full flex items-center justify-center text-sm rounded-lg"
              style={{
                // width: '242px',
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                height: '40px',
                marginBottom: '5px',
              }}
              onClick={handleValidateAccount}
            >
              <FormattedMessage id="continue" defaultMessage="Continue" />
            </button>
          </div>
        </div>
      )}

      {route === 'ChooseAccount' && (
        <HardwareWalletAccountsForm
          accounts={accounts}
          onSelectedChanged={(index, selected) => {
            setAccounts((prevAccounts) => {
              const updateAccounts = prevAccounts.map((account, idx) => {
                const selectedValue = index === idx ? selected : false;
                return {
                  ...account,
                  selected: selectedValue,
                };
              });
              return [...updateAccounts];
            });
          }}
          onSubmit={(acc, e) => {
            e.preventDefault();
            setAccounts((prevAccounts) => {
              const selectedAccounts = prevAccounts.filter(
                (account) => account.selected
              );

              return [...selectedAccounts];
            });
            setRoute('OverviewAccounts');
          }}
        />
      )}
      {route === 'AddCustomAccountId' && (
        <div className="enter-custom-account">
          <p className="text-center text-sm px-10">
            <FormattedMessage id="account_identification_failed" />
          </p>
          <div className=" mt-4 mb-2 mx-10 py-2 text-sm rounded-md text-white bg-black bg-opacity-20">
            {/* <GradientWrapper className="rounded-full mr-2"> */}
            <input
              type="text"
              placeholder={intl.formatMessage({ id: 'input_account_id' })}
              // placeholder={'input account ID'}
              value={customAccountId}
              onChange={(e) => {
                setCustomAccountId(e.target.value);
              }}
              style={{
                // backgroundColor: '#202834',
                width: '100%',
                textAlign: 'center',
                fontSize: '16px',
              }}
            />
            {/* </GradientWrapper> */}
          </div>
          <div className="px-10 w-full">
            <button
              className="py-1.5 mt-7 w-full flex items-center justify-center text-sm rounded-lg"
              style={{
                // width: '242px',
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                height: '40px',
                marginBottom: '5px',
              }}
              disabled={!customAccountId}
              onClick={handleAddCustomAccountId}
            >
              <FormattedMessage id="continue" defaultMessage="Continue" />
            </button>
          </div>
        </div>
      )}
      {route === 'OverviewAccounts' && (
        <div className="w-full">
          {accounts.map((account, index) => (
            <div
              key={account.accountId}
              className="pt-10 text-center text-base font-bold"
            >
              <div className="account w-full overflow-hidden whitespace-nowrap overflow-ellipsis px-6">
                <span>{account.accountId}</span>
              </div>
            </div>
          ))}

          <div className="px-5 w-full">
            <button
              className="py-1.5 mt-7 w-full flex items-center justify-center text-sm rounded-lg"
              style={{
                // width: '242px',
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                height: '40px',
                marginBottom: '5px',
              }}
              onClick={handleSignIn}
              disabled={accounts.length === 0}
            >
              <FormattedMessage id="connect" defaultMessage="Connect" />
            </button>
          </div>
        </div>
      )}
      {route === 'ErrorRoute' && (
        <div className="flex flex-col items-center text-white">
          <div className="pb-6">
            <WarningTip />
          </div>
          <div className="text-center text-sm">{error}</div>
          <button
            className=" pt-8 text-xs font-bold"
            onClick={() => {
              if (!!initError) {
                onBack();
              } else {
                setRoute('EnterDerivationPath');
              }
            }}
          >
            <FormattedMessage id="go_back" defaultMessage={'Go back'} />
          </button>
        </div>
      )}
    </div>
  );
};
