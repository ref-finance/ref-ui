import React from 'react';
import SubmitButton from './SubmitButton';

interface FormWrapProps {
  title?: string;
  buttonText?: string;
  onSubmit: (event: React.FormEvent) => void;
}

export default function FormWrap({
  children,
  title,
  buttonText,
  onSubmit,
}: React.PropsWithChildren<FormWrapProps>) {
  return (
    <form
      className="bg-white shadow-md rounded px-8 pt-6 pb-1 mb-4 max-w-md"
      onSubmit={onSubmit}
    >
      {title && <h2 className="font-normal text-lg pb-2">{title}</h2>}
      {children}
      <SubmitButton disabled={false} text={buttonText || title} />
    </form>
  );
}
