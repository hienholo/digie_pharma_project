import { X, Bell, type LucideIcon } from "lucide-react";
import type { NotificationAPI } from "../lib/types";

export type NotifDisplay = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
  color: string;
  raw: NotificationAPI;
};

type Props = {
  open: boolean;
  onClose: () => void;
  notifications: NotifDisplay[];
  onMarkAllRead: () => void;
  onNotifClick: (n: NotifDisplay) => void;
};

export function NotificationCenter({ open, onClose, notifications, onMarkAllRead, onNotifClick }: Props) {
  if (!open) return null;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900">Notifications</h2>
            {unread > 0 && <p className="text-xs text-gray-400 mt-0.5">{unread} non lue{unread > 1 ? "s" : ""}</p>}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-xs font-medium px-2 py-1 rounded-lg hover:bg-gray-50" style={{ color: "#1A3072" }}>
                Tout marquer lu
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => onNotifClick(n)}
                  className="w-full text-left rounded-2xl border p-3.5 flex items-start gap-3 transition"
                  style={{
                    borderColor: n.read ? "#F3F4F6" : "#D6DCF0",
                    backgroundColor: n.read ? "white" : "#EEF1F8",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: n.color + "1A" }}>
                    <Icon className="w-4 h-4" style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900" style={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: "#1A3072" }} />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
