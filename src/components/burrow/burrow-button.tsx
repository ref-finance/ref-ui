import React from 'react';
export function GradientButton(props: any) {
  const { disabled, onClick, full, customWidth } = props;
  return (
    <div
      className={`${
        full
          ? 'h-11 w-full text-base gotham_bold'
          : `h-8 text-sm ${customWidth ? customWidth : 'w-max'}`
      } px-3  rounded-md  text-white ${
        disabled ? 'opacity-40' : ''
      } bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {props.children}
      </button>
    </div>
  );
}
export function GradientLineButton(props: any) {
  const { disabled, onClick, customWidth } = props;
  return (
    <div
      className={`h-8 px-3 ${
        customWidth ? customWidth : 'w-max'
      } rounded-md text-sm text-greenColor  ${
        disabled ? 'opacity-40' : ''
      } border border-greenColor`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {props.children}
      </button>
    </div>
  );
}
export function PurpleLineButton(props: any) {
  const { disabled, onClick, customWidth } = props;
  return (
    <div
      className={`h-8 px-3 ${
        customWidth ? customWidth : 'w-max'
      } rounded-md text-sm text-burrowPurpleColor  ${
        disabled ? 'opacity-40' : ''
      } border border-burrowPurpleColor`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {props.children}
      </button>
    </div>
  );
}
export function PurpleButton(props: any) {
  const { disabled, onClick, full, customWidth } = props;
  return (
    <div
      className={`${
        full
          ? 'h-11 w-full text-base gotham_bold'
          : `h-8 ${customWidth ? customWidth : 'w-max'} text-sm`
      } px-3 rounded-md text-white bg-purpleBgColor  ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {props.children}
      </button>
    </div>
  );
}
