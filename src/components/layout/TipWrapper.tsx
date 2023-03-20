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
  colorhex,
  opacity,
  style,
  textC,
}: {
  id: string;
  color?: 'bright' | 'dark';
  width?: string;
  defaultMessage?: string;
  dataPlace?: string;
  uniquenessId?: string;
  colorhex?: string;
  opacity?: string;
  style?: any;
  textC?: string;
}) {
  const intl = useIntl();

  const getValue = () => {
    const tip = intl.formatMessage({
      id,
      defaultMessage,
    });
    let result: string = `<div class="${
      textC || 'text-navHighLightText'
    }   whitespace-normal text-xs text-left ${width ? width : ''}"
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
      style={style}
    >
      <span className={`${opacity}`}>
        <QuestionMark colorhex={colorhex} color={color}></QuestionMark>
      </span>
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
  colorhex,
  className,
}: {
  id: string;
  color?: 'bright' | 'dark';
  width?: string;
  defaultMessage?: string;
  dataPlace?: string;
  uniquenessId?: string;
  colorhex?: string;
  className?: string;
}) {
  const intl = useIntl();

  const getValue = () => {
    const tip = intl.formatMessage({
      id,
      defaultMessage,
    });
    let result: string = `<div class="text-primaryText  border-black border-opacity-20 xsm:w-36 whitespace-normal text-sm text-left ${
      width ? width : ''
    }"
      style="max-width: 200px; ">${tip}</div>`;
    return result;
  };

  const [light, setLight] = React.useState(false);

  return (
    <div
      className={`${className} pl-1 text-white text-base`}
      data-for={uniquenessId || 'exclaimaton_tip' + 'id'}
      data-class="reactTip"
      data-html={true}
      data-tip={getValue()}
      data-multiline={true}
    >
      <div
        style={{
          color: light ? 'white' : colorhex,
        }}
        onMouseOver={() => {
          setLight(true);
        }}
        onMouseLeave={() => {
          setLight(false);
        }}
      >
        <VETip />
      </div>
      <ReactTooltip
        id={uniquenessId || 'exclaimaton_tip' + 'id'}
        backgroundColor="#1D2932"
        border
        place={'right'}
        borderColor="#7e8a93"
        effect="solid"
        textColor="#1D2932"
      />
    </div>
  );
}
