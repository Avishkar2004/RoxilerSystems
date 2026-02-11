import React from "react";
import Features from "../components/Features";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="space-y-6">
      <Card className="mb-2 border border-slate-800 bg-slate-900/70">
        <h1 className="text-2xl font-semibold text-slate-50">
          Store Ratings Platform
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          A single login for admins, users, and store owners to manage stores and
          ratings in one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary">Signup as User</Button>
          </Link>
        </div>
      </Card>
      <Features />
    </div>
  );
}

export default Home;

