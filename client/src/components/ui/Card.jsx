import React from "react";

function Card({ children, className = "", style }) {
  return (
    <div
      className={
        "rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-lg shadow-black/30 " +
        className
      }
      style={style}
    >
      {children}
    </div>
  );
}

export default Card;

