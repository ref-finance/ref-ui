import React, { ReactNode } from "react";

interface FullCardProps {
  children: ReactNode;
}

const FullCard = ({ children }: FullCardProps) => (
  <div
    className="rounded-lg border-2 border-borderGray shadow-xl w-full pl-6 pr-6"
    style={{ minHeight: "calc(100vh - 1.5rem)" }}
  >
    {children}
  </div>
);

export default FullCard;
