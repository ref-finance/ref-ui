import React from "react";

interface SubmitButtonProps {
  disabled: boolean;
  text: string;
  onClick: () => void;
}

function SubmitButton({ onClick, disabled, text }: SubmitButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-row justify-center py-4 mt-10 mb-16 items-center rounded-md w-full bg-black  text-white disabled:text-gray-400  disabled:bg-gray-100"
      // style={{ backgroundColor: "#e5e7eb" }}
    >
      <h1 className=" text-xl font-inter font-medium ">{text}</h1>
    </button>
  );
}

export default SubmitButton;
