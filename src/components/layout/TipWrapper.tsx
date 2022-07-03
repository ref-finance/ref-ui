import React from 'react';

import { useIntl } from 'react-intl';
import QuestionMark from '../../components/farm/QuestionMark';

import ReactTooltip from 'react-tooltip';
import { VETip } from '../icon/Referendum';

export function QuestionTip({
  id,
  color,
  width,
  defaultMessage,
  dataPlace,
  uniquenessId,
  colorHex,
}: {
  id: string;
  color?: 'bright' | 'dark';
  width?: string;
  defaultMessage?: string;
  dataPlace?: string;
  uniquenessId?: string;
  colorHex?: string;
}) {
  const intl = useIntl();

  const getValue = () => {
    const tip = intl.formatMessage({
      id,
      defaultMessage,
    });
    let result: string = `<div class="text-navHighLightText whitespace-normal text-xs text-left ${
      width ? width : ''
    }"
      style="max-width: 200px; ">${tip}</div>`;
    return result;
  };
  const dataPlaceAttribute = dataPlace ? { 'data-place': dataPlace } : {};
  return (
    <div
      className="pl-1 text-white text-base"
      {...dataPlaceAttribute}
      data-for={uniquenessId || 'auto_router'}
      data-class="reactTip"
      data-html={true}
      data-tip={getValue()}
      data-multiline={true}
    >
      <QuestionMark colorHex={colorHex} />
      <ReactTooltip
        id={uniquenessId || 'auto_router'}
        backgroundColor="#1D2932"
        border
        borderColor="#7e8a93"
        effect="solid"
        textColor="#C6D1DA"
      />
    </div>
  );
}

export function ExclamationTip({
  id,
  color,
  width,
  defaultMessage,
  dataPlace,
  uniquenessId,
  colorHex,
  className,
}: {
  id: string;
  color?: 'bright' | 'dark';
  width?: string;
  defaultMessage?: string;
  dataPlace?: string;
  uniquenessId?: string;
  colorHex?: string;
  className?: string;
}) {
  const intl = useIntl();

  const getValue = () => {
    const tip = intl.formatMessage({
      id,
      defaultMessage,
    });
    let result: string = `<div class="text-navHighLightText whitespace-normal text-xs text-left ${
      width ? width : ''
    }"
      style="max-width: 200px; ">${tip}</div>`;
    return result;
  };

  return (
    <div
      className={`${className} pl-1 text-white text-base`}
      data-for={uniquenessId || 'auto_router'}
      data-class="reactTip"
      data-html={true}
      data-tip={getValue()}
      data-multiline={true}
    >
      <div
        style={{
          color: colorHex,
        }}
      >
        <VETip />
      </div>
      <ReactTooltip
        id={uniquenessId || 'auto_router'}
        backgroundColor="#1D2932"
        border
        place={'bottom'}
        borderColor="#7e8a93"
        effect="solid"
        textColor="#C6D1DA"
      />
    </div>
  );
}
