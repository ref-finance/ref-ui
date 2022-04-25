import React from 'react';
import { toast } from 'react-toastify';
import getConfig from '../../services/config';
import { FormattedMessage } from 'react-intl';
import { CloseIcon } from '../icon/Actions';

export const senderSignedInToast = (errorType?: string) => {
  toast(
    <div
      className="text-error w-full h-full pl-1.5 py-1"
      style={{
        lineHeight: '40px',
      }}
    >
      {/* <FormattedMessage id="sign_in_error" defaultMessage="Sign in error" />
      {'. '}
      <FormattedMessage id="Type" defaultMessage="Type" />: {` `}
      {errorType} <br />
      <FormattedMessage
        id="please_check_your_account_state"
        defaultMessage="Please check your account state"
      /> */}

      <FormattedMessage
        id="initialize_account_tip"
        defaultMessage="Please initialize your account."
      />
    </div>,
    {
      autoClose: false,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: <CloseIcon />,
      progressStyle: {
        background: '#FF7575',
        borderRadius: '8px',
      },
      style: {
        background: '#1D2932',
        boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
      },
      className: 'sender-login-fail-toast',
    }
  );
};
