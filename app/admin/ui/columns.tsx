"use client";

import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSWRConfig } from "swr";

export const columns: ColumnDef<User>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const { mutate } = useSWRConfig(); // SWR mutate function to refresh data

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/users/${user.id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            throw new Error("Failed to delete user");
          }

          alert("User deleted successfully");

          // Optionally, trigger a state update to refresh the table
          mutate("api/users");
        } catch (error) {
          console.error(error);
          alert("Error deleting user");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "lastName",
    header: "Last name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
];
