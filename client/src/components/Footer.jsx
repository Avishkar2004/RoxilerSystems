import React from "react";

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 py-4 text-center text-[11px] text-slate-400">
      Store Ratings Platform &copy; {new Date().getFullYear()}
    </footer>
  );
}

export default Footer;

