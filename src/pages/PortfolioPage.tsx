import React from "react";
import Portfolio from "~components/portfolio/Portfolio";
import PriceTicker from "~components/portfolio/PriceTicker";
import FullCard from "~components/layout/FullCard";

function PortfolioPage() {
  return (
    <FullCard>
      <PriceTicker />
      <Portfolio />
    </FullCard>
  );
}

export default PortfolioPage;
