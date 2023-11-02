import React from 'react';

export function IntegerInputComponent({
  value,
  setValue,
  disabled,
  triggerByValue,
}: any) {
  const removeLeadingZeros = (s: string) => {
    const oldLen = s.length;
    s = s.replace(/^0+/, '');

    if (s.length === 0 && oldLen > 0) {
      s = '0';
    }

    return s;
  };

  const handleChange = (val: string) => {
    val = val.replace(/[^\d]/g, '');
    val = removeLeadingZeros(val);
    setValue(val);
    if (val) {
      triggerByValue(val);
    }
  };

  return (
    <div className={`flex items-center justify-between xsm:flex-grow `}>
      <input
        type="text"
        className={`text-base font-gothamBold mx-2 text-left xsm:text-right ${
          disabled ? 'text-primaryText' : 'text-white'
        }`}
        disabled={disabled}
        value={value}
        onBlur={({ target }) => {
          if (!target.value) {
            setValue(1);
            triggerByValue(1);
          }
        }}
        onChange={({ target }) => {
          handleChange(target.value);
        }}
      />
    </div>
  );
}
