import React from 'react';
import { useState } from 'react';
import { ArrowDown } from '~components/icon';

export default function SelectUi(props: any) {
  const { id, onChange, list, className, shrink } = props;
  const [showSelectBox, setShowSelectBox] = useState(false);
  const switchSelectBoxStatus = () => {
    setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  return (
    <div
      className={
        `relative flex flex-col ${
          shrink ? 'items-end' : 'items-center w-32'
        } ` + className
      }
    >
      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={`flex items-center justify-between w-full h-5 rounded-full px-3 box-border border cursor-pointer text-xs ${
          shrink ? 'xs:w-8 md:w-8' : ''
        } ${
          showSelectBox
            ? 'border-greenColor text-white'
            : 'border-farmText text-farmText'
        }`}
      >
        <label
          className={`whitespace-nowrap ${shrink ? 'xs:hidden md:hidden' : ''}`}
        >
          {list[id]}
        </label>
        <ArrowDown></ArrowDown>
      </span>
      <div
        className={`absolute z-50 top-8 xs:right-0 md:right-0 border border-farmText bg-cardBg rounded-md ${
          shrink ? 'w-32' : 'w-full'
        } ${showSelectBox ? '' : 'hidden'}`}
      >
        {Object.entries(list).map((item: any, index) => (
          <p
            key={item[0] + item[1]}
            onMouseDown={() => {
              onChange(item);
            }}
            className={`flex items-center p-4 text-xs h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-white hover:bg-opacity-10 hover:text-opacity-100 ${
              item[0] == id ? 'bg-white bg-opacity-10 text-opacity-100' : ''
            }`}
          >
            {item[1]}
          </p>
        ))}
      </div>
    </div>
  );
}
