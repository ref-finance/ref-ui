import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import Dropdown from './Dropdown';
import AuthButton from '../../components/forms/AuthButton';
import RefLogo from '../../assets/reffi-logo.svg';
import { wallet } from '~services/near';

function MobileBar() {
  return (
    <section className="md:hidden w-full bg-secondary">
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
        <Anchor to="/pools" name="Pools" />
        <a
          href="https://ethereum.bridgetonear.org/"
          target="_blank"
          className="hover:text-primaryScale-500 text-xl p-5 outline-none"
        >
          Rainbow Bridge
        </a>
        <AuthButton />
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
        className={`hover:text-primaryScale-500 text-xl p-5 ${
          isSelected ? 'font-bold text-primaryScale-500' : ''
        }`}
      >
        {name}
      </h2>
    </Link>
  );
}

function DesktopBar() {
  return (
    <nav className="hidden grid-cols-6 items-center text-center bg-secondary md:grid">
      <Link to="/" className="my-2 mx-3">
        <RefLogo className="w-full" height="66" />
      </Link>
      {wallet.isSignedIn() ? (
        <Anchor to="/portfolio" name="Portfolio" />
      ) : (
        <p></p>
      )}
      <Anchor to="/" name="Swap" />
      <Anchor to="/pools" name="Pools" />
      <a
        href="https://ethereum.bridgetonear.org/"
        target="_blank"
        className="hover:text-primaryScale-500 text-xl p-5"
      >
        Rainbow Bridge
      </a>
      <section className="place-self-center">
        {wallet.isSignedIn() ? <Dropdown /> : <AuthButton />}
      </section>
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
