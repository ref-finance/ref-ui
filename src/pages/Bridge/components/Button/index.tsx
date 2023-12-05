import SvgIcon from '../SvgIcon';
import './index.css';

import React, { MouseEvent, MouseEventHandler } from 'react';

interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  text?: boolean;
  plain?: boolean;
  rounded?: boolean;
  size?: 'large' | 'default' | 'small';
  type?: 'primary' | 'default' | 'info';
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = ({
  type,
  text,
  plain,
  rounded,
  size,
  className,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const _className = [
    'bridge-btn',
    `bridge-btn-${type ?? 'default'}`,
    `bridge-btn-size-${size ?? 'default'}`,
    text && 'is-text',
    plain && 'is-plain',
    rounded && 'is-rounded',
    (loading || disabled) && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const _onClick: ButtonProps['onClick'] = (e) => {
    e.preventDefault();
    props.onClick?.(e);
  };
  return (
    <button
      className={_className}
      {...props}
      disabled={disabled || loading}
      onClick={_onClick}
    >
      {loading && <SvgIcon name="IconLoading" className="mr-1" />}
      {children}
    </button>
  );
};

export default Button;
