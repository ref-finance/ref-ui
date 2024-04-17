import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import Modal from 'react-modal';
function AccessModal(props: any) {
  return (
    <Modal
      isOpen={true}
      // onRequestClose={onRequestClose}
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
      <div className='text-white text-sm'>hello kity</div>
    </Modal>
  );
}
export default AccessModal;
