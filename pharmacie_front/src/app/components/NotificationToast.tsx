import { useEffect } from "react";
import { X, type LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  color: string;
  title: string;
  message: string;
  onView: () => void;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export function NotificationToast({ icon: Icon, color, title, message, onView, onDismiss, autoDismissMs = 7000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [onDismiss, autoDismissMs]);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-24px)] max-w-sm animate-in fade-in slide-in-from-top-2">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "1A" }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <button onClick={onDismiss} className="p-0.5 -mt-0.5 -mr-0.5 rounded-full hover:bg-gray-100 shrink-0">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{message}</p>
            <div className="flex gap-2 mt-2.5">
              <button
                onClick={onView}
                className="flex-1 py-1.5 rounded-lg text-white text-xs font-semibold"
                style={{ backgroundColor: color }}
              >
                Voir
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
