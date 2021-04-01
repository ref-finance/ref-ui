import React from 'react';

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
        className={`inline-flex items-center bg-white leading-none text-${color}-600 rounded-full p-2 shadow text-teal text-sm`}
      >
        <span
          className={`inline-flex bg-${color}-600 text-white rounded-full h-6 px-3 justify-center items-center`}
        >
          {level}
        </span>
        <span className="inline-flex px-2">{message}</span>
      </div>
    </div>
  );
}
