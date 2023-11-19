import React from 'react';

type Props = {
  model: BridgeModel.BridgeTransaction;
  className?: string;
  onChange?: (value: BridgeModel.BridgeTransaction) => void;
  children?: React.ReactNode;
};

function InputToken({ model, className, onChange, children }: Props) {
  return (
    <div
      className={`border rounded-xl border-solid border-gray-700 p-3 ${className}`}
    >
      <div className="flex items-center mb-3">
        <input
          type="number"
          inputMode="decimal"
          className="text-white text-xl bg-transparent flex-1"
          placeholder="0"
          value={model.amount || ''}
          onChange={(e) =>
            onChange?.({ ...model, amount: Number(e.target.value) })
          }
        />
        {children}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span>$0.00</span>
        <span className="text-gray-400">Balance: </span>
      </div>
    </div>
  );
}
export default InputToken;
