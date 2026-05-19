import { Check, Clock, Package, Truck, Home } from "lucide-react";

export type OrderStep = "confirmed" | "preparing" | "ready" | "delivering" | "done";

const steps: { key: OrderStep; label: string; icon: any }[] = [
  { key: "confirmed", label: "Confirmée", icon: Check },
  { key: "preparing", label: "En préparation", icon: Clock },
  { key: "ready", label: "Prête", icon: Package },
  { key: "delivering", label: "En livraison", icon: Truck },
  { key: "done", label: "Livrée", icon: Home },
];

type Props = {
  current: OrderStep;
  mode: "pickup" | "delivery";
};

export function OrderStatus({ current, mode }: Props) {
  const filtered =
    mode === "pickup" ? steps.filter((s) => s.key !== "delivering") : steps;
  const currentIdx = filtered.findIndex((s) => s.key === current);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="mb-4">Statut de la commande</h3>
      <div className="flex items-start justify-between gap-2">
        {filtered.map((s, i) => {
          const done = i <= currentIdx;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: done ? "#10B981" : "#E5E7EB",
                  color: done ? "white" : "#6B7280",
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className="mt-2 text-xs"
                style={{ color: done ? "#111827" : "#9CA3AF" }}
              >
                {s.label}
              </span>
              {i < filtered.length - 1 && (
                <div
                  className="hidden"
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
