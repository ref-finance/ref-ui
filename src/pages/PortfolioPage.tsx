import React, { useEffect, useState } from "react";
import Portfolio from "~components/portfolio/Portfolio";
import PriceTicker from "~components/portfolio/PriceTicker";
import FullCard from "~components/layout/FullCard";
import { wallet } from "~services/near";

function PortfolioPage() {
  return (
    <FullCard>
      {wallet.isSignedIn() ? <Portfolio/> : null}
    </FullCard>
  );
}

export default PortfolioPage;
