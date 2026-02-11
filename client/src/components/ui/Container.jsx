import React from "react";

function Container({ children }) {
  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-6 pb-10">
      {children}
    </main>
  );
}

export default Container;

