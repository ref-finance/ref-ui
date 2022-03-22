import React from 'react';

import { useIntl } from 'react-intl';
import QuestionMark from '../../components/farm/QuestionMark';

import ReactTooltip from 'react-tooltip';

export function QuestionTip({
  id,
  color,
  width,
  defaultMessage,
  dataPlace,
}: {
  id: string;
  color?: 'bright' | 'dark';
  width?: string;
  defaultMessage?: string;
  dataPlace?: string;
}) {
  const intl = useIntl();

  const getValue = () => {
    const tip = intl.formatMessage({
      id,
      defaultMessage,
    });
    let result: string = `<div class="text-navHighLightText text-xs text-left ${
      width ? width : ''
    }">${tip}</div>`;
    return result;
  };

  return (
    <div
      className="pl-1 text-white text-base"
      data-place={dataPlace ? dataPlace : 'right'}
      data-for="auto_router"
      data-class="reactTip"
      data-html={true}
      data-tip={getValue()}
    >
      <QuestionMark color={color} />
      <ReactTooltip
        id="auto_router"
        backgroundColor="#1D2932"
        border
        borderColor="#7e8a93"
        effect="solid"
        textColor="#C6D1DA"
      />
    </div>
  );
}
