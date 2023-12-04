import React from 'react';

import { useIntl } from 'react-intl';
import QuestionMark from '../../components/farm/QuestionMark';

import { VETip } from '../icon/Referendum';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

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
  className = '',
  maxWidth = '200px',
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
  className?: string;
  maxWidth?: string;
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
      style="max-width: ${maxWidth}; ">${tip}</div>`;
    return result;
  };
  const dataPlaceAttribute = dataPlace ? { 'data-place': dataPlace } : {};
  return (
    <>
      <div
        className={`text-white text-base ${className}`}
        {...dataPlaceAttribute}
        data-tooltip-id={uniquenessId || 'auto_router'}
        data-class="reactTip"
        data-tooltip-html={getValue()}
        data-multiline={true}
        style={style}
      >
        <span className={`${opacity || ''} cursor-pointer`}>
          <QuestionMark
            colorhex={colorhex}
            color={color}
            className={'cursor-pointer'}
          />
        </span>
      </div>
      <CustomTooltip id={uniquenessId || 'auto_router'} />
    </>
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
      data-tooltip-id={uniquenessId || 'exclaimaton_tip' + 'id'}
      data-class="reactTip"
      data-tooltip-html={getValue()}
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
      <CustomTooltip
        id={uniquenessId || 'exclaimaton_tip' + 'id'}
        // @ts-ignore
        place={dataPlace || 'bottom'}
      />
    </div>
  );
}
