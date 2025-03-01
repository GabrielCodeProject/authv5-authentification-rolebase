"use client";

import { columns } from "./ui/columns";
import useSWR from "swr";
import { DataTable } from "@/components/datatable/data-table-test";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyComponent() {
  const { data, error } = useSWR("/api/users", fetcher, {
    refreshInterval: 5000, // Auto-refresh every 5s
  });
  if (error) return <div>Error loading users...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Component</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
