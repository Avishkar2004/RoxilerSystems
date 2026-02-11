import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="text-base font-semibold tracking-tight text-slate-50">
          <Link to="/">Store Ratings</Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-slate-300 hover:text-white transition"
              >
                Signup
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <span className="text-[11px] text-slate-400">
                {user?.name} ({user?.role})
              </span>
              <Link
                to="/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              {user?.role === "USER" && (
                <Link
                  to="/stores"
                  className="text-slate-300 hover:text-white transition"
                >
                  Stores
                </Link>
              )}
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

