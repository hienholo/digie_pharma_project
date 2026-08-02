import { useCallback, useEffect, useRef, useState } from "react";

type LiveAlertsOptions<T> = {
  storageKey: string;
  poll: () => Promise<T[]>;
  getId: (item: T) => string;
  intervalMs?: number;
  enabled?: boolean;
};

// L'app monte le tableau de bord deux fois en parallèle (variante mobile + desktop,
// basculées en CSS display:none) : ce verrou évite un bip/push en double sur le même événement.
let lastAlertAt = 0;
function claimAlertSlot(): boolean {
  const now = Date.now();
  if (now - lastAlertAt < 1000) return false;
  lastAlertAt = now;
  return true;
}

function playBeep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Web Audio indisponible : silencieux
  }
}

function readSoundPref(storageKey: string): boolean {
  try {
    return localStorage.getItem(`alert_sound_${storageKey}`) !== "0";
  } catch {
    return true;
  }
}

/**
 * Sondage périodique d'une liste (notifications, livraisons disponibles…) avec
 * détection des nouveaux éléments pour afficher un toast + jouer un son.
 * Le premier chargement n'affiche jamais de toast (sert de référence).
 */
export function useLiveAlerts<T>(opts: LiveAlertsOptions<T>) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const [items, setItems] = useState<T[]>([]);
  const [newItem, setNewItem] = useState<T | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState(() => readSoundPref(opts.storageKey));
  const seenIds = useRef<Set<string> | null>(null);

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    try {
      localStorage.setItem(`alert_sound_${optsRef.current.storageKey}`, v ? "1" : "0");
    } catch {
      // stockage indisponible : préférence non persistée
    }
  }, []);

  const refresh = useCallback(async () => {
    const { poll, getId, enabled } = optsRef.current;
    if (enabled === false) return;
    try {
      const data = await poll();
      setItems(data);
      const ids = new Set(data.map(getId));
      if (seenIds.current === null) {
        seenIds.current = ids;
        return;
      }
      const fresh = data.filter((d) => !seenIds.current!.has(getId(d)));
      seenIds.current = ids;
      if (fresh.length > 0) {
        setNewItem(fresh[fresh.length - 1]);
        if (claimAlertSlot()) {
          if (readSoundPref(optsRef.current.storageKey)) playBeep();
          if (document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
            try { new Notification("Digie-Pharma", { body: "Nouvelle activité — ouvrez l'application" }); } catch { /* ignore */ }
          }
        }
      }
    } catch {
      // Échec de sondage : on réessaiera au prochain intervalle
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, opts.intervalMs ?? 12000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled, refresh]);

  return {
    items,
    newItem,
    dismissNew: () => setNewItem(null),
    soundEnabled,
    setSoundEnabled,
    refresh,
  };
}

export function requestNotificationPermission() {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}
