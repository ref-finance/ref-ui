import React, { useEffect, useState } from "react";
import Portfolio from "~components/portfolio/Portfolio";
import PriceTicker from "~components/portfolio/PriceTicker";
import FullCard from "~components/layout/FullCard";

function PortfolioPage() {
  return (
    <FullCard>
      {/* <PriceTicker /> */}
      <Portfolio deposits={window.deposits} />
    </FullCard>
  );
}

export default PortfolioPage;
