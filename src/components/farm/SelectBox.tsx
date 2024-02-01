import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { DownArrowIcon, GreenCorrectIcon } from '../icon/FarmBoost';
import { isMobile } from '../../utils/device';
import { FormattedMessage, useIntl } from 'react-intl';

export default function SelectBox(props: any) {
  const {
    list,
    width,
    containerClass,
    type,
    selectedId,
    setSelectedId,
    disabled,
  } = props;
  const [show, setShow] = useState(false);
  function switchOption(id: string) {
    setSelectedId(id);
    setShow(false);
  }
  function display_selected_option() {
    const target = list.find((item: any) => {
      return item.id == selectedId;
    });
    const { icon, label, name } = target;
    return (
      <>
        {icon ? <span className="mr-2">{icon}</span> : null}
        {name || <FormattedMessage id={label} />}
      </>
    );
  }
  const selectList =
    list?.filter((item: any) => {
      return !item.hidden;
    }) || [];
  const is_mobile = isMobile();
  return (
    <div
      className={`relative z-20 flex items-center ${
        containerClass ? containerClass : ''
      }`}
      tabIndex={Math.random()}
      onMouseEnter={() => {
        if (is_mobile) return;
        if (!disabled) {
          setShow(true);
        }
      }}
      onMouseLeave={() => {
        if (is_mobile) return;
        setShow(false);
      }}
      onClick={() => {
        if (!is_mobile || disabled) return;
        setShow(!show);
      }}
      onBlur={() => {
        if (!is_mobile) return;
        setShow(false);
      }}
    >
      <div className="pb-2">
        <div
          className={`flex items-center justify-between  h-10 rounded-lg px-3 xsm:px-2  ${
            width ? width : 'w-44'
          } ${show ? 'bg-farmSelectHoverBgColor' : 'bg-farmSelectBgColor'} ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-sm whitespace-nowrap ${
                show ? 'text-white' : 'text-primaryText'
              }`}
            >
              <FormattedMessage id={type} />:{' '}
            </span>
            <div
              className={`flex items-center text-sm gotham_bold ml-1.5 whitespace-nowrap ${
                disabled ? 'text-primaryText' : 'text-white'
              }`}
            >
              {display_selected_option()}
            </div>
          </div>
          <DownArrowIcon
            className={`flex-shrink-0 ${
              show ? 'transform rotate-180 text-white' : 'text-primaryText'
            }`}
          ></DownArrowIcon>
        </div>
      </div>
      {show ? (
        <div className="rounded-lg bg-farmSelectBoxBgColor border border-menuMoreBoxBorderColor absolute top-11 px-1.5 py-2 w-full">
          {selectList.map((item: any) => {
            const { id, label, name, icon } = item;
            return (
              <div
                onClick={() => {
                  switchOption(id);
                }}
                key={id}
                className={`flex items-center justify-between rounded-md h-8 pl-3 pr-1 my-2 cursor-pointer hover:bg-dclSelectTokenHover`}
              >
                <div className="flex items-center">
                  {icon ? (
                    <span className="flex items-center justify-center w-4 mr-2">
                      {icon}
                    </span>
                  ) : null}
                  <span className="text-sm text-white">
                    {name || <FormattedMessage id={label} />}
                  </span>
                </div>
                <GreenCorrectIcon
                  className={`${id == selectedId ? '' : 'hidden'}`}
                ></GreenCorrectIcon>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
