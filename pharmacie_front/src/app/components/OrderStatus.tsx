import { Check, Clock, Package, Truck, Home } from "lucide-react";

export type OrderStep = "confirmed" | "preparing" | "ready" | "delivering" | "done";

const steps: { key: OrderStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "confirmed",  label: "Confirmée",    icon: Check },
  { key: "preparing",  label: "En préparation", icon: Clock },
  { key: "ready",      label: "Prête",         icon: Package },
  { key: "delivering", label: "En livraison",  icon: Truck },
  { key: "done",       label: "Livrée",        icon: Home },
];

const stepLabelsRetrait: Partial<Record<OrderStep, string>> = {
  ready: "Prête à retirer",
  done:  "Récupérée",
};

type Props = {
  current: OrderStep;
  mode: "pickup" | "delivery";
};

export function OrderStatus({ current, mode }: Props) {
  const filtered = mode === "pickup" ? steps.filter((s) => s.key !== "delivering") : steps;
  const currentIdx = filtered.findIndex((s) => s.key === current);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Statut de la commande</h3>
      <div className="flex items-start justify-between gap-1">
        {filtered.map((s, i) => {
          const done    = i <= currentIdx;
          const active  = i === currentIdx;
          const Icon    = s.icon;
          const label   = (mode === "pickup" && stepLabelsRetrait[s.key]) ?? s.label;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center text-center gap-1 relative">
              {/* Connecteur */}
              {i > 0 && (
                <div
                  className="absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2"
                  style={{ backgroundColor: i <= currentIdx ? "#1A3072" : "#E5E7EB" }}
                />
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all"
                style={{
                  backgroundColor: done ? "#1A3072" : "#E5E7EB",
                  boxShadow: active ? "0 0 0 3px #1A307230" : "none",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: done ? "white" : "#9CA3AF" }} />
              </div>
              <span className="text-[10px] leading-tight" style={{ color: done ? "#1A3072" : "#9CA3AF", fontWeight: done ? 600 : 400 }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
