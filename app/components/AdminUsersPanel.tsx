"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Search } from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
  authProvider: string;
  createdAt: string | null;
  company: { id: string; name: string; status: string } | null;
  teamInvitesCount: number;
};

export default function AdminUsersPanel({
  roleFilter,
  title,
}: {
  roleFilter?: string;
  title?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load users");
        return;
      }
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, q]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function patchUser(userId: string, body: Record<string, unknown>) {
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Update failed");
        return;
      }
      toast.success(data.message || "Updated");
      await load();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-[-0.04em]">
            {title || "Users"}
          </h1>
          <p className="mt-2 text-[#6b7a9e]">
            {roleFilter
              ? `All ${roleFilter} accounts on the platform.`
              : "Every account — seekers, recruiters, and admins."}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6b7a9e]" />
          <input
            value={q}
            onChange={(e) => {
              setLoading(true);
              setQ(e.target.value);
            }}
            placeholder="Search name, email, phone"
            className="w-full rounded-lg border border-[#cdd3e0] bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#dc2626]"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-[#6b7a9e]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : users.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-12 text-center text-[#6b7a9e]">
          No users found.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e6eaf2] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#eef1f7] bg-[#fffafa] text-xs uppercase tracking-[0.08em] text-[#6b7a9e]">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Auth</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#eef1f7] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#b91c1c]">{u.name}</p>
                    <p className="text-xs text-[#6b7a9e]">{u.email}</p>
                    {u.phone ? (
                      <p className="text-xs text-[#6b7a9e]">{u.phone}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 capitalize">{u.authProvider}</td>
                  <td className="px-4 py-3">
                    {u.company ? (
                      <span>
                        {u.company.name}
                        <span className="ml-1 text-xs text-[#6b7a9e]">
                          ({u.company.status})
                        </span>
                      </span>
                    ) : (
                      <span className="text-[#6b7a9e]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.isActive
                          ? "bg-[#fef2f2] text-[#b91c1c]"
                          : "bg-[#fff1f1] text-[#b42318]"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() =>
                          patchUser(u.id, {
                            action: u.isActive ? "deactivate" : "activate",
                          })
                        }
                        className="rounded-lg border border-[#cdd3e0] px-2.5 py-1.5 text-xs font-medium disabled:opacity-60"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {u.role !== "admin" ? (
                        <select
                          disabled={busyId === u.id}
                          defaultValue={u.role}
                          onChange={(e) =>
                            patchUser(u.id, {
                              action: "setRole",
                              role: e.target.value,
                            })
                          }
                          className="rounded-lg border border-[#cdd3e0] bg-white px-2 py-1.5 text-xs"
                        >
                          <option value="user">user</option>
                          <option value="recruiter">recruiter</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
