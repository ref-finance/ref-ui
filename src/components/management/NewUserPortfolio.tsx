import React from 'react';
import Register from './Register';

export default function NewUserPortfolio() {
  return (
    <>
      <h1 className="font-semibold font-inter pt-8">
        Welcome to your Portfolio
      </h1>
      <p>To get started you'll need to register a few tokens</p>
      <Register />
    </>
  );
}
