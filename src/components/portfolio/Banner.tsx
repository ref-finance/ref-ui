import React, { useEffect, useMemo, useState, useContext } from 'react';
import { REFIcon } from '../../components/icon/Portfolio';
export default function Banner(props: any) {
  return (
    <div className="flex items-center justify-between h-14 pl-7 pr-3 border-b border-boxBorder">
      <div className="flex items-center">
        <REFIcon></REFIcon>
        <span className="text-base text-white gotham_bold ml-3">
          Ref.finance
        </span>
      </div>
    </div>
  );
}
