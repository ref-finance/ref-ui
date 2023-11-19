import './index.css';

import React, { MouseEvent } from 'react';

interface ButtonProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
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

  const _onClick = (e: MouseEvent<HTMLButtonElement>) => {
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
