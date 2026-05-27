-- ============================================================
-- LAHFIA / Digie-Pharma — Schéma PostgreSQL complet
-- Généré depuis les entités JPA du backend Spring Boot
-- À exécuter sur une DB vierge : psql -U admin -d lahfia_db -f schema.sql
-- ============================================================

-- Extension UUID (si non disponible)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. patients ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nom           VARCHAR(255)  NOT NULL,
    prenom        VARCHAR(255)  NOT NULL,
    telephone     VARCHAR(20)   NOT NULL UNIQUE,
    email         VARCHAR(255)  UNIQUE,
    password_hash VARCHAR(255),
    latitude      DOUBLE PRECISION,
    longitude     DOUBLE PRECISION,
    created_at    TIMESTAMP     DEFAULT NOW()
);

-- ── 2. pharmacies ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacies (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nom              VARCHAR(255)  NOT NULL,
    adresse          VARCHAR(500)  NOT NULL,
    latitude         DOUBLE PRECISION NOT NULL,
    longitude        DOUBLE PRECISION NOT NULL,
    email            VARCHAR(255)  UNIQUE,
    telephone        VARCHAR(20),
    password_hash    VARCHAR(255),
    livraison_active BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP     DEFAULT NOW()
);

-- ── 3. medecins ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medecins (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nom             VARCHAR(255) NOT NULL,
    prenom          VARCHAR(255) NOT NULL,
    telephone       VARCHAR(20)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    numero_ordre    VARCHAR(50)  NOT NULL UNIQUE,
    specialite      VARCHAR(50)  NOT NULL DEFAULT 'GENERALISTE'
                        CHECK (specialite IN (
                            'GENERALISTE','CARDIOLOGUE','DERMATOLOGUE','PEDIATRE',
                            'GYNECOLOGUE','OPHTALMOLOGUE','ORL','PNEUMOLOGUE',
                            'NEUROLOGUE','AUTRE'
                        )),
    statut          VARCHAR(30)  NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION'
                        CHECK (statut IN ('EN_ATTENTE_VALIDATION','ACTIF','SUSPENDU')),
    adresse_cabinet VARCHAR(500),
    password_hash   VARCHAR(255),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ── 4. livreurs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS livreurs (
    id                        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nom                       VARCHAR(255) NOT NULL,
    prenom                    VARCHAR(255) NOT NULL,
    telephone                 VARCHAR(20)  NOT NULL UNIQUE,
    email                     VARCHAR(255) NOT NULL UNIQUE,
    numero_identite           VARCHAR(50)  UNIQUE,
    statut                    VARCHAR(30)  NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION'
                                  CHECK (statut IN ('EN_ATTENTE_VALIDATION','ACTIF','SUSPENDU')),
    type_affiliation          VARCHAR(20)  NOT NULL DEFAULT 'INDEPENDANT'
                                  CHECK (type_affiliation IN ('INDEPENDANT','PARTENAIRE')),
    partenaire_logistique_id  UUID,
    disponibilite_statut      VARCHAR(20)  NOT NULL DEFAULT 'HORS_LIGNE'
                                  CHECK (disponibilite_statut IN ('DISPONIBLE','EN_COURSE','HORS_LIGNE')),
    password_hash             VARCHAR(255),
    latitude                  DOUBLE PRECISION,
    longitude                 DOUBLE PRECISION,
    created_at                TIMESTAMP    DEFAULT NOW()
);

-- ── 5. medicaments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medicaments (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_commercial  VARCHAR(255) NOT NULL,
    nom_generique   VARCHAR(255),
    dosage          VARCHAR(100),
    forme           VARCHAR(100)
);

-- ── 6. ordonnances ────────────────────────────────────────────
--   source = UPLOAD  : photo patient, analysée OCR
--   source = MEDECIN : rédigée directement par le médecin
CREATE TABLE IF NOT EXISTS ordonnances (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id  UUID         REFERENCES medecins(id) ON DELETE SET NULL,
    image_url   VARCHAR(500),
    source      VARCHAR(20)  NOT NULL CHECK (source IN ('UPLOAD','MEDECIN')),
    statut      VARCHAR(30)  NOT NULL DEFAULT 'EN_ATTENTE_OCR'
                    CHECK (statut IN ('EN_ATTENTE_OCR','ANALYSEE','CORRIGEE','NUMERIQUE')),
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ── 7. ordonnance_medicaments ─────────────────────────────────
--   Médicaments détectés par OCR sur une ordonnance uploadée
CREATE TABLE IF NOT EXISTS ordonnance_medicaments (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    ordonnance_id         UUID         NOT NULL REFERENCES ordonnances(id) ON DELETE CASCADE,
    medicament_id         UUID         NOT NULL REFERENCES medicaments(id),
    quantite              VARCHAR(50),
    corrige_manuellement  BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ── 8. lignes_ordonnance ──────────────────────────────────────
--   Lignes rédigées par un médecin (posologie précise)
CREATE TABLE IF NOT EXISTS lignes_ordonnance (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    ordonnance_id  UUID         NOT NULL REFERENCES ordonnances(id) ON DELETE CASCADE,
    medicament_id  UUID         NOT NULL REFERENCES medicaments(id),
    quantite       INTEGER      NOT NULL,
    posologie      VARCHAR(255),
    duree          VARCHAR(100),
    instructions   VARCHAR(500)
);

-- ── 9. demandes ───────────────────────────────────────────────
--   type = MEDICAMENT  : recherche libre
--   type = ORDONNANCE  : liée à une ordonnance
CREATE TABLE IF NOT EXISTS demandes (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id     UUID         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    ordonnance_id  UUID         REFERENCES ordonnances(id) ON DELETE SET NULL,
    type           VARCHAR(20)  NOT NULL CHECK (type IN ('MEDICAMENT','ORDONNANCE')),
    statut         VARCHAR(30)  NOT NULL DEFAULT 'EN_COURS'
                       CHECK (statut IN ('EN_COURS','REPONSE_RECUE','VALIDEE','ANNULEE')),
    created_at     TIMESTAMP    DEFAULT NOW()
);

-- ── 10. demande_pharmacie_reponses ────────────────────────────
CREATE TABLE IF NOT EXISTS demande_pharmacie_reponses (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id     UUID          NOT NULL REFERENCES demandes(id) ON DELETE CASCADE,
    pharmacie_id   UUID          NOT NULL REFERENCES pharmacies(id),
    reponse        VARCHAR(20)   CHECK (reponse IN ('DISPONIBLE','NON_DISPONIBLE','PARTIEL')),
    detail_partiel VARCHAR(1000),
    repondu_at     TIMESTAMP
);

-- ── 11. commandes ─────────────────────────────────────────────
--   Une commande = une demande acceptée par une pharmacie
CREATE TABLE IF NOT EXISTS commandes (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id      UUID         NOT NULL UNIQUE REFERENCES demandes(id),
    pharmacie_id    UUID         NOT NULL REFERENCES pharmacies(id),
    mode_obtention  VARCHAR(20)  NOT NULL CHECK (mode_obtention IN ('RETRAIT','LIVRAISON')),
    statut          VARCHAR(30)  NOT NULL DEFAULT 'EN_PREPARATION'
                        CHECK (statut IN ('EN_PREPARATION','PRETE','EN_LIVRAISON','TERMINEE','ANNULEE')),
    mode_paiement   VARCHAR(30)  CHECK (mode_paiement IN ('A_LA_LIVRAISON','EN_LIGNE')),
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ── 12. commande_medicaments ──────────────────────────────────
CREATE TABLE IF NOT EXISTS commande_medicaments (
    id             UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    commande_id    UUID     NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
    medicament_id  UUID     NOT NULL REFERENCES medicaments(id),
    quantite       INTEGER  NOT NULL,
    disponible     BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ── 13. livraisons ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS livraisons (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    commande_id         UUID         NOT NULL UNIQUE REFERENCES commandes(id),
    livreur_id          UUID         REFERENCES livreurs(id) ON DELETE SET NULL,
    statut              VARCHAR(30)  NOT NULL DEFAULT 'EN_ATTENTE_LIVREUR'
                            CHECK (statut IN (
                                'EN_ATTENTE_LIVREUR','ASSIGNEE','EN_COURS','LIVREE','ECHEC'
                            )),
    adresse_livraison   VARCHAR(500),
    note_livraison      VARCHAR(500),
    assignee_at         TIMESTAMP,
    prise_en_charge_at  TIMESTAMP,
    livree_at           TIMESTAMP,
    created_at          TIMESTAMP    DEFAULT NOW()
);

-- ── 14. notifications ─────────────────────────────────────────
--   destinataire_id pointe vers patients.id ou pharmacies.id selon type_destinataire
CREATE TABLE IF NOT EXISTS notifications (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    destinataire_id   UUID         NOT NULL,
    type_destinataire VARCHAR(20)  NOT NULL CHECK (type_destinataire IN ('PATIENT','PHARMACIE')),
    type_evenement    VARCHAR(30)  NOT NULL CHECK (type_evenement IN (
                          'DEMANDE_ENVOYEE','REPONSE_PHARMACIE','COMMANDE_VALIDEE',
                          'COMMANDE_PRETE','LIVRAISON_EN_COURS','LIVRAISON_TERMINEE','RETRAIT_PRET'
                      )),
    message           VARCHAR(500) NOT NULL,
    lue               BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP    DEFAULT NOW()
);

-- ── 15. disponibilites_medecin ────────────────────────────────
--   Créneaux hebdomadaires récurrents du médecin
CREATE TABLE IF NOT EXISTS disponibilites_medecin (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    medecin_id   UUID         NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
    jour_semaine VARCHAR(20)  NOT NULL CHECK (jour_semaine IN (
                     'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'
                 )),
    heure_debut  TIME         NOT NULL,
    heure_fin    TIME         NOT NULL,
    actif        BOOLEAN      NOT NULL DEFAULT TRUE,
    UNIQUE (medecin_id, jour_semaine, heure_debut)
);

-- ── 16. indisponibilites_ponctuelles ──────────────────────────
--   Absences/congés ponctuels du médecin (priorité sur les créneaux récurrents)
CREATE TABLE IF NOT EXISTS indisponibilites_ponctuelles (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    medecin_id  UUID         NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
    date_debut  DATE         NOT NULL,
    date_fin    DATE         NOT NULL,
    motif       VARCHAR(255)
);

-- ── 17. rendez_vous ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rendez_vous (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id  UUID         NOT NULL REFERENCES medecins(id) ON DELETE CASCADE,
    date_rdv    DATE         NOT NULL,
    heure       VARCHAR(8)   NOT NULL,
    statut      VARCHAR(20)  NOT NULL DEFAULT 'EN_ATTENTE'
                    CHECK (statut IN ('EN_ATTENTE','CONFIRME','COMPLETE','ANNULE')),
    motif       VARCHAR(500),
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ── Index de performance ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ordonnances_patient        ON ordonnances(patient_id);
CREATE INDEX IF NOT EXISTS idx_ordonnances_medecin        ON ordonnances(medecin_id);
CREATE INDEX IF NOT EXISTS idx_demandes_patient           ON demandes(patient_id);
CREATE INDEX IF NOT EXISTS idx_demandes_statut            ON demandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_pharmacie        ON commandes(pharmacie_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut           ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_livraisons_livreur         ON livraisons(livreur_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_statut          ON livraisons(statut);
CREATE INDEX IF NOT EXISTS idx_notifications_destinataire ON notifications(destinataire_id);
CREATE INDEX IF NOT EXISTS idx_disponibilites_medecin     ON disponibilites_medecin(medecin_id);
CREATE INDEX IF NOT EXISTS idx_reponses_demande           ON demande_pharmacie_reponses(demande_id);
CREATE INDEX IF NOT EXISTS idx_reponses_pharmacie         ON demande_pharmacie_reponses(pharmacie_id);
CREATE INDEX IF NOT EXISTS idx_rdv_medecin                ON rendez_vous(medecin_id);
CREATE INDEX IF NOT EXISTS idx_rdv_patient                ON rendez_vous(patient_id);
CREATE INDEX IF NOT EXISTS idx_rdv_statut                 ON rendez_vous(statut);
