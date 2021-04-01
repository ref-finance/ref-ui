import React, { useEffect, useRef, useState } from 'react';

export default function TabFormWrap({
  titles,
  children,
}: React.PropsWithChildren<{ titles: string[] }>) {
  const [active, setActive] = useState<number>(0);

  return (
    <section className="bg-white">
      <nav className="flex flex-col sm:flex-row">
        {titles.map((title, i) => (
          <button
            className={`text-gray-600 py-4 px-6 block hover:text-black focus:outline-none ${
              active === i && 'text-black border-b-2 font-medium border-black'
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
