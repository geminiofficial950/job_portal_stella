"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X, CheckCheck } from "lucide-react";

type Notif = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string | null;
};

const DISMISS_SESSION = "stella-app-notif-banner-dismissed";

export default function ApplicationNotifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [banner, setBanner] = useState<Notif | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) return;

      const list = (data.notifications || []) as Notif[];
      setItems(list);
      setUnreadCount(Number(data.unreadCount) || 0);

      const dismissed =
        typeof window !== "undefined"
          ? sessionStorage.getItem(DISMISS_SESSION)
          : null;
      const latestUnread = list.find((n) => !n.read);
      if (latestUnread && dismissed !== latestUnread.id) {
        setBanner(latestUnread);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 45000);
    return () => clearInterval(id);
  }, [load]);

  async function markRead(ids?: string[]) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          ids?.length ? { ids } : { markAll: true }
        ),
      });
      await load();
    } catch {
      /* silent */
    }
  }

  function dismissBanner() {
    if (banner && typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_SESSION, banner.id);
    }
    setBanner(null);
  }

  return (
    <>
      {/* Floating bell */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-white shadow-lg hover:bg-[#0f2744]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className="absolute bottom-14 right-0 w-[340px] overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#eef1f7] px-4 py-3">
              <p className="text-sm font-bold text-[#1e293b]">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markRead()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a5f] hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
            </div>
            <ul className="max-h-[360px] overflow-y-auto">
              {items.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-[#6b7a9e]">
                  No notifications yet
                </li>
              ) : (
                items.map((n) => (
                  <li key={n.id} className="border-b border-[#f1f5f9] last:border-0">
                    <Link
                      href={n.link}
                      onClick={() => {
                        if (!n.read) void markRead([n.id]);
                        setOpen(false);
                        dismissBanner();
                      }}
                      className={`block px-4 py-3 transition-colors hover:bg-[#f8fafc] ${
                        n.read ? "opacity-70" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read ? (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1e3a5f]" />
                        ) : (
                          <span className="mt-1.5 h-2 w-2 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1e293b]">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-[#64748b]">
                            {n.message}
                          </p>
                          {n.createdAt ? (
                            <p className="mt-1 text-[10px] text-[#94a3b8]">
                              {new Date(n.createdAt).toLocaleString("en-AU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Top toast-style banner for latest unread */}
      {banner ? (
        <div className="fixed top-20 right-4 z-40 max-w-sm animate-[fadeIn_0.25s_ease]">
          <div className="rounded-2xl border border-[#e6eaf2] bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] text-white">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1e293b]">{banner.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                  {banner.message}
                </p>
                <Link
                  href={banner.link}
                  onClick={() => {
                    void markRead([banner.id]);
                    dismissBanner();
                  }}
                  className="mt-2 inline-block text-xs font-bold text-[#1e3a5f] hover:underline"
                >
                  View details →
                </Link>
              </div>
              <button
                type="button"
                onClick={dismissBanner}
                className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569]"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
