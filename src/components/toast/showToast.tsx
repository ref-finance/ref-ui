import React from 'react';
import { toast, ToastOptions, Icons } from 'react-toastify';
import SuccessIcon from '../../assets/svg/icon-check.svg';
import WarningIcon from '../../assets/svg/icon-warning.svg';
import ErrorIcon from '../../assets/svg/icon-x.svg';

type Props = {
  title?: string;
  titleNode?: any;
  desc?: string;
  descNode?: any;
  isError?: boolean;
  isWarning?: boolean;
  options?: any;
};

const showToast = ({
  title,
  titleNode,
  desc,
  descNode,
  isError,
  isWarning,
  options = {},
}: Props) => {
  const toastOptions: ToastOptions = {
    position: 'bottom-right',
    autoClose: 5000,
    className: 'custom-toast',
    icon: false,
    ...options,
  };

  let iconNode = <SuccessIcon />;
  if (isWarning) {
    iconNode = <WarningIcon />;
  }
  if (isError) {
    iconNode = <ErrorIcon />;
  }

  let descEle;
  if (descNode) {
    descEle = descNode;
  } else if (desc) {
    descEle = <div className={'custom-toast-desc'}>{desc}</div>;
  }

  const node = (
    <div>
      <div className={'flex gap-2'}>
        <div className={'pt-1'}>{iconNode}</div>
        <div>
          <div>{titleNode || title}</div>
          {descEle}
        </div>
      </div>
    </div>
  );

  if (isError) {
    return toast.error(node, toastOptions);
  }
  if (isWarning) {
    return toast.warning(node, toastOptions);
  }
  return toast.success(node, toastOptions);
};

export default showToast;
