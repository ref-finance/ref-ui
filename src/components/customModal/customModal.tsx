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
            {title && (
              <div className="modal-header flex text-white gap-4">
                {title && <div className={'modal-title'}>{title}</div>}
                {onClose && (
                  <div onClick={onClose} style={{ cursor: 'pointer' }}>
                    <CloseButtonWallet />
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

export default CustomModal;
