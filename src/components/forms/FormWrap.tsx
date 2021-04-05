import React, { useState } from 'react';
import Alert from '~components/alert/Alert';
import SubmitButton from './SubmitButton';

interface FormWrapProps {
  title?: string;
  buttonText?: string;
  canSubmit?: boolean;
  onSubmit: (event: React.FormEvent) => void;
}

export default function FormWrap({
  children,
  title,
  buttonText,
  canSubmit = true,
  onSubmit,
}: React.PropsWithChildren<FormWrapProps>) {
  const [error, setError] = useState<Error>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit(event);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form
      className="bg-secondary shadow-2xl rounded px-4 pt-6 pb-1"
      onSubmit={handleSubmit}
    >
      {title && (
        <h2 className="formTitle font-bold text-xl text-gray-700 text-center pb-2">
          {title}
        </h2>
      )}
      {error && <Alert level="error" message={error.message} />}
      {children}
      <SubmitButton disabled={!canSubmit} text={buttonText || title} />
    </form>
  );
}
