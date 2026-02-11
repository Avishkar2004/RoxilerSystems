import React from "react";
import Card from "./ui/Card";

function Features() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border border-slate-800 bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-50">
          Role-based dashboards
        </h3>
        <p className="mt-1 text-xs text-slate-300">
          System Admin, Normal Users, and Store Owners each see tailored, focused
          dashboards.
        </p>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-50">Store ratings</h3>
        <p className="mt-1 text-xs text-slate-300">
          Users rate stores from 1 to 5 and can update their ratings anytime.
        </p>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-50">Smart search</h3>
        <p className="mt-1 text-xs text-slate-300">
          Quickly find stores by name or address with responsive filtering.
        </p>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <h3 className="text-sm font-semibold text-slate-50">
          Secure authentication
        </h3>
        <p className="mt-1 text-xs text-slate-300">
          Strong validation rules keep passwords secure and data consistent.
        </p>
      </Card>
    </div>
  );
}

export default Features;

