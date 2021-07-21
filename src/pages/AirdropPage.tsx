import React from 'react';
import AirdropView from '~components/airdrop/Airdrop';

export function AirdropPage() {
  return (
    <div className="airdrop">
      <div className="title text-center text-3xl pb-3 text-white font-semibold">
        Airdrop
      </div>
      <div className="describe text-center text-sm pb-5 text-white">
        Claim Ref token
      </div>
      <section className="w-1/3 md:w-5/6 xs:w-11/12 m-auto">
        <AirdropView />
      </section>
    </div>
  );
}
