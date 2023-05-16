import React from 'react';
export function GradientButton(props: any) {
  const { disabled, onClick, full } = props;
  return (
    <div
      className={`${
        full ? 'h-11 w-full text-base gotham_bold' : 'h-8 w-max text-sm'
      } px-3  rounded-md  text-white ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover`}
    >
      <button onClick={onClick} disabled={disabled} className={`w-full h-full`}>
        {props.children}
      </button>
    </div>
  );
}
export function GradientLineButton(props: any) {
  const { disabled, onClick } = props;
  return (
    <div
      className={`h-8 px-3 w-max rounded-md text-sm text-greenColor  ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } border border-greenColor`}
    >
      <button onClick={onClick} disabled={disabled} className={`w-full h-full`}>
        {props.children}
      </button>
    </div>
  );
}
export function PurpleLineButton(props: any) {
  const { disabled, onClick } = props;
  return (
    <div
      className={`h-8 px-3 w-max rounded-md text-sm text-burrowPurpleColor  ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } border border-burrowPurpleColor`}
    >
      <button onClick={onClick} disabled={disabled} className={`w-full h-full`}>
        {props.children}
      </button>
    </div>
  );
}
export function PurpleButton(props: any) {
  const { disabled, onClick, full } = props;
  return (
    <div
      className={`${
        full ? 'h-11 w-full text-base gotham_bold' : 'h-8 w-max text-sm'
      } px-3 rounded-md text-white bg-purpleBgColor  ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <button onClick={onClick} disabled={disabled} className={`w-full h-full`}>
        {props.children}
      </button>
    </div>
  );
}
