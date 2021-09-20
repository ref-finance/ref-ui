import React from 'react';
import AirdropView from '~components/airdrop/Airdrop';
import { FormattedMessage } from 'react-intl';

export function AirdropPage() {
  return (
    <div className="airdrop">
      <div className="title text-center text-3xl pb-3 text-white font-semibold">
        <FormattedMessage id="airdrop" defaultMessage="Airdrop" />
      </div>
      <div className="describe text-center text-sm pb-5 text-white">
        <FormattedMessage
          id="claim_ref_token"
          defaultMessage="Claim Ref token"
        />
      </div>
      <section className="w-1/3 md:w-5/6 xs:w-11/12 m-auto">
        <AirdropView />
      </section>
    </div>
  );
}
