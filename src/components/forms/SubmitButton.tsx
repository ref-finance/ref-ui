import React from 'react';

interface SubmitButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

function SubmitButton({ text, disabled, onClick }: SubmitButtonProps) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      disabled={disabled}
      onClick={onClick}
      className="flex flex-row justify-center py-4 mt-5 mb-5 items-center rounded-md w-full bg-black  text-white disabled:text-gray-400  disabled:bg-gray-100"
      // style={{ backgroundColor: "#e5e7eb" }}
    >
      <h1 className=" text-xl font-inter font-medium ">{text}</h1>
    </button>
  );
}

export default SubmitButton;
