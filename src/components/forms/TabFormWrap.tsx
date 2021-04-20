import React, { useState } from 'react';

export default function TabFormWrap({
  titles,
  children,
}: React.PropsWithChildren<{ titles: string[] }>) {
  const [active, setActive] = useState<number>(0);

  return (
    <section className="flex justify-center">
      <section className="m-3 bg-secondary rounded">
        <nav className="flex flex-col sm:flex-row">
          {titles.map((title, i) => (
            <button
              key={title}
              className={`text-black py-4 px-6 hover:text-primaryScale-500 transition-transform focus:outline-none ${
                active === i &&
                'text-primaryScale-500 border-b-4 border-primary font-bold'
              }`}
              onClick={() => setActive(i)}
            >
              {title}
            </button>
          ))}
        </nav>
        {React.Children.toArray(children)[active]}
      </section>
    </section>
  );
}
