import React from 'react';
import { FormattedMessage } from 'react-intl';
import type { HardwareWalletAccountState } from './DerivationPath';
import { LedgerCheckbox } from '../../../components/icon/CheckBox';

interface FormProps {
  accounts: Array<HardwareWalletAccountState>;
  onSelectedChanged: (index: number, selected: boolean) => void;
  onSubmit: (
    accounts: Array<HardwareWalletAccountState>,
    e: React.FormEvent<HTMLFormElement>
  ) => void;
}

const HardwareWalletAccountsForm: React.FC<FormProps> = ({
  accounts,
  onSelectedChanged,
  onSubmit,
}) => {
  return (
    <div className="choose-ledger-account-form-wrapper w-full">
      <p className="text-sm text-center">
        <FormattedMessage id="we_found" defaultMessage={'We found'} />
        <span className="px-1">{accounts.length}</span>
        <FormattedMessage id="accounts_on_your_device" />.{' '}
        <FormattedMessage id="select_the_accounts_you_wish_to_connect" />.
      </p>
      <form
        className="form"
        onSubmit={(e) => {
          onSubmit(accounts, e);
        }}
      >
        <div className="">
          <div className="px-8 flex flex-col max-h-60 overflow-auto">
            {accounts.map((account, index) => (
              <div
                key={index}
                className="flex items-center w-full mt-3 relative px-2 py-3 bg-black text-sm bg-opacity-10 rounded-md"
              >
                <label
                  className="w-full overflow-hidden whitespace-nowrap overflow-ellipsis"
                  htmlFor={account.accountId}
                >
                  {' '}
                  {account.accountId}
                </label>

                <LedgerCheckbox
                  checked={account.selected}
                  index={index}
                  setChecked={onSelectedChanged}
                />

                <br />
              </div>
            ))}
          </div>
          <div className="px-8">
            <button
              className="py-1.5 mt-7 w-full flex items-center justify-center text-sm rounded-lg"
              style={{
                // width: '242px',
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                height: '40px',
                marginBottom: '5px',
              }}
              type="submit"
              disabled={!accounts.some((x) => x.selected)}
            >
              <FormattedMessage id="continue" defaultMessage="Continue" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HardwareWalletAccountsForm;
