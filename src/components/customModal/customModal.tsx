import React from 'react';
import Portal from './portal';
import './customModal.css';
import { CloseButtonWallet } from 'src/context/modal-ui/components/CloseButton';

type onClickHandler = (event: React.MouseEvent<HTMLElement>) => any;

interface Props {
  isOpen: boolean;
  size?: string;
  width?: number;
  canScroll?: boolean;
  onClose: onClickHandler;
  onOutsideClick?: onClickHandler;
  title?: string;
  children?: any;
  className?: string;
}

const CustomModal = ({
  title,
  children,
  isOpen,
  onClose,
  onOutsideClick,
  size,
  width,
  canScroll,
  className = '',
}: Props) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setShow(isOpen);
    }, 300);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const styles: { width?: number } = {};
  if (width) {
    styles.width = width;
  }
  return (
    <Portal>
      <div
        className={`customModal fade ${show && 'show'} ${className || ''}`}
        style={show ? { display: 'block' } : {}}
      >
        <div className="overlay" onClick={onOutsideClick} />
        <div
          className={`modal-dialog background-paper ${
            size ? `modal-${size}` : ''
          }`}
        >
          <div className="modal-content" style={styles}>
            {(title || onClose) && (
              <div className={`modal-header flex text-white gap-4`}>
                <div className={'modal-title'}>{title}</div>
                {onClose && (
                  <div onClick={onClose} style={{ cursor: 'pointer' }}>
                    <ModalCloseIcon />
                  </div>
                )}
              </div>
            )}
            <div
              className={`modal-body ${canScroll ? 'modal-body-scroll' : ''}`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

const ModalCloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M7.73284 5.99997L11.7359 1.99698C12.0368 1.69598 12.0882 1.25928 11.8507 1.02188L10.9779 0.149088C10.7404 -0.0884114 10.3043 -0.0363117 10.0028 0.264487L6.00013 4.26737L1.99719 0.264587C1.69619 -0.0367116 1.25948 -0.0884115 1.02198 0.149388L0.149174 1.02228C-0.0882276 1.25938 -0.0368271 1.69608 0.264576 1.99708L4.26761 5.99997L0.264576 10.0032C-0.0363271 10.304 -0.0884276 10.7404 0.149174 10.9779L1.02198 11.8507C1.25948 12.0882 1.69619 12.0367 1.99719 11.7358L6.00033 7.73266L10.0029 11.7352C10.3044 12.0368 10.7405 12.0882 10.978 11.8507L11.8508 10.9779C12.0882 10.7404 12.0368 10.304 11.736 10.0028L7.73284 5.99997Z"
        fill="white"
      />
    </svg>
  );
};

export default CustomModal;
