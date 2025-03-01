// components/DataTable.tsx
"use client";

import useSWR from "swr";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"; // ShadCN components

// Fetch function for useSWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DataTable() {
  const { data, error } = useSWR("/api/users", fetcher, {
    refreshInterval: 5000, // Auto-refresh every 5s
  });
  if (error) return <div>Error loading users...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Table>
      <TableCaption>List of Users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Created At</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user: any) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
