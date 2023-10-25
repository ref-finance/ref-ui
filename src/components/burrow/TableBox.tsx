import React from 'react';
import YourSupplied from './your-suppiled';
import YourBorrowed from './your-borrowed';
import SuppliedMarket from './supplied-market';
import BorrowedMarket from './borrowed-market';
import { isMobile } from 'src/utils/device';
const is_mobile = isMobile();
export default function TableBox(props: any) {
  const { activeTab } = props;
  return (
    <div>
      {is_mobile ? (
        <>
          <div className={`${activeTab == 'supply' ? '' : 'hidden'}`}>
            <YourSupplied></YourSupplied>
            <SuppliedMarket></SuppliedMarket>
          </div>
          <div className={`${activeTab == 'borrow' ? '' : 'hidden'}`}>
            <YourBorrowed></YourBorrowed>
            <BorrowedMarket></BorrowedMarket>
          </div>
        </>
      ) : (
        <>
          <div className="bg-portfolioBarBgColor rounded-2xl pt-5 mt-8">
            <YourSupplied></YourSupplied>
            <SuppliedMarket></SuppliedMarket>
          </div>
          <div className="bg-portfolioBarBgColor rounded-2xl pt-5 mt-6">
            <YourBorrowed></YourBorrowed>
            <BorrowedMarket></BorrowedMarket>
          </div>
        </>
      )}
    </div>
  );
}
