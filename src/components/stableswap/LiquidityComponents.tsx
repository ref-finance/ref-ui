import React, { useRef } from 'react';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '~services/ft-contract';

// stable swap exchange rate
export function ChooseAddType({
  addType,
  setAddType,
}: {
  addType: string;
  setAddType: (e: any) => void;
}) {
  return (
    <div className=" py-3">
      <div className="flex items-center">
        <input
          className=" w-6"
          type="radio"
          checked={addType === 'addAll'}
          id="addType"
          name="from"
          value="addAll"
          onChange={(e) => {
            setAddType(e.target.value);
          }}
        />
        <label>
          <FormattedMessage
            id="add_type_all"
            defaultMessage="Add all coins in a balanced proportion"
          />
        </label>
      </div>
      <div className="flex items-center">
        <input
          className=" w-6"
          type="radio"
          checked={addType === 'addMax'}
          id="addType"
          name="from"
          value="addMax"
          onChange={(e) => {
            setAddType(e.target.value);
          }}
        />
        <label>
          <FormattedMessage
            id="add_type_max"
            defaultMessage="Use maximum amount of coins availabe"
          />
        </label>
      </div>
    </div>
  );
}
