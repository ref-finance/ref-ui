import React, { useEffect, useRef, useState } from 'react';

export default function TabFormWrap({
  titles,
  children,
}: React.PropsWithChildren<{ titles: string[] }>) {
  const [active, setActive] = useState<number>(0);

  return (
    <section className="m-8">
      <nav className="flex flex-col sm:flex-row">
        {titles.map((title, i) => (
          <button
            className={`text-white py-4 px-6 hover:text-blue-400 focus:outline-none ${
              active === i && 'text-white border-b-4 border-green-500 font-medium '
            }`}
            onClick={() => setActive(i)}
          >
            {title}
          </button>
        ))}
      </nav>
      {React.Children.toArray(children)[active]}
    </section>
  );
}
