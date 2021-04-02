import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import AuthButton from '~components/forms/AuthButton';
import RefLogo from '~assets/reffi-logo.svg';

function BottomBar() {
  return (
    <div className="flex lg:hidden fixed w-screen h-28  bg-white bottom-0 z-10 border-t shadow-md">
      <div className="flex flex-row justify-between w-full items-center px-4">
        <a href="/portfolio">
          <h2 className="font-inter">Portfolio</h2>
        </a>
        <a href="/">
          <h2>Swap</h2>
        </a>
        <a href="/liquidity">
          <h2>Provide Liquidity</h2>
        </a>
      </div>
    </div>
  );
}

function Anchor({ to, name }: { to: string; name: string }) {
  const location = useLocation();
  const isSelected = to === location.pathname;

  return (
    <Link to={to}>
      <h2 className={`hover:text-gray-600 ${isSelected ? 'font-bold' : ''}`}>
        {name}
      </h2>
    </Link>
  );
}

function SideBar() {
  return (
    <nav className="grid grid-cols-5 items-center text-center bg-white">
      <section className="my-5 mx-3">
        <RefLogo className="w-44" height="45" />
      </section>
      <Anchor to="/portfolio" name="Portfolio" />
      <Anchor to="/" name="Swap" />
      <Anchor to="/management" name="Token Management" />
      <section className="place-self-end mr-3">
        <AuthButton />
      </section>
      {/* <Anchor href="/pools" name="Pools" /> */}
    </nav>
  );
}

function NavigationBar() {
  return (
    <div>
      <SideBar />
      <BottomBar />
    </div>
  );
}
export default NavigationBar;
