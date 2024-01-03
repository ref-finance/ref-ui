import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const canUseDOM = !!(
  typeof window !== 'undefined' && window?.document?.createElement
);

type Props = {
  children?: string | React.ReactNode;
};

let node;
const Portal = ({ children }: Props) => {
  const rootBody = document.querySelector('body');
  useEffect(() => {
    return () => {
      if (node) {
        document.body.removeChild(node);
      }
      node = null;
      rootBody?.classList.remove('modal-open');
    };
  }, []);

  if (!canUseDOM) {
    return null;
  }

  if (!node) {
    rootBody?.classList.add('modal-open');
    node = document.createElement('div');
    document.body.appendChild(node);
  }
  return ReactDOM.createPortal(children, node);
};

export default Portal;
