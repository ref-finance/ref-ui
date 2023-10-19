import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ArrowDown } from 'src/components/icon';

export default function SelectUi(props: any) {
  const { id, onChange, list, className, shrink, Icon } = props;
  const [showSelectBox, setShowSelectBox] = useState(false);
  const boxList = useRef(null);
  const [domWidth, setDomWidth] = useState(0);
  const switchSelectBoxStatus = () => {
    setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  useEffect(() => {
    setDomWidth(Math.max(boxList.current.clientWidth, 135));
  });
  return (
    <div className="flex items-center">
      {Icon ? (
        <Icon
          className={`mr-1.5 ${
            showSelectBox ? 'text-greenColor' : 'text-farmText'
          }`}
        />
      ) : null}
      <div
        className={
          `relative flex flex-col ${shrink ? 'items-end' : 'items-center'} ` +
          className
        }
      >
        <span
          onClick={switchSelectBoxStatus}
          tabIndex={-1}
          onBlur={hideSelectBox}
          style={{ width: domWidth ? domWidth + 'px' : '' }}
          className={`flex items-center justify-between w-full h-5 rounded-full px-2 box-border border cursor-pointer text-xs outline-none ${
            shrink
              ? 'xs:w-8 md:w-8 xs:px-0 md:px-0 xs:justify-center md:justify-center'
              : ''
          } ${
            showSelectBox
              ? 'border-greenColor text-white'
              : 'border-farmText text-farmText'
          }`}
        >
          <label
            className={`whitespace-nowrap ${
              shrink ? 'xs:hidden md:hidden' : ''
            }`}
          >
            {list[id]}
          </label>
          <ArrowDown></ArrowDown>
        </span>
        <div
          ref={boxList}
          className={`absolute z-50 top-8 xs:right-0 md:right-0 border border-farmText bg-cardBg rounded-md ${
            shrink ? 'w-32' : 'w-auto'
          } ${showSelectBox ? '' : 'invisible'}`}
          style={{
            minWidth: '135px',
          }}
        >
          {Object.entries(list).map((item: any, index) => (
            <p
              key={item[0] + item[1]}
              onMouseDown={() => {
                onChange(item);
              }}
              className={`flex items-center whitespace-nowrap p-4 text-xs h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-white hover:bg-opacity-10 hover:text-opacity-100 ${
                item[0] == id ? 'bg-white bg-opacity-10 text-opacity-100' : ''
              }`}
            >
              {item[1]}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
