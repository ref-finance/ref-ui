import React, { ReactNode } from "react";

interface FullCardProps {
  children: ReactNode;
}

const FullCard = ({ children }: FullCardProps) => (
  <div>
    {children}
  </div>
);

export default FullCard;
