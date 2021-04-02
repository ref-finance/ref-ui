import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import AuthButton from '~components/forms/AuthButton';
import RefLogo from '~assets/reffi-logo.svg';
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
        <Anchor to="/management" name="Token Management" />
        <AuthButton />
      </Menu>
    </section>
  );
}

function Anchor({ to, name }: { to: string; name: string }) {
  const location = useLocation();
  const isSelected = to === location.pathname;
  if (!wallet.isSignedIn()) return <p></p>;

  return (
    <Link to={to}>
      <h2
        className={`hover:text-darkText text-xl p-5 ${
          isSelected ? 'font-bold' : ''
        }`}
      >
        {name}
      </h2>
    </Link>
  );
}

function DesktopBar() {
  return (
    <nav className="hidden grid-cols-5 items-center text-center bg-secondary md:grid">
      <Link to="/" className="my-5 mx-3">
        <RefLogo className="w-44" height="45" />
      </Link>
      <Anchor to="/portfolio" name="Portfolio" />
      <Anchor to="/" name="Swap" />
      <Anchor to="/management" name="Deposit / Withdraw" />
      <section className="place-self-end mr-3">
        <AuthButton />
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
