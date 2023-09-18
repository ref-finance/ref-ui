import React from 'react';
import { FaExclamationTriangle } from '../reactIcons';

export default function Alert({
  level,
  message,
  extraClass,
}: {
  level: 'error' | 'warn';
  message: string;
  extraClass?: string;
}) {
  const levelToColor = {
    error: 'error',
    warn: 'warnColor',
  };
  const color = levelToColor[level];

  return (
    <div
      className={`inline-flex items-center leading-none p-2 text-teal text-sm ${extraClass}`}
    >
      <div>
        <FaExclamationTriangle className={`text-${color} text-lg`} />
      </div>
      <span className={`text-${color} inline-flex px-2 leading-4 text-sm`}>
        {message}
      </span>
    </div>
  );
}
