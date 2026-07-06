"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  subscription?: { plan: string } | null;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const api = useApi();
  const { data: users, refetch } = useResource<AdminUser[]>(`/api/admin/users?search=${encodeURIComponent(search)}`);

  async function handleDelete(id: string) {
    await api.del(`/api/admin/users/${id}`);
    refetch();
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((user) => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="p-3">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <Badge variant="outline">{user.subscription?.plan ?? "FREE"}</Badge>
                  </td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
