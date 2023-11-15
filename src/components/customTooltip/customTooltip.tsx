import { Tooltip as ReactTooltip, PlacesType } from 'react-tooltip';
import React from 'react';
import './customTooltip.css';
import { useClientMobile } from 'src/utils/device';

type Props = {
  id: string;
  globalCloseEvents?: any;
  children?: any;
  isOpen?: boolean;
  setIsOpen?: any;
  className?: string;
  place?: PlacesType;
};
const CustomTooltip = ({
  id,
  className = '',
  children,
  globalCloseEvents,
  isOpen,
  setIsOpen,
  place,
}: Props) => {
  const isMobile = useClientMobile();

  return (
    <ReactTooltip
      id={id}
      globalCloseEvents={globalCloseEvents}
      {...(isMobile && { events: ['click'] })}
      className={`custom-tooltip ${className}`}
      border={'1px solid #7e8a93'}
      isOpen={isOpen}
      place={place}
      setIsOpen={setIsOpen}
    >
      {children}
    </ReactTooltip>
  );
};

export default CustomTooltip;
