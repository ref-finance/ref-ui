import React from 'react';
import { Carousel } from './Carousel';
export default function OrderlyAirDropPop() {
  const carouselList = [
    {
      title: 'Orderly Network Airdrop is coming!',
      content: `10% (100,000,000) $ORDER tokens are allocated to early users.
#NEAR traders need to bind their wallets before June 27th.
Check your allocation and bind here> (excludes current merit campaign):`,
      src: 'https://assets.ref.finance/images/orderlyBanner2.jpg',
    },
  ];
  return (
    <div
      className="w-full h-full fixed top-0 frcc"
      style={{
        zIndex: 99999,
        background: 'rgba(0,0,0,.5)',
      }}
    >
      <Carousel list={carouselList} autoPlay={false}></Carousel>
    </div>
  );
}
