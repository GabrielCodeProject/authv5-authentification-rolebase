"use client";

import Link from "next/link";

const AdminTools = () => (
  <div className="mt-6 w-full">
    <h2 className="text-2xl mb-4">Admin Controls</h2>
    <div className="space-y-2">
      <Link href="/admin" className="btn-admin">
        Manage Users
      </Link>
      <button className="btn-admin">View Audit Logs</button>
      <button className="btn-admin">System Settings</button>
    </div>
  </div>
);

export default AdminTools;
