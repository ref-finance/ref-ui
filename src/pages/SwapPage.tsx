import React from "react";
import QuarterCard from "~components/layout/QuarterCard";
import BackgroundSVG from "~assets/images/background.svg";
import SwapCard from "~components/swap/SwapCard";

function SwapPage() {
  return (
    <div>
      <QuarterCard>
        <SwapCard />
      </QuarterCard>
      <div className="absolute top-0 -right-64 h-3/6 w-3/6 pt-20 animate-float hidden lg:block">
        <BackgroundSVG />
      </div>
    </div>
  );
}

export default SwapPage;
