import React, { useEffect, useState } from "react";
import Portfolio from "~components/portfolio/Portfolio";
import PriceTicker from "~components/portfolio/PriceTicker";
import FullCard from "~components/layout/FullCard";
import { getDeposits } from "~utils/ContractUtils";

function PortfolioPage() {
  const [deposits, setDeposits] = useState([]);
  useEffect(() => {
    getDeposits().then((newDeposits) => setDeposits(newDeposits));
  }, []);

  return (
    <FullCard>
      <PriceTicker />
      <Portfolio deposits={deposits} />
    </FullCard>
  );
}

export default PortfolioPage;
