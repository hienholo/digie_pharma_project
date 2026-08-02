import { useMemo, useState } from "react";
import {
  ChevronLeft, Phone, Package, CheckCircle2, Circle, Star, Bike, Car, Truck,
} from "lucide-react";
import type { DemandeAPI, CommandePatientAPI } from "../lib/types";
import { livraisonsApi } from "../lib/api";

type Props = {
  demandes: DemandeAPI[];
  commandes: CommandePatientAPI[];
  patientLocation: { lat: number; lng: number } | null;
  patientId: string;
  onClose: () => void;
};

const FRAIS_LIVRAISON = 300;

const VEHICULE_LABEL: Record<string, { label: string; icon: typeof Bike }> = {
  MOTO: { label: "Moto", icon: Bike },
  VOITURE: { label: "Voiture", icon: Car },
  VELO: { label: "Vélo", icon: Bike },
  TRICYCLE: { label: "Tricycle", icon: Truck },
};

type StatusKey = "attente" | "confirmee" | "preparation" | "livraison" | "livree" | "annulee";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string }> = {
  attente:     { label: "En attente",           color: "#F59E0B" },
  confirmee:   { label: "Confirmée",             color: "#4338CA" },
  preparation: { label: "En préparation",       color: "#7C3AED" },
  livraison:   { label: "En livraison",         color: "#F47920" },
  livree:      { label: "Livrée",               color: "#10B981" },
  annulee:     { label: "Annulée",              color: "#EF4444" },
};

type UnifiedOrder = {
  id: string;
  kind: "demande" | "commande";
  title: string;
  subtitle: string;
  ref: string;
  createdAt: string;
  status: StatusKey;
  raw: DemandeAPI | CommandePatientAPI;
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function commandeStatus(c: CommandePatientAPI): StatusKey {
  if (c.statut === "ANNULEE" || c.livraisonStatut === "ECHEC") return "annulee";
  if (c.modeObtention === "LIVRAISON") {
    if (c.livraisonStatut === "LIVREE") return "livree";
    if (c.livraisonStatut === "EN_COURS") return "livraison";
    if (c.livraisonStatut === "ASSIGNEE" || c.statut === "PRETE") return "preparation";
    return "confirmee";
  }
  if (c.statut === "TERMINEE") return "livree";
  if (c.statut === "PRETE") return "preparation";
  return "confirmee";
}

function buildUnifiedOrders(demandes: DemandeAPI[], commandes: CommandePatientAPI[]): UnifiedOrder[] {
  const commandeDemandeTimes = new Set(commandes.map((c) => c.demandeCreatedAt));

  const fromCommandes: UnifiedOrder[] = commandes.map((c) => ({
    id: c.id,
    kind: "commande",
    title: c.medicamentNoms[0] ?? "Médicament",
    subtitle: c.medicamentNoms.length > 1
      ? `${c.pharmacieNom} · ${c.medicamentNoms.length} articles`
      : `${c.pharmacieNom} · ${c.modeObtention === "LIVRAISON" ? "Livraison" : "Retrait"}`,
    ref: `#DP-${c.id.slice(-4).toUpperCase()}`,
    createdAt: c.createdAt,
    status: commandeStatus(c),
    raw: c,
  }));

  const fromDemandes: UnifiedOrder[] = demandes
    .filter((d) => !commandeDemandeTimes.has(d.createdAt))
    .map((d) => ({
      id: d.id,
      kind: "demande",
      title: d.medicamentRecherche ?? "Ordonnance",
      subtitle: "Envoyée aux pharmacies partenaires à proximité",
      ref: `#DP-${d.id.slice(-4).toUpperCase()}`,
      createdAt: d.createdAt,
      status: d.statut === "ANNULEE" ? "annulee" : "attente",
      raw: d,
    }));

  return [...fromCommandes, ...fromDemandes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Écran liste ──────────────────────────────────────────────────────────────

function ListeCommandes({ orders, onSelect, onClose }: {
  orders: UnifiedOrder[];
  onSelect: (o: UnifiedOrder) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<"toutes" | "encours" | "livrees" | "annulees">("toutes");

  const counts = {
    toutes: orders.length,
    encours: orders.filter((o) => ["attente", "confirmee", "preparation", "livraison"].includes(o.status)).length,
    livrees: orders.filter((o) => o.status === "livree").length,
    annulees: orders.filter((o) => o.status === "annulee").length,
  };

  const filtered = orders.filter((o) => {
    if (filter === "toutes") return true;
    if (filter === "encours") return ["attente", "confirmee", "preparation", "livraison"].includes(o.status);
    if (filter === "livrees") return o.status === "livree";
    return o.status === "annulee";
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mes commandes</h2>
          <p className="text-xs text-gray-400">Tous les statuts · suivi détaillé</p>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {([
          { key: "toutes" as const, label: "Toutes" },
          { key: "encours" as const, label: "En cours" },
          { key: "livrees" as const, label: "Livrées" },
          { key: "annulees" as const, label: "Annulées" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition"
            style={{
              backgroundColor: filter === key ? "#10B981" : "#F3F4F6",
              color: filter === key ? "white" : "#374151",
            }}
          >
            {label} · {counts[key]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center mt-4">
            <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">Aucune commande dans cette catégorie.</p>
          </div>
        ) : (
          filtered.map((o) => {
            const cfg = STATUS_CONFIG[o.status];
            return (
              <button
                key={o.id}
                onClick={() => onSelect(o)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition"
                style={{ borderLeft: `4px solid ${cfg.color}` }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="font-bold text-gray-900 text-sm truncate">{o.title}</p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0"
                    style={{ backgroundColor: cfg.color + "1A", color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{o.subtitle}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-gray-400">{o.ref} · {formatRelative(o.createdAt)}</p>
                  <span className="text-xs font-bold" style={{ color: "#10B981" }}>Suivre ›</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Écran de suivi détaillé ────────────────────────────────────────────────────

type TimelineStep = {
  label: string;
  subtitle: string;
  done: boolean;
  active?: boolean;
};

function RatingStars({ value, size = "w-5 h-5", onChange }: { value: number; size?: string; onChange?: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={size} fill={n <= value ? "#F59E0B" : "none"} style={{ color: n <= value ? "#F59E0B" : "#D1D5DB" }} />
        </button>
      ))}
    </div>
  );
}

function NoterLivreur({ livraisonId, patientId, onDone }: { livraisonId: string; patientId: string; onDone: (note: number) => void }) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (note < 1) return;
    setLoading(true);
    setError(null);
    try {
      await livraisonsApi.evaluer(livraisonId, patientId, note, commentaire.trim() || undefined);
      onDone(note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <p className="text-sm font-bold text-gray-900">Noter le livreur</p>
      <RatingStars value={note} onChange={setNote} />
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Un commentaire (optionnel)…"
        rows={2}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1A3072] resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={submit}
        disabled={note < 1 || loading}
        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
        style={{ backgroundColor: "#1A3072" }}
      >
        {loading ? "Envoi…" : "Envoyer la note"}
      </button>
    </div>
  );
}

function DetailCommande({ order, patientLocation, patientId, onBack }: {
  order: UnifiedOrder;
  patientLocation: { lat: number; lng: number } | null;
  patientId: string;
  onBack: () => void;
}) {
  const [justRated, setJustRated] = useState<number | null>(null);
  const cfg = STATUS_CONFIG[order.status];

  if (order.kind === "demande") {
    const d = order.raw as DemandeAPI;
    const steps: TimelineStep[] = [
      { label: "Demande envoyée", subtitle: `Envoyée à ${formatHeure(d.createdAt)} — en attente de réponse des pharmacies`, done: true, active: order.status !== "annulee" },
      { label: "Réponse d'une pharmacie", subtitle: "En attente", done: false },
    ];
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <Header order={order} cfg={cfg} onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <Timeline steps={steps} />
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-500">
            Aucune pharmacie n'a encore répondu à cette demande. Vous serez notifié dès qu'une réponse arrivera.
          </div>
        </div>
      </div>
    );
  }

  const c = order.raw as CommandePatientAPI;
  const reponseLabel = c.reponseType === "PARTIEL" ? "Partiellement disponible" : "Disponible";

  const steps: TimelineStep[] = [
    {
      label: "Demande envoyée",
      subtitle: `${c.nbPharmaciesContactees} pharmacie(s) contactée(s) · ${formatHeure(c.demandeCreatedAt)}`,
      done: true,
    },
    {
      label: `Confirmée par ${c.pharmacieNom}`,
      subtitle: c.reponseConfirmeeAt ? `${reponseLabel} · ${formatHeure(c.reponseConfirmeeAt)}` : "En attente",
      done: !!c.reponseConfirmeeAt,
    },
  ];

  if (c.modeObtention === "LIVRAISON") {
    steps.push({
      label: "Colis remis au livreur",
      subtitle: c.livraisonPriseEnChargeAt
        ? `Remis à ${c.livreurPrenom ?? ""} ${c.livreurNom ?? ""} · ${formatHeure(c.livraisonPriseEnChargeAt)}`
        : c.preteAt ? `Prêt depuis ${formatHeure(c.preteAt)}` : "En préparation",
      done: !!c.livraisonPriseEnChargeAt,
    });
    const distance = patientLocation && c.livreurLatitude != null && c.livreurLongitude != null
      ? haversineKm(patientLocation, { lat: c.livreurLatitude, lng: c.livreurLongitude })
      : null;
    const eta = distance != null ? Math.max(2, Math.round((distance / 25) * 60)) : null;
    steps.push({
      label: "En cours de livraison",
      subtitle: c.livraisonStatut === "LIVREE"
        ? "Livraison terminée"
        : c.livraisonPriseEnChargeAt
          ? (distance != null ? `À ${distance.toFixed(1)} km de vous · arrivée estimée ${eta} min` : "Le livreur est en route")
          : "En attente de prise en charge",
      done: c.livraisonStatut === "LIVREE" || c.livraisonStatut === "EN_COURS",
      active: c.livraisonStatut === "EN_COURS",
    });
    steps.push({
      label: "Livrée",
      subtitle: c.livraisonLivreeAt ? `Reçue à ${formatHeure(c.livraisonLivreeAt)}` : "Confirmation à la réception",
      done: c.livraisonStatut === "LIVREE",
    });
  } else {
    steps.push({
      label: "Prête à retirer",
      subtitle: c.preteAt ? `Disponible en pharmacie depuis ${formatHeure(c.preteAt)}` : "En préparation",
      done: !!c.preteAt,
      active: !!c.preteAt && c.statut !== "TERMINEE",
    });
    steps.push({
      label: "Récupérée",
      subtitle: c.statut === "TERMINEE" ? "Retrait confirmé" : "En attente de retrait",
      done: c.statut === "TERMINEE",
    });
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header order={order} cfg={cfg} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <Timeline steps={steps} />

        {c.modeObtention === "LIVRAISON" && c.livreurNom && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: "#F47920" }}>
              {c.livreurPrenom?.charAt(0)}{c.livreurNom?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{c.livreurPrenom} {c.livreurNom} · livreur</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {c.livreurTypeVehicule && VEHICULE_LABEL[c.livreurTypeVehicule] && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    {(() => { const Icon = VEHICULE_LABEL[c.livreurTypeVehicule].icon; return <Icon className="w-3 h-3" />; })()}
                    {VEHICULE_LABEL[c.livreurTypeVehicule].label}
                  </span>
                )}
                {c.livreurNoteMoyenne != null ? (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3" fill="#F59E0B" style={{ color: "#F59E0B" }} />
                    {c.livreurNoteMoyenne.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Livreur partenaire Digie-Pharma</span>
                )}
              </div>
            </div>
            {c.livreurTelephone && (
              <a href={`tel:${c.livreurTelephone}`} className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: "#10B981" }}>
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {c.modeObtention === "LIVRAISON" && c.livraisonStatut === "LIVREE" && c.livraisonId && (
          justRated != null || c.evaluationNote != null ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Votre note pour ce livreur</p>
              <RatingStars value={justRated ?? c.evaluationNote ?? 0} size="w-4 h-4" />
            </div>
          ) : (
            <NoterLivreur livraisonId={c.livraisonId} patientId={patientId} onDone={setJustRated} />
          )
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Médicament{c.medicamentNoms.length > 1 ? "s" : ""}</span>
            <span className="italic text-gray-400 text-right">
              {c.medicamentNoms.length > 0 ? c.medicamentNoms.join(", ") : "—"}
            </span>
          </div>
          {c.prix != null ? (
            <>
              <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                <span>Prix médicament</span>
                <span className="font-semibold text-gray-900">{c.prix.toLocaleString("fr-FR")} FCFA</span>
              </div>
              {c.modeObtention === "LIVRAISON" && (
                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison</span>
                  <span className="font-semibold text-gray-900">{FRAIS_LIVRAISON.toLocaleString("fr-FR")} FCFA</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total à payer</span>
                <span className="font-bold" style={{ color: "#1A3072" }}>
                  {(c.prix + (c.modeObtention === "LIVRAISON" ? FRAIS_LIVRAISON : 0)).toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-100">
              <span>Montant</span>
              <span className="italic">
                {c.modeObtention === "LIVRAISON" ? "Réglé à la livraison" : "À régler en pharmacie"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ order, cfg, onBack }: { order: UnifiedOrder; cfg: { label: string; color: string }; onBack: () => void }) {
  return (
    <div className="px-4 pt-5 pb-4 flex items-center justify-between border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 shrink-0">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 truncate">Commande {order.ref}</h2>
          <p className="text-xs text-gray-400 truncate">{order.title}</p>
        </div>
      </div>
      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0" style={{ backgroundColor: cfg.color + "1A", color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            {s.done ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: s.active ? "#F47920" : "#10B981" }} />
            ) : (
              <Circle className="w-5 h-5 shrink-0 text-gray-300" />
            )}
            {i < steps.length - 1 && (
              <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: s.done ? "#10B981" : "#E5E7EB", minHeight: 24 }} />
            )}
          </div>
          <div className="pb-4 min-w-0">
            <p className="text-sm font-bold" style={{ color: s.active ? "#F47920" : s.done ? "#111827" : "#9CA3AF" }}>
              {s.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: s.done ? "#6B7280" : "#9CA3AF" }}>{s.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────

export function MesCommandes({ demandes, commandes, patientLocation, patientId, onClose }: Props) {
  const [selected, setSelected] = useState<UnifiedOrder | null>(null);
  const orders = useMemo(() => buildUnifiedOrders(demandes, commandes), [demandes, commandes]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {selected ? (
        <DetailCommande order={selected} patientLocation={patientLocation} patientId={patientId} onBack={() => setSelected(null)} />
      ) : (
        <ListeCommandes orders={orders} onSelect={setSelected} onClose={onClose} />
      )}
    </div>
  );
}
