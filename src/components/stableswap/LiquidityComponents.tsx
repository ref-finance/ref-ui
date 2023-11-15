import React, { useRef } from 'react';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { UnCheckedRadio, CheckedRadio, Radio } from '../../components/icon';
import QuestionMark from '../../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

// stable swap exchange rate
export function ChooseAddType({
  addType,
  setAddType,
}: {
  addType: string;
  setAddType: (e: any) => void;
}) {
  return (
    <div className="pt-2 text-primaryText text-xs flex flex-col px-8">
      <div className="inline-flex items-center my-1 ">
        <Radio
          checked={addType === 'addAll'}
          value="addAll"
          handleSelect={setAddType}
          size="3"
          checkOut
        />
        <div
          className="ml-2 cursor-pointer"
          onClick={() => {
            addType !== 'addAll' && setAddType('addAll');
            addType === 'addAll' && setAddType('');
          }}
        >
          <FormattedMessage
            id="add_type_all"
            defaultMessage="Add all tokens in a balanced proportion"
          />
        </div>
      </div>
      <div className="inline-flex items-center my-1">
        <Radio
          checked={addType === 'addMax'}
          value="addMax"
          handleSelect={setAddType}
          size="3"
          checkOut
        />
        <div
          className="ml-2 cursor-pointer"
          onClick={() => {
            addType !== 'addMax' && setAddType('addMax');
            addType === 'addMax' && setAddType('');
          }}
        >
          <FormattedMessage
            id="add_type_max"
            defaultMessage="Use maximum amount of tokens availabe"
          />
        </div>
      </div>
    </div>
  );
}

export function InfoLine({
  title,
  value,
  className,
  tipShow,
  tipContent,
  valueTitle,
}: {
  title: string;
  value: string | JSX.Element;
  className?: string;
  tipShow?: boolean;
  tipContent?: string;
  valueTitle?: string;
}) {
  return (
    <div
      className={`flex items-center w-full text-xs text-primaryText my-2 ${className}`}
    >
      <div className="flex items-center">
        {title}
        {tipShow ? (
          <div
            className="ml-1 text-xs"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class="reactTip"
            data-tooltip-html={tipContent}
            data-tooltip-id="tipId"
          >
            <QuestionMark />
            <CustomTooltip className="w-20" id="tipId" />
          </div>
        ) : null}
      </div>
      <div className="border-b border-dotted border-primaryText border-opacity-30 w-full flex-1 mx-1" />
      <div className="text-white" title={valueTitle}>
        {value}
      </div>
    </div>
  );
}
