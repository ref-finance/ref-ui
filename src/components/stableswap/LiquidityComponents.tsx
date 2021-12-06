import React, { useRef } from 'react';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '~services/ft-contract';
import { UnCheckedRadio, CheckedRadio, Radio } from '~components/icon';

// stable swap exchange rate
export function ChooseAddType({
  addType,
  setAddType,
}: {
  addType: string;
  setAddType: (e: any) => void;
}) {
  return (
    <div className="pt-2">
      <div className="flex items-center my-2">
        <Radio
          checked={addType === 'addAll'}
          value="addAll"
          handleSelect={setAddType}
          size="3"
        />
        <label className="ml-2">
          <FormattedMessage
            id="add_type_all"
            defaultMessage="Add all coins in a balanced proportion"
          />
        </label>
      </div>
      <div className="flex items-center my-2">
        <Radio
          checked={addType === 'addMax'}
          value="addMax"
          handleSelect={setAddType}
          size="3"
        />
        <label className="ml-2">
          <FormattedMessage
            id="add_type_max"
            defaultMessage="Use maximum amount of coins availabe"
          />
        </label>
      </div>
    </div>
  );
}

export function InfoLine({
  title,
  value,
  className,
}: {
  title: string;
  value: string | JSX.Element;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center w-full text-xs text-primaryText my-2 ${className}`}
    >
      <div className="">{title}</div>
      <div className="border-b border-dotted border-primaryText border-opacity-30 w-full flex-1 mx-1" />
      <div className="text-white">{value}</div>
    </div>
  );
}
