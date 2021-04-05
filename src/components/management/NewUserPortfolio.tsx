import React from 'react';
import Register from './Register';

export default function NewUserPortfolio() {
  return (
    <section className="bg-white w-2/3 m-auto px-10 py-5 rounded ring-2 ring-primary overflow-y-scroll">
      <h1 className="font-semibold font-inter pt-8">
        Welcome to your Portfolio
      </h1>
      <p>
        To get started you'll need to add storage to begin depositing tokens
      </p>
      <Register />
    </section>
  );
}
