import React, { ReactNode } from "react";

interface QuarterCardProps {
  children: ReactNode;
}

const QuarterCard = ({ children }: QuarterCardProps) => (
  <div className="rounded-lg border-2  border-black  shadow-xl  lg:w-1/3 lg:min-w-25 ">
    {children}
  </div>
);

export default QuarterCard;
