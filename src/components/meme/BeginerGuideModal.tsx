import React, { useState } from 'react';
import Modal from 'react-modal';

export default function BeginerGuideModal({
  isOpen,
  setModalIsOpen,
}: {
  isOpen: boolean;
  setModalIsOpen: () => void;
}) {
  const modalContentArray = [
    {
      content: (
        <p>
          <span className="font-bold">Stake</span>
          xREF to help your favorite MemeToken earn higher farming yields, While
          also receiving rewards from the Meme community.
        </p>
      ),
      title: 'Vote By xRef',
    },
    {
      content: (
        <p>
          <span className="font-bold">Donate </span>
          your meme token to stakers of xRef, attracting more xRef holders to
          stake their xRef into that MemeToken.
        </p>
      ),
      title: 'How show love for voters?',
    },
    {
      content: (
        <p>
          <span className="font-bold">Stake</span>
          your meme token to help your favorite MemeToken earn higher farming
          yields.
        </p>
      ),
      title: '',
    },
    {
      content: <p>Your staked MemeTokens will be displayed here.</p>,
      title: '',
    },
    {
      content: (
        <p>
          Unstaking requires a 5-day wait.Click{' '}
          <span className="font-bold">Withdraw</span> at the bottom of the page
          after this period to reclaim your MemeToken.
        </p>
      ),
      title: '',
    },
  ];

  const total = modalContentArray.length;
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={setModalIsOpen}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      {/* main modal content */}
      <div>
        {modalContentArray.map(
          (item, index) =>
            index + 1 == currentPage && (
              <div key={'content' + index} className=" text-white">
                {item.content}
              </div>
            )
        )}
        {/*  */}
        <div>
          {currentPage > 1 && <span>&lt; Pre</span>}
          {currentPage < modalContentArray.length && <span>Next &gt;</span>}
        </div>
      </div>
    </Modal>
  );
}
