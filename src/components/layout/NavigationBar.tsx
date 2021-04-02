import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';

import AuthButton from '~components/forms/AuthButton';
import RefLogo from '~assets/reffi-logo.svg';

function MobileBar() {
  return (
    <section className="md:hidden w-full bg-white">
      <RefLogo className="m-auto w-40" height="70" />
      <Menu
        styles={{
          bmBurgerButton: {
            position: 'fixed',
            width: '2rem',
            height: '1.6rem',
            left: '1.5rem',
            top: '1.5rem',
          },
          bmBurgerBars: {
            background: '#000000',
          },
          bmBurgerBarsHover: {
            background: '#a90000',
          },
          bmCrossButton: {
            height: '24px',
            width: '24px',
          },
          bmCross: {
            background: '#bdc3c7',
          },
          bmMenuWrap: {
            position: 'fixed',
            height: '100%',
          },
          bmMenu: {
            background: '#FFFFFF',
            padding: '2.5em 1.5em 0',
            fontSize: '1.15em',
          },
          bmMorphShape: {
            fill: '#373a47',
          },
        }}
      >
        <Anchor to="/portfolio" name="Portfolio" />
        <Anchor to="/" name="Swap" />
        <Anchor to="/management" name="Token Management" />
      </Menu>
    </section>
  );
}

function Anchor({ to, name }: { to: string; name: string }) {
  const location = useLocation();
  const isSelected = to === location.pathname;

  return (
    <Link to={to}>
      <h2
        className={`hover:text-gray-600 p-5 ${isSelected ? 'font-bold' : ''}`}
      >
        {name}
      </h2>
    </Link>
  );
}

function DesktopBar() {
  return (
    <nav className="hidden grid-cols-5 items-center text-center bg-white md:grid">
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
      <DesktopBar />
      <MobileBar />
    </div>
  );
}
export default NavigationBar;
