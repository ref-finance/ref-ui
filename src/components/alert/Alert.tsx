import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function Alert({
  level,
  message,
}: {
  level: 'error' | 'warn';
  message: string;
}) {
  const levelToColor = {
    error: 'error',
    warn: 'warnColor',
  };
  const color = levelToColor[level];

  return (
    <div
      className={`inline-flex items-center leading-none p-2 text-teal text-sm`}
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
