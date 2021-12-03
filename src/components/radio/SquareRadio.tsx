import React, { useState } from 'react';
import { useIntl } from 'react-intl';

export default function SquareRadio({
  radios,
  onChange,
}: {
  radios: string[];
  onChange: (chooseModule: string) => void;
}) {
  const [choose, setChoose] = useState(radios[0]);
  const intl = useIntl();
  return (
    <div className="flex justify-between mx-12">
      {radios.map((radio) => {
        return (
          <div
            className={`py-4 w-36 text-center text-sm rounded-tr-lg rounded-tl-lg cursor-pointer ${
              choose === radio ? ' bg-cardBg text-white ' : ' text-primaryText'
            }`}
            key={radio}
            onClick={() => {
              setChoose(radio);
              onChange(radio);
            }}
          >
            {intl.formatMessage({ id: radio })}
          </div>
        );
      })}
    </div>
  );
}
