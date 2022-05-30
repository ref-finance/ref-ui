import React from 'react';
import USNCard from './USNCard';
import Loading from '../layout/Loading';
import getConfig from '../../services/config';
import { nearMetadata } from '../../services/wrap-near';
import { useTokens } from '~state/token';
import Modal from 'react-modal';
import { Card } from '../card/Card';
import { CloseIcon } from '../icon/Actions';
import { IoClose } from 'react-icons/io5';
import { isMobile } from '../../utils/device';
import { SolidButton } from '../button/Button';
import { FormattedMessage } from 'react-intl';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { Burrow } from '~components/icon';
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

export function BorrowLinkCard(props: ReactModal.Props) {
  return (
    <Modal {...props}>
      <div className="swap w-full">
        <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
          <div
            className="rounded-2xl xs:rounded-lg md:rounded-lg border border-opacity-50 flex items-center flex-col border-gradientFrom p-7 bg-cardBg "
            style={{
              height: isMobile() ? '510px' : '500px',
            }}
          >
            <div className="pl-2 pb-1 self-end cursor-pointer text-xl">
              <IoClose
                onClick={props.onRequestClose}
                className="text-primaryText cursor-pointer ml-2"
              />
            </div>

            <div className="pb-6 xs:pb-2 xs:transform xs:scale-75">
              <Burrow />
            </div>

            <div className="text-white text-sm text-center pb-5">
              <FormattedMessage
                id="burrow_usn_tip"
                defaultMessage={'You can borrow USN on Burrow.'}
              ></FormattedMessage>
            </div>

            <SolidButton
              className="flex items-center justify-center  text-xl py-3 w-4/5"
              onClick={(e) => {
                window.open('https://app.burrow.cash/', '_blank');
              }}
            >
              <span>
                <FormattedMessage
                  id="go_to_borrow"
                  defaultMessage="Go to Burrow"
                />
              </span>
              <span className="ml-1.5">
                <HiOutlineExternalLink />
              </span>
            </SolidButton>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default USNPage;
