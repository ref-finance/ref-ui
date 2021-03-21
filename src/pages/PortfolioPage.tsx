import React, { useEffect, useState } from "react";
import Portfolio from "~components/portfolio/Portfolio";
import PriceTicker from "~components/portfolio/PriceTicker";
import FullCard from "~components/layout/FullCard";

function PortfolioPage() {
  const [tokensInContract, setTokensInContract] = useState([]);
  useEffect(() => {
    window.contract
      .get_whitelisted_tokens()
      .then((tokens: string[]) => setTokensInContract(tokens));
  }, []);

  return (
    <FullCard>
      <PriceTicker />
      <Portfolio tokensInContract={tokensInContract} />
    </FullCard>
  );
}

export default PortfolioPage;
