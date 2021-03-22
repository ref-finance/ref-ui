import React, { useEffect } from "react";
import Portfolio from "~components/portfolio/Portfolio";
import PriceTicker from "~components/portfolio/PriceTicker";
import FullCard from "~components/layout/FullCard";
import { getDeposits } from "~utils/ContractUtils";

function PortfolioPage() {
  useEffect(() => {
    getDeposits().then((dep) => console.log("deposits", dep));
  }, []);
  return (
    <FullCard>
      <PriceTicker />
      <Portfolio />
    </FullCard>
  );
}

export default PortfolioPage;
