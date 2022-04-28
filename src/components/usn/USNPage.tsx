import React from 'react';
import USNCard from './USNCard';
import Loading from '../layout/Loading';
import getConfig from '../../services/config';
import { nearMetadata } from '../../services/wrap-near';
import { useTokens } from '~state/token';
import Modal from 'react-modal';
function USNPage(props: ReactModal.Props) {
  const extraTokens =
    getConfig().networkId === 'mainnet' ? ['usn'] : ['usdn.testnet'];

  const tokens = useTokens(extraTokens);
  if (!tokens) return <Loading />;
  const allTokens = [nearMetadata, tokens[0]];
  return (
    <Modal {...props}>
      <div className="swap">
        <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
          <USNCard allTokens={allTokens} closeFun={props.onRequestClose} />
        </section>
      </div>
    </Modal>
  );
}

export default USNPage;
