import { useState } from "react";
import {
  User, Building2, Bike, Stethoscope, ArrowLeft,
  CheckCircle2, MapPin, CalendarCheck, FileText,
} from "lucide-react";
import logoSrc from "../assets/img/logo.jpeg";
import { authApi, session } from "../lib/api";

// ── Brand colors ──────────────────────────────────────────────────────────────
const BLUE      = "#1A3072";
const BLUE_DARK = "#122660";
const ORANGE    = "#F47920";

type UserRole = "patient" | "pharmacy" | "delivery" | "doctor";

const roles = [
  {
    key: "patient" as UserRole,
    icon: User,
    title: "Patient",
    description: "Rechercher des médicaments et passer des commandes",
    color: BLUE,
    bg: "#EEF1F8",
  },
  {
    key: "doctor" as UserRole,
    icon: Stethoscope,
    title: "Médecin",
    description: "Gérer vos patients et créer des ordonnances",
    color: BLUE,
    bg: "#EEF1F8",
  },
  {
    key: "pharmacy" as UserRole,
    icon: Building2,
    title: "Pharmacie",
    description: "Gérer votre stock et répondre aux commandes",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    key: "delivery" as UserRole,
    icon: Bike,
    title: "Livreur",
    description: "Prendre en charge et livrer les commandes",
    color: ORANGE,
    bg: "#FFF3E6",
  },
];

const features = [
  {
    icon: FileText,
    title: "Ordonnances digitales",
    desc: "Créez et partagez vos prescriptions en un instant",
    color: BLUE,
  },
  {
    icon: MapPin,
    title: "Pharmacies à proximité",
    desc: "Trouvez et commandez auprès des pharmacies proches",
    color: ORANGE,
  },
  {
    icon: CalendarCheck,
    title: "Rendez-vous en ligne",
    desc: "Planifiez vos consultations directement depuis l'app",
    color: BLUE_DARK,
  },
];

type Props = { onLogin: (role: UserRole, userId: string) => void };

function Field({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const SPECIALITES = [
  { value: "GENERALISTE",   label: "Médecin généraliste" },
  { value: "CARDIOLOGUE",   label: "Cardiologue" },
  { value: "DERMATOLOGUE",  label: "Dermatologue" },
  { value: "PEDIATRE",      label: "Pédiatre" },
  { value: "GYNECOLOGUE",   label: "Gynécologue" },
  { value: "NEUROLOGUE",    label: "Neurologue" },
  { value: "OPHTALMOLOGUE", label: "Ophtalmologue" },
  { value: "ORL",           label: "ORL" },
  { value: "PNEUMOLOGUE",   label: "Pneumologue" },
  { value: "AUTRE",         label: "Autre" },
];

export function LoginPage({ onLogin }: Props) {
  const [screen, setScreen] = useState<"splash" | "roles" | "form">("splash");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Champs partagés
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone]       = useState("");
  const [prenom, setPrenom]     = useState("");
  const [nom, setNom]           = useState("");

  // Médecin
  const [numeroOrdre,    setNumeroOrdre]    = useState("");
  const [specialite,     setSpecialite]     = useState("GENERALISTE");
  const [adresseCabinet, setAdresseCabinet] = useState("");

  // Pharmacie
  const [nomPharmacie,    setNomPharmacie]    = useState("");
  const [adressePharmacie,setAdressePharmacie]= useState("");
  const [livraisonActive, setLivraisonActive] = useState(false);

  // Livreur
  const [numeroIdentite,  setNumeroIdentite]  = useState("");
  const [typeAffiliation, setTypeAffiliation] = useState<"INDEPENDANT" | "PARTENAIRE">("INDEPENDANT");

  const currentRole = roles.find((r) => r.key === selectedRole);

  // ── Helpers UI ──────────────────────────────────────────────────────────────
  const inputCls = "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:bg-white transition";
  const focusStyle = (color: string) => (e: React.FocusEvent<HTMLElement>) => { (e.target as HTMLElement).style.borderColor = color; };
  const blurStyle  = (e: React.FocusEvent<HTMLElement>) => { (e.target as HTMLElement).style.borderColor = "#E5E7EB"; };

  const roleEnum = {
    patient:  "PATIENT",
    doctor:   "MEDECIN",
    pharmacy: "PHARMACIE",
    delivery: "LIVREUR",
  } as const;

  const saveSession = (id: string, role: UserRole) => {
    session.setToken("no-auth");
    session.setUserId(id);
    session.setRole(role);
    onLogin(role, id);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setError(null);
    try {
      if (authMode === "login") {
        const loginEmail = selectedRole === "pharmacy" ? nomPharmacie : email;
        const res = await authApi.login(loginEmail, password, roleEnum[selectedRole]);
        saveSession(res.id, selectedRole);
      } else {
        // Inscription : création selon le rôle
        if (selectedRole === "patient") {
          const p = await authApi.registerPatient({ nom, prenom, email, telephone: phone, password });
          saveSession(p.id, "patient");
        } else if (selectedRole === "doctor") {
          const p = await authApi.registerMedecin({
            nom, prenom, email, telephone: phone,
            numeroOrdre, specialite, adresseCabinet, password,
          });
          saveSession(p.id, "doctor");
        } else if (selectedRole === "pharmacy") {
          const p = await authApi.registerPharmacie({
            nom: nomPharmacie,
            adresse: adressePharmacie,
            email,
            telephone: phone,
            livraisonActive,
            latitude: 5.3196,
            longitude: -4.0167,
            password,
          });
          saveSession(p.id, "pharmacy");
        } else {
          const p = await authApi.registerLivreur({
            nom, prenom, email, telephone: phone,
            numeroIdentite, typeAffiliation, password,
          });
          saveSession(p.id, "delivery");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  // ── Screen 1 : Splash ──────────────────────────────────────────────────────

  if (screen === "splash") {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">

        {/* Logo — légèrement plus grand sur desktop */}
        <div className="flex flex-col items-center pt-10 pb-4 bg-white">
          <img
            src={logoSrc}
            alt="Digie-Pharma"
            className="w-44 h-44 lg:w-56 lg:h-56 object-contain"
          />
        </div>

        {/* Hero card bleu */}
        <div className="w-full px-5">
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <div
              className="px-6 py-7 lg:py-9 text-center"
              style={{ background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 100%)` }}
            >
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                Ne stressez plus pour<br />trouver vos médicaments.
              </h1>
              <p className="mt-2 text-sm lg:text-base leading-relaxed" style={{ color: "#B8C5E5" }}>
                Une seule recherche, plusieurs pharmacies<br />
                partenaires à proximité vous répondent.
              </p>
              <div className="flex justify-center items-center gap-1.5 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: ORANGE }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Features + CTA */}
        <div className="flex-1 flex flex-col justify-center py-7 gap-7 bg-white">
          <div className="w-full px-6 space-y-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: color + "18" }}
                >
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm lg:text-base font-semibold text-gray-900">{title}</p>
                  <p className="text-xs lg:text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 mt-1" style={{ color: ORANGE }} />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="w-full px-6 space-y-3">
            <button
              onClick={() => { setAuthMode("login"); setScreen("roles"); }}
              className="w-full py-4 lg:py-5 rounded-2xl text-white font-semibold text-base lg:text-lg transition active:scale-[0.98]"
              style={{
                background: `linear-gradient(90deg, ${BLUE_DARK}, ${BLUE})`,
                boxShadow: `0 4px 16px ${BLUE}50`,
              }}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setAuthMode("register"); setScreen("roles"); }}
              className="w-full py-3.5 lg:py-4 rounded-2xl font-semibold text-sm lg:text-base border-2 transition"
              style={{ borderColor: BLUE + "55", color: BLUE }}
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Screen 2 : Sélection du rôle ──────────────────────────────────────────

  if (screen === "roles") {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button
            onClick={() => setScreen("splash")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img
            src={logoSrc}
            alt="Digie-Pharma"
            className="h-8 lg:h-10 w-auto object-contain"
          />
          <div className="ml-auto">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: BLUE + "15", color: BLUE }}
            >
              {authMode === "login" ? "Connexion" : "Inscription"}
            </span>
          </div>
        </div>

        {/* Role grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col justify-center px-5 py-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Je suis un(e)…
            </p>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {roles.map((r) => {
                const active = selectedRole === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRole(r.key)}
                    className="flex flex-col items-center gap-3 p-5 lg:p-6 rounded-2xl border-2 transition text-center"
                    style={{
                      borderColor: active ? r.color : "#F3F4F6",
                      backgroundColor: active ? r.bg : "#FAFAFA",
                    }}
                  >
                    <div
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: active ? r.color + "22" : r.bg }}
                    >
                      <r.icon className="w-6 h-6 lg:w-7 lg:h-7" style={{ color: r.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm lg:text-base" style={{ color: active ? r.color : "#111827" }}>
                        {r.title}
                      </p>
                      <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5 leading-snug">
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-8 pt-3 border-t border-gray-100 bg-white">
          <button
            onClick={() => selectedRole && setScreen("form")}
            disabled={!selectedRole}
            className="w-full py-4 lg:py-5 rounded-2xl text-white font-semibold text-base lg:text-lg transition active:scale-[0.98]"
            style={
              selectedRole
                ? {
                    background: `linear-gradient(90deg, ${BLUE_DARK}, ${BLUE})`,
                    boxShadow: `0 4px 14px ${BLUE}40`,
                  }
                : { backgroundColor: "#E5E7EB", color: "#9CA3AF", cursor: "not-allowed" }
            }
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  // ── Screen 3 : Formulaire ──────────────────────────────────────────────────

  if (!currentRole) return null;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
        <button
          onClick={() => setScreen("roles")}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: currentRole.bg }}
        >
          <currentRole.icon className="w-4 h-4" style={{ color: currentRole.color }} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">
            {authMode === "login" ? "Connexion" : "Inscription"}
          </h2>
          <p className="text-xs font-medium" style={{ color: currentRole.color }}>
            {currentRole.title}
          </p>
        </div>
        <img
          src={logoSrc}
          alt=""
          className="ml-auto opacity-80 h-8 lg:h-9 w-auto object-contain"
        />
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">

          <form onSubmit={handleSubmit} className="space-y-4 w-full">

            {/* ── LOGIN ── */}
            {authMode === "login" && (
              <>
                {selectedRole === "pharmacy" ? (
                  <Field label="Email de la pharmacie" color={BLUE}>
                    <input type="email" value={nomPharmacie} onChange={(e) => setNomPharmacie(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="pharmacie@email.ci" required />
                  </Field>
                ) : (
                  <Field label="Adresse email" color={BLUE}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="votre@email.ci" required />
                  </Field>
                )}
                <Field label="Mot de passe" color={BLUE}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="••••••••" required />
                </Field>
              </>
            )}

            {/* ── REGISTER — Patient ── */}
            {authMode === "register" && selectedRole === "patient" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" color={BLUE}>
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="Konan" required />
                  </Field>
                  <Field label="Nom" color={BLUE}>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="Kouassi" required />
                  </Field>
                </div>
                <Field label="Téléphone" color={BLUE}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="+225 07 12 34 56 78" required />
                </Field>
                <Field label="Email (optionnel)" color={BLUE}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="votre@email.ci" />
                </Field>
                <Field label="Mot de passe" color={BLUE}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="••••••••" required />
                </Field>
              </>
            )}

            {/* ── REGISTER — Médecin ── */}
            {authMode === "register" && selectedRole === "doctor" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" color={BLUE}>
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="Marie-Claire" required />
                  </Field>
                  <Field label="Nom" color={BLUE}>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="Diomandé" required />
                  </Field>
                </div>
                <Field label="Email" color={BLUE}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="docteur@clinique.ci" required />
                </Field>
                <Field label="Téléphone" color={BLUE}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="+225 27 22 00 00 00" required />
                </Field>
                <Field label="Numéro d'ordre" color={BLUE}>
                  <input type="text" value={numeroOrdre} onChange={(e) => setNumeroOrdre(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="CI-MED-12345" required />
                </Field>
                <Field label="Spécialité" color={BLUE}>
                  <select value={specialite} onChange={(e) => setSpecialite(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle} required>
                    {SPECIALITES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Adresse du cabinet (optionnel)" color={BLUE}>
                  <input type="text" value={adresseCabinet} onChange={(e) => setAdresseCabinet(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="23 Boulevard de la République, Plateau" />
                </Field>
                <Field label="Mot de passe" color={BLUE}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="••••••••" required />
                </Field>
              </>
            )}

            {/* ── REGISTER — Pharmacie ── */}
            {authMode === "register" && selectedRole === "pharmacy" && (
              <>
                <Field label="Nom de la pharmacie" color={BLUE}>
                  <input type="text" value={nomPharmacie} onChange={(e) => setNomPharmacie(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="Pharmacie du Plateau" required />
                </Field>
                <Field label="Email" color={BLUE}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="pharmacie@email.ci" required />
                </Field>
                <Field label="Adresse" color={BLUE}>
                  <input type="text" value={adressePharmacie} onChange={(e) => setAdressePharmacie(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="23 Boulevard de la République, Plateau, Abidjan" required />
                </Field>
                <Field label="Téléphone (optionnel)" color={BLUE}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="+225 27 22 00 00 00" />
                </Field>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setLivraisonActive(!livraisonActive)}
                    className="w-11 h-6 rounded-full transition-colors flex items-center px-0.5"
                    style={{ backgroundColor: livraisonActive ? "#059669" : "#D1D5DB" }}
                  >
                    <div
                      className="w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: livraisonActive ? "translateX(20px)" : "translateX(0)" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Proposer la livraison à domicile</span>
                </label>
                <Field label="Mot de passe" color={BLUE}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="••••••••" required />
                </Field>
              </>
            )}

            {/* ── REGISTER — Livreur ── */}
            {authMode === "register" && selectedRole === "delivery" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prénom" color={BLUE}>
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="Jean-Baptiste" required />
                  </Field>
                  <Field label="Nom" color={BLUE}>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                      className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                      placeholder="Koné" required />
                  </Field>
                </div>
                <Field label="Email" color={BLUE}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="livreur@email.ci" required />
                </Field>
                <Field label="Téléphone" color={BLUE}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="+225 07 00 00 00 00" required />
                </Field>
                <Field label="N° Pièce d'identité / Permis (optionnel)" color={BLUE}>
                  <input type="text" value={numeroIdentite} onChange={(e) => setNumeroIdentite(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="CI19870012345678" />
                </Field>
                <Field label="Type d'affiliation" color={BLUE}>
                  <div className="flex gap-3">
                    {(["INDEPENDANT", "PARTENAIRE"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTypeAffiliation(t)}
                        className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition"
                        style={{
                          borderColor: typeAffiliation === t ? BLUE : "#E5E7EB",
                          backgroundColor: typeAffiliation === t ? BLUE + "12" : "#FAFAFA",
                          color: typeAffiliation === t ? BLUE : "#6B7280",
                        }}
                      >
                        {t === "INDEPENDANT" ? "Indépendant" : "Partenaire"}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Mot de passe" color={BLUE}>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputCls} onFocus={focusStyle(BLUE)} onBlur={blurStyle}
                    placeholder="••••••••" required />
                </Field>
              </>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 lg:py-5 rounded-2xl text-white font-semibold text-base lg:text-lg mt-2 transition active:scale-[0.98] disabled:opacity-60"
              style={{
                background: `linear-gradient(90deg, ${BLUE_DARK}, ${BLUE})`,
                boxShadow: `0 4px 16px ${BLUE}50`,
              }}
            >
              {loading ? "Chargement…" : authMode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="text-center mt-6 w-full">
            <button
              onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(null); }}
              className="text-sm lg:text-base text-gray-500 hover:underline"
            >
              {authMode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <span className="font-semibold" style={{ color: BLUE }}>
                {authMode === "login" ? "S'inscrire" : "Se connecter"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
