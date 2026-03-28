import React from "react";
import { UsersTable } from "@/components/UsersTable";
import { getUsers } from "@/lib/users";

export default async function UsersPage() {
  const users = await getUsers();
  
  // Transform data to match LocalUser interface
  const formattedUsers = users.map(u => ({
    ...u,
    id: u.id.toString(),
    role: (u.role === 'ADMIN' ? 'admin' : 'user') as 'admin' | 'user'
  }));

  return (
    <UsersTable initialUsers={formattedUsers} />
  );
}
