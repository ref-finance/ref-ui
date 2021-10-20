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
    error: 'red',
    warn: 'yellow',
  };
  const color = levelToColor[level];

  return (
    <div className="p-2">
      <div
        className={`inline-flex items-center leading-none p-2 text-teal text-xs`}
      >
        <FaExclamationTriangle className={`text-${color}-500 text-lg`} />
        <span className={`text-${color}-500 inline-flex px-2`}>{message}</span>
      </div>
    </div>
  );
}
