import React from 'react';
import YourSupplied from './your-suppiled';
import YourBorrowed from './your-borrowed';
import SuppliedMarket from './supplied-market';
import BorrowedMarket from './borrowed-market';
export default function TableBox() {
  return (
    <div>
      <div className="bg-portfolioBarBgColor rounded-2xl pt-5 mt-8">
        <YourSupplied></YourSupplied>
        <SuppliedMarket></SuppliedMarket>
      </div>
      <div className="bg-portfolioBarBgColor rounded-2xl pt-5 mt-6">
        <YourBorrowed></YourBorrowed>
        <BorrowedMarket></BorrowedMarket>
      </div>
    </div>
  );
}
