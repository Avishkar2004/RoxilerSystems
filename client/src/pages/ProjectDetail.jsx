import React from "react";
import Card from "../components/ui/Card";

// Simple, styled placeholder for per-store detail
function ProjectDetail() {
  return (
    <Card className="border border-slate-800 bg-slate-900/70">
      <h2 className="text-lg font-semibold text-slate-50">Store Details</h2>
      <p className="mt-2 text-sm text-slate-300">
        This page can be extended to show more information about a single store,
        such as full address, rating history, and additional metadata.
      </p>
    </Card>
  );
}

export default ProjectDetail;

