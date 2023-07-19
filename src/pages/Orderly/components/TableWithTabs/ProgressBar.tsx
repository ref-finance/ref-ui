import React from 'react';

const ProgressBar = ({ value, total, color }: { value: number, total: number, color: string }) => {
  let progress = (value / total) * 100;

  if (progress > 0 && progress < 6) {
    progress = 6;
  } else if (progress > 94 && progress < 100) {
    progress = 94;
  }

  return (
    <div className="progress-bar bg-gray-300 h-1 w-16 rounded-lg">
      <div
        className="progress-bar__fill h-full rounded-lg"
        style={{ width: `${progress}%`, backgroundColor: color }}
      ></div>
    </div>
  );
};

export default ProgressBar;
