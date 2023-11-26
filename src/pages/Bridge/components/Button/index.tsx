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
  children?: React.ReactNode;
}

const Button = ({
  type,
  text,
  plain,
  rounded,
  size,
  className,
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
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const _onClick: ButtonProps['onClick'] = (e) => {
    e.preventDefault();
    props.onClick?.(e);
  };
  return (
    <button className={_className} {...props} onClick={_onClick}>
      {children}
    </button>
  );
};

export default Button;
