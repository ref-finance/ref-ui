import React, { useState } from 'react';

export default function TabFormWrap({
  titles,
  children,
}: React.PropsWithChildren<{ titles: string[] }>) {
  const [active, setActive] = useState<number>(0);

  return (
    <section className="flex justify-center">
      <section className="m-8 bg-secondary rounded">
        <nav className="flex flex-col sm:flex-row">
          {titles.map((title, i) => (
            <button
              className={`text-primaryScale-600 py-4 px-6 hover:text-primaryScale-500 focus:outline-none ${
                active === i &&
                'text-white border-b-4 border-primary font-medium'
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
