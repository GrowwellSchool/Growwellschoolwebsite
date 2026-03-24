"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browserClient";

import { CONTACT_MESSAGES_TABLE } from "../constants";
import { capitalizeFirstLetter } from "../utils";

type ContactMessageRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  replied: boolean;
  replied_at: string | null;
  replied_by: string | null;
  reply_note: string | null;
};

export function ContactMessagesViewer({ adminUserId }: { adminUserId?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [items, setItems] = useState<ContactMessageRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "replied">("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(CONTACT_MESSAGES_TABLE)
        .select("id, created_at, name, email, phone, subject, message, replied, replied_at, replied_by, reply_note")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setItems((data ?? []) as ContactMessageRow[]);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load messages" });
    } finally {
      setLoading(false);
    }
  }, []);

  const markReplied = useCallback(
    async (id: string, next: boolean) => {
      if (updating) return;
      setUpdating(id);
      setMessage(null);
      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase
          .from(CONTACT_MESSAGES_TABLE)
          .update({
            replied: next,
            replied_at: next ? new Date().toISOString() : null,
            replied_by: next ? (adminUserId ?? null) : null,
          })
          .eq("id", id);

        if (error) {
          setMessage({ type: "error", text: error.message });
          return;
        }
        setItems((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  replied: next,
                  replied_at: next ? new Date().toISOString() : null,
                  replied_by: next ? (adminUserId ?? null) : null,
                }
              : row,
          ),
        );
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update message" });
      } finally {
        setUpdating(null);
      }
    },
    [adminUserId, updating],
  );

  const deleteMessage = useCallback(async (id: string) => {
    if (deleting) return;
    setDeleting(id);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from(CONTACT_MESSAGES_TABLE).delete().eq("id", id);
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setItems((prev) => prev.filter((row) => row.id !== id));
      setMessage({ type: "success", text: "Message deleted successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete message" });
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  }, [deleting]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredMessages = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byStatus =
      statusFilter === "pending"
        ? items.filter((m) => !m.replied)
        : statusFilter === "replied"
          ? items.filter((m) => m.replied)
          : items;

    if (!q) return byStatus;
    return byStatus.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone ?? "").toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q),
    );
  }, [items, query, statusFilter]);

  const totals = useMemo(() => {
    let pending = 0;
    let replied = 0;
    for (const row of items) {
      if (row.replied) replied += 1;
      else pending += 1;
    }
    return { pending, replied, total: items.length };
  }, [items]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredMessages.length, totalPages, page]);

  // Pagination component
  function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemName = "items",
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemName?: string;
  }) {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t mt-4">
        <div className="text-sm text-gray-500">
          Showing page {currentPage} of {totalPages} ({totalItems} {itemName})
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                currentPage === p ? "bg-school-green text-white" : "border hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <button className="border px-3 py-2 rounded-lg text-sm w-full sm:w-auto" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name/email/phone/subject/message..."
              className="w-full sm:flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/30"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm border ${statusFilter === "all" ? "bg-school-green text-white border-school-green" : "bg-white text-gray-700"}`}
            >
              All ({totals.total})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-2 rounded-lg text-sm border ${statusFilter === "pending" ? "bg-school-green text-white border-school-green" : "bg-white text-gray-700"}`}
            >
              Pending ({totals.pending})
            </button>
            <button
              onClick={() => setStatusFilter("replied")}
              className={`px-3 py-2 rounded-lg text-sm border ${statusFilter === "replied" ? "bg-school-green text-white border-school-green" : "bg-white text-gray-700"}`}
            >
              Replied ({totals.replied})
            </button>
          </div>
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">
          No contact messages yet.
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="border rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 border-b">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedMessages.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-gray-50/60">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.email}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{capitalizeFirstLetter(row.subject)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.replied ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2.5 py-1 text-xs font-semibold">
                          <CheckCircle size={14} />
                          Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 min-w-[200px] max-w-[420px] whitespace-pre-wrap break-words">
                      {row.message}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => markReplied(row.id, !row.replied)}
                          disabled={updating !== null}
                          className={`px-3 py-2 rounded-lg text-sm border ${
                            row.replied ? "bg-white text-gray-700" : "bg-school-green text-white border-school-green"
                          }`}
                        >
                          {updating === row.id ? "Saving..." : row.replied ? "Mark Pending" : "Mark Replied"}
                        </button>
                        {confirmDelete === row.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteMessage(row.id)}
                              disabled={deleting === row.id}
                              className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                            >
                              {deleting === row.id ? "Deleting..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              disabled={deleting === row.id}
                              className="px-3 py-2 rounded-lg text-sm border bg-white text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(row.id)}
                            disabled={deleting !== null || updating !== null}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50"
                            title="Delete message"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && paginatedMessages.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">No messages found.</div>
            ) : null}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filteredMessages.length}
              itemName="messages"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
