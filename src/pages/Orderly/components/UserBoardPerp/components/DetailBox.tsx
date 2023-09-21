import React from 'react';
import {
  IoIosArrowDown,
  IoIosArrowUp,
  MdArrowDropDown,
  MdArrowDropUp,
} from '../../../../../components/reactIcons';
export function DetailBox({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <button
      onClick={() => {
        setShow((show) => !show);
      }}
      className="px-1 py-1 rounded  text-primaryText  bg-primaryText bg-opacity-20"
      style={{
        height: '22px',
        width: '22px',
      }}
    >
      {!show && (
        <MdArrowDropDown
          size={24}
          style={{
            position: 'relative',
            right: '5px',
            top: '-4px',
          }}
        ></MdArrowDropDown>
      )}

      {show && (
        <MdArrowDropUp
          size={24}
          style={{
            position: 'relative',
            right: '5px',
            top: '-4px',
          }}
        ></MdArrowDropUp>
      )}
    </button>
  );
}

export function DetailBoxMobile({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <button
      onClick={() => {
        setShow((show) => !show);
      }}
      className="px-1 py-1 rounded  text-white "
      style={{
        height: '22px',
        width: '22px',
      }}
    >
      {!show && (
        <IoIosArrowDown
          size={18}
          style={{
            position: 'relative',
            right: '5px',
            top: '-4px',
          }}
        ></IoIosArrowDown>
        // IoIosArrowDown
      )}

      {show && (
        <IoIosArrowUp
          size={18}
          style={{
            position: 'relative',
            right: '5px',
            top: '-4px',
          }}
        ></IoIosArrowUp>
      )}
    </button>
  );
}
