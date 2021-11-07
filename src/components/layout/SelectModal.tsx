import React from 'react';
import { Card } from '~components/card/Card';
import { FormattedMessage } from 'react-intl';

export const SelectModal = ({
  className,
  setShowModal,
  onSortChange,
}: {
  className?: string;
  setShowModal: (mode: boolean) => void;
  onSortChange: (sortMode: string) => void;
}) => {
  return (
    <Card
      width="w-36 absolute"
      className={`rounded border border-gray-400 flex text-sm flex-col items-start ${className}`}
      padding="py-1 px-0"
    >
      <div
        className="fixed top-0 left-0 w-screen h-screen opacity-0 z-0"
        onClick={() => {
          setShowModal(false);
        }}
      />
      <div
        className="py-2 px-2 w-full hover:bg-poolRowHover hover:text-white rounded-lg hover:opacity-80 z-30"
        onClick={() => {
          onSortChange('tvl');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="tvl" defaultMessage="TVL" />
      </div>
      <div
        className="py-2 px-2   w-full hover:bg-poolRowHover hover:text-white rounded-lg hover:opacity-80 z-30"
        onClick={() => {
          onSortChange('fee');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="fee" defaultMessage="Fee" />
      </div>
    </Card>
  );
};
