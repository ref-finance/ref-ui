import React from "react";
import AuthButton from "~components/general/AuthButton";
import RefLogo from "~assets/reffi-logo.svg";

function BottomBar() {
  return (
    <div className="flex lg:hidden fixed w-screen h-28  bg-white bottom-0 z-10 border-t shadow-md">
      <div className="flex flex-row justify-between w-full items-center px-4">
        <a href="/">
          <h2 className="font-inter">Portfolio</h2>
        </a>
        <a href="/swap">
          <h2>Swap</h2>
        </a>
        <a href="/liquidity">
          <h2>Provide Liquidity</h2>
        </a>
      </div>
    </div>
  );
}

function SideBar() {
  return (
    <nav className="fixed w-60 pl-3 pt-6 hidden lg:block ">
      <RefLogo height="25" />
      <AuthButton />
      <div className="flex flex-col space-y-6 mt-8">
        <a href="/">
          <h2>Portfolio</h2>
        </a>
        <a href="/swap">
          <h2>Swap</h2>
        </a>
        <a href="/liquidity">
          <h2>Provide Liquidity</h2>
        </a>
      </div>
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
