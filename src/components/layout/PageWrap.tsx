import React from 'react';

export default function PageWrap({ children }: React.PropsWithChildren<{}>) {
  return (
    <section className="overflow-y-auto bg-secondary shadow-2xl rounded p-6 sm:w-full md:w-2/3 lg:w-1/2 m-auto place-self-center max-h-96">
      {children}
    </section>
  );
}
