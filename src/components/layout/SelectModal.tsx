import React from 'react';
import { Card } from '../../components/card/Card';
import { FormattedMessage } from 'react-intl';

export const SelectModal = ({
  className,
  setShowModal,
  onSortChange,
  sortMode,
}: {
  className?: string;
  setShowModal: (mode: boolean) => void;
  onSortChange: (sortMode: string) => void;
  sortMode: string;
}) => {
  return (
    <Card
      className={`rounded border border-farmText flex text-xs  text-opacity-40 flex-col items-start absolute min-w-32 ${className}`}
      padding="py-1 px-0"
      style={{
        zIndex: 30,
      }}
    >
      <div
        className="fixed top-0 left-0 w-screen h-screen opacity-0 z-0"
        onClick={() => {
          setShowModal(false);
        }}
      />
      <div
        className={`py-2 px-2 w-full hover:bg-white hover:bg-opacity-10 z-30 text-white text-opacity-40
        
        ${sortMode === 'tvl' ? 'bg-white bg-opacity-10 text-opacity-100' : ''}
        
        `}
        onClick={() => {
          onSortChange('tvl');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="tvl" defaultMessage="TVL" />
      </div>
      <div
        className={`py-2 px-2   w-full hover:bg-white hover:bg-opacity-10 text-white text-opacity-40 ${
          sortMode === 'fee' ? 'bg-white bg-opacity-10 text-opacity-100' : ''
        } z-30`}
        onClick={() => {
          onSortChange('fee');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="fee" defaultMessage="Fee" />
      </div>

      <div
        className={`py-2 px-2   w-full hover:bg-white hover:bg-opacity-10 text-white text-opacity-40 ${
          sortMode === 'apr' ? 'bg-white bg-opacity-10 text-opacity-100' : ''
        } z-30`}
        onClick={() => {
          onSortChange('apr');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="apr" defaultMessage="APR" />
      </div>

      <div
        className={`py-2 px-2   w-full hover:bg-white hover:bg-opacity-10 text-white text-opacity-40 ${
          sortMode === 'volume_24h'
            ? 'bg-white bg-opacity-10 text-opacity-100'
            : ''
        } z-30`}
        onClick={() => {
          onSortChange('volume_24h');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="volume_24h" defaultMessage="Volume (24h)" />
      </div>
    </Card>
  );
};

export const SelectModalV2 = ({
  className,
  setShowModal,
  onSortChange,
  sortMode,
}: {
  className?: string;
  setShowModal: (mode: boolean) => void;
  onSortChange: (sortMode: string) => void;
  sortMode: string;
}) => {
  return (
    <Card
      className={`rounded border border-farmText flex text-xs  text-opacity-40 flex-col items-start absolute min-w-32 ${className}`}
      padding="py-1 px-0"
    >
      <div
        className="fixed top-0 left-0 w-screen h-screen opacity-0 z-0"
        onClick={() => {
          setShowModal(false);
        }}
      />
      <div
        className={`py-2 px-2 w-full hover:bg-white hover:bg-opacity-10 z-30 text-white text-opacity-40
        
        ${sortMode === 'tvl' ? 'bg-white bg-opacity-10 text-opacity-100' : ''}
        
        `}
        onClick={() => {
          onSortChange('tvl');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="tvl" defaultMessage="TVL" />
      </div>
      <div
        className={`py-2 px-2   w-full hover:bg-white hover:bg-opacity-10 text-white text-opacity-40 ${
          sortMode === 'fee' ? 'bg-white bg-opacity-10 text-opacity-100' : ''
        } z-30`}
        onClick={() => {
          onSortChange('fee');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="fee" defaultMessage="Fee" />
      </div>

      <div
        className={`py-2 px-2   w-full hover:bg-white hover:bg-opacity-10 text-white text-opacity-40 ${
          sortMode === 'volume_24h'
            ? 'bg-white bg-opacity-10 text-opacity-100'
            : ''
        } z-30`}
        onClick={() => {
          onSortChange('volume_24h');
          setShowModal(false);
        }}
      >
        <FormattedMessage id="volume_24h" defaultMessage="Volume (24h)" />
      </div>
      <div
        className={`py-2 px-2   w-full hover:bg-white hover:bg-opacity-10 text-white text-opacity-40 whitespace-nowrap ${
          sortMode === 'top_bin_apr'
            ? 'bg-white bg-opacity-10 text-opacity-100'
            : ''
        } z-30`}
        onClick={() => {
          onSortChange('top_bin_apr');
          setShowModal(false);
        }}
      >
        Top Bin APR (24h)
      </div>
    </Card>
  );
};
