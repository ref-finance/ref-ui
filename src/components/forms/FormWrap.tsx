import React, { useState } from 'react';
import Alert from '../alert/Alert';
import SubmitButton from './SubmitButton';
import { FormattedMessage } from 'react-intl';

interface FormWrapProps {
  title?: string;
  buttonText?: string;
  canSubmit?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  info?: string | JSX.Element;
  showElseView?: boolean;
  elseView?: JSX.Element;
}

export default function FormWrap({
  children,
  title,
  buttonText,
  canSubmit = true,
  onSubmit,
  info,
  showElseView,
  elseView,
}: React.PropsWithChildren<FormWrapProps>) {
  const [error, setError] = useState<Error>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      onSubmit(event);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form
      className="overflow-y-auto bg-secondary shadow-2xl rounded-xl p-7 bg-dark"
      onSubmit={handleSubmit}
    >
      {title && (
        <>
          <h2 className="formTitle font-bold text-xl text-gray-700 text-center pb-2">
            <FormattedMessage id={title} defaultMessage={title} />
          </h2>
        </>
      )}
      {error && <Alert level="error" message={error.message} />}
      {children}
      {showElseView && elseView ? (
        elseView
      ) : (
        <SubmitButton
          disabled={!canSubmit}
          text={buttonText || title}
          info={info}
        />
      )}
    </form>
  );
}
