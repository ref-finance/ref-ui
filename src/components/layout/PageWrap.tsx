import React from 'react';

export default function PageWrap({ children }: React.PropsWithChildren<{}>) {
  return (
    <section className="overflow-y-auto bg-secondary shadow-2xl rounded p-8 sm:w-full md:w-1/4 lg:w-1/2 m-auto place-self-center">
      {children}
    </section>
  );
}
