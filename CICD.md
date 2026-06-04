# CI/CD — LAHFIA Digie Pharma

Déploiement automatique sur VPS Hostinger via GitHub Actions + self-hosted runner.

---

## Architecture

```
Developer → git push → GitHub Actions
                            │
                    ┌───────┴────────┐
                    │                │
              Build & Docker      Build & Docker
              (ubuntu-latest)    (ubuntu-latest)
                    │                │
              Push GHCR          Push GHCR
              backend:latest     frontend:latest
                    │                │
                    └───────┬────────┘
                            │
                    Self-hosted runner
                    (VPS — github-runner)
                            │
                    docker pull + run
                            │
                    ┌───────┴────────┐
                    │                │
             backend:8080      frontend:3000
             (--network host)  (-p 3000:80)
                    │                │
                    └───────┬────────┘
                            │
                       nginx :80 / :443
                            │
                    https://digie-pharma.com
```

---

## Prérequis VPS

| Composant | Version | Rôle |
|---|---|---|
| Ubuntu | 22.04+ | OS |
| Docker | 24+ | Conteneurs |
| Nginx | 1.24+ | Reverse proxy |
| PostgreSQL | 16 | Base de données |
| Certbot | - | SSL Let's Encrypt |

---

## 1. Configuration initiale du VPS

### Installer les dépendances

```bash
apt update && apt upgrade -y
apt install -y docker.io nginx postgresql certbot python3-certbot-nginx
systemctl enable docker postgresql nginx
systemctl start docker postgresql nginx
```

### Créer la base de données

```bash
sudo -u postgres psql << 'EOF'
CREATE USER lahfia WITH PASSWORD 'lahfia@1er';
CREATE DATABASE lahfia_db OWNER lahfia;
GRANT ALL PRIVILEGES ON DATABASE lahfia_db TO lahfia;
EOF
```

Les tables sont créées automatiquement au démarrage du backend via `spring.jpa.hibernate.ddl-auto=update`.

### Créer le fichier d'environnement

```bash
mkdir -p /opt/app
cat > /opt/app/.env << 'EOF'
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/lahfia_db
SPRING_DATASOURCE_USERNAME=lahfia
SPRING_DATASOURCE_PASSWORD=lahfia@1er
EOF
```

> **Important** : Ne pas ajouter `SPRING_PROFILES_ACTIVE` — cela ferait chercher un fichier `application-{profil}.properties` inexistant et Spring Boot ne trouverait pas la datasource.

---

## 2. Self-hosted runner GitHub Actions

Le runner s'installe sur le VPS et exécute les jobs de déploiement directement — sans SSH, sans firewall à ouvrir.

### Pourquoi un self-hosted runner ?

Le VPS Hostinger bloque les connexions SSH entrantes depuis les IPs des runners GitHub (`ubuntu-latest`). Le self-hosted runner résout le problème : le runner tourne sur le VPS lui-même et tire les jobs depuis GitHub.

### Créer un utilisateur dédié

```bash
useradd -m -s /bin/bash github-runner
usermod -aG docker github-runner
chown root:github-runner /opt/app/.env
chmod 640 /opt/app/.env
```

> Le runner ne peut pas tourner en `root`. L'utilisateur `github-runner` doit être dans le groupe `docker` pour exécuter les commandes Docker sans sudo.

### Installer le runner

```bash
mkdir /home/github-runner/actions-runner
cd /home/github-runner/actions-runner
curl -o runner.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.322.0/actions-runner-linux-x64-2.322.0.tar.gz
tar xzf runner.tar.gz
chown -R github-runner:github-runner /home/github-runner/actions-runner
```

### Enregistrer le runner

1. Aller sur GitHub → **Settings → Actions → Runners → New self-hosted runner**
2. Sélectionner **Linux / x64**
3. Copier le token affiché (commence par `A...`)
4. Lancer la configuration :

```bash
su - github-runner -c "cd actions-runner && \
  ./config.sh --url https://github.com/hienholo/digie_pharma_project --token TON_TOKEN"
# Appuyer sur Entrée pour chaque question (valeurs par défaut)
```

### Démarrer en service systemd

```bash
cd /home/github-runner/actions-runner
./svc.sh install github-runner
./svc.sh start
systemctl status actions.runner.*
```

Le runner apparaît en vert **Idle** sur GitHub → Settings → Actions → Runners.

---

## 3. Secrets GitHub

Aller sur **GitHub → Settings → Secrets and variables → Actions**.

| Secret | Requis | Note |
|---|---|---|
| *(aucun)* | Non | Le runner est sur le VPS, pas de SSH nécessaire |

> `GITHUB_TOKEN` est injecté automatiquement par GitHub.

---

## 4. Workflows GitHub Actions

### Structure

```
.github/workflows/
├── backend.yml    # Build Maven + push GHCR + deploy backend
└── frontend.yml   # Build Vite + push GHCR + deploy frontend
```

### Déclencheurs

```yaml
on:
  push:
    branches: [develop]
    paths:
      - 'pharmacie_back/**'   # ou pharmacie_front/**
  workflow_dispatch:           # relance manuelle depuis GitHub UI
```

### Pipeline backend

```
1. Build (ubuntu-latest)
   mvn clean package -DskipTests

2. Docker Build & Push (ubuntu-latest)
   → ghcr.io/hienholo/backend:latest

3. Deploy (self-hosted — VPS)
   docker pull ghcr.io/hienholo/backend:latest
   docker stop --time=15 backend
   docker rm backend
   docker run -d --name backend --network host
     -e SERVER_PORT=8080
     --env-file /opt/app/.env

4. Health check
   sleep 20  ← attend le démarrage Spring Boot (~15-20s)
   curl http://localhost:8080/actuator/health → {"status":"UP"}
   (20 tentatives × 5s = 100s max)
```

### Pipeline frontend

```
1. Build (ubuntu-latest)
   npm ci && npm run build
   VITE_API_BASE_URL=/api/v1

2. Docker Build & Push (ubuntu-latest)
   → ghcr.io/hienholo/frontend:latest

3. Deploy (self-hosted — VPS)
   docker pull ghcr.io/hienholo/frontend:latest
   docker stop frontend && docker rm frontend
   docker run -d --name frontend -p 3000:80

4. Health check
   curl http://localhost:3000 → 200 OK
```

### Points clés

| Point | Explication |
|---|---|
| `runs-on: self-hosted` | Job deploy tourne directement sur le VPS |
| `--network host` | Backend partage le réseau du VPS → `localhost:5432` = PostgreSQL |
| `-p 3000:80` | Frontend nginx interne port 80 exposé sur 3000 côté host |
| `VITE_API_BASE_URL=/api/v1` | URL relative → nginx route `/api/` vers backend:8080 |
| `sleep 20` avant health check | Spring Boot prend ~15-20s à démarrer |
| `workflow_dispatch` | Relance manuelle sans modifier le code |

---

## 5. Dockerfiles

### Backend (`pharmacie_back/Dockerfile`)

```dockerfile
# Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend (`pharmacie_front/Dockerfile`)

```dockerfile
# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 6. Configuration Nginx (VPS)

Fichier : `/etc/nginx/sites-enabled/monapp`

```nginx
server {
    listen 80;
    server_name digie-pharma.com;

    # Frontend (conteneur port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API (conteneur --network host, port 8080)
    # SANS slash final → /api/v1/... est transmis tel quel au backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> **Piège fréquent** : `proxy_pass http://localhost:8080/;` (slash final) supprime le préfixe `/api/` — le backend reçoit `/v1/...` au lieu de `/api/v1/...` → 404/500.

---

## 7. SSL / HTTPS

```bash
certbot --nginx -d digie-pharma.com
# Choisir option 2 : redirection HTTP → HTTPS automatique
```

Certbot configure nginx automatiquement et renouvelle le certificat tous les 90 jours.

```bash
certbot renew --dry-run  # Tester le renouvellement
```

---

## 8. CORS (Cross-Origin Resource Sharing)

La configuration CORS est dans `pharmacie_back/src/main/java/lahfia/pharmacie/configs/WebSecurityConfig.java`.

```java
configuration.setAllowedOrigins(Arrays.asList(
    "https://digie-pharma.com",
    "http://digie-pharma.com",
    "http://localhost:5173",
    "http://localhost:3000"
));
```

> **Pourquoi** : le navigateur bloque les requêtes quand l'origine de la page (`https://digie-pharma.com`) diffère de l'API. Spring Security doit explicitement autoriser chaque domaine.

> **Piège** : Spring Security intercepte les requêtes OPTIONS (preflight CORS) avant tout filtre custom. La config CORS doit être dans le `SecurityFilterChain`, pas dans un `@Bean CorsFilter` séparé.

---

## 9. Variables d'environnement

### Frontend (build-time, injectées dans le Dockerfile)

| Variable | Valeur prod | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | URL relative → nginx route vers backend |

En dev local : fallback sur `http://localhost:3000/api/v1` dans `api.ts`.

### Backend (runtime via `/opt/app/.env`)

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/lahfia_db` |
| `SPRING_DATASOURCE_USERNAME` | `lahfia` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe DB |
| `SERVER_PORT` | `8080` (injecté via `-e` dans docker run) |

---

## 10. Commandes utiles

### Relancer un déploiement manuellement

```
GitHub → Actions → Backend CI/CD (ou Frontend CI/CD) → Run workflow → develop
```

### Vérifier l'état du système

```bash
docker ps                          # Conteneurs actifs
docker logs backend --tail 30      # Logs Spring Boot
docker logs frontend --tail 10     # Logs nginx frontend
systemctl status actions.runner.*  # Statut du runner
systemctl status nginx             # Statut nginx VPS
systemctl status postgresql        # Statut base de données
```

### Redémarrer un conteneur manuellement

```bash
# Backend
docker stop backend && docker rm backend
docker run -d --name backend --restart unless-stopped \
  --network host \
  -e SERVER_PORT=8080 \
  --env-file /opt/app/.env \
  ghcr.io/hienholo/backend:latest

# Frontend
docker stop frontend && docker rm frontend
docker run -d --name frontend --restart unless-stopped \
  -p 3000:80 \
  ghcr.io/hienholo/frontend:latest
```

### Renouveler le token du runner (expire après 1h)

```
GitHub → Settings → Actions → Runners → clic sur le runner → Remove
→ Recréer avec un nouveau token (New self-hosted runner)
```

---

## 11. Problèmes rencontrés et solutions

| Problème | Cause | Solution |
|---|---|---|
| SSH timeout depuis GitHub Actions | Firewall Hostinger bloque les IPs GitHub | Self-hosted runner sur le VPS |
| `Unable to determine Dialect` | `SPRING_PROFILES_ACTIVE=prod` sans fichier `application-prod.properties` | Supprimer `SPRING_PROFILES_ACTIVE` du `.env` |
| Backend ne voit pas PostgreSQL | Docker isole `localhost` du VPS | Ajouter `--network host` au `docker run` |
| `/api/v1/...` → 404 backend | Slash final dans `proxy_pass http://localhost:8080/;` | Retirer le slash final |
| `Invalid CORS request` | Origines prod non listées dans Spring Security | Ajouter `https://digie-pharma.com` dans `WebSecurityConfig` |
| Bean `corsConfigurationSource` dupliqué | Deux fichiers de config Security créés | Garder uniquement `WebSecurityConfig.java` existant |
| Health check échoue (timeout) | Spring Boot démarre en ~20s, health check trop rapide | Ajouter `sleep 20` + 20 tentatives dans le workflow |
| `--env-file permission denied` | User `github-runner` n'a pas accès à `/opt/app/.env` | `chown root:github-runner /opt/app/.env && chmod 640` |

---

## 12. Flux complet — de la modification au déploiement

```
1. git push origin develop
2. GitHub Actions détecte les fichiers modifiés (path filter)
3. Job "Build" (ubuntu-latest) :
   - Backend : mvn clean package -DskipTests
   - Frontend : npm ci && npm run build (VITE_API_BASE_URL=/api/v1)
4. Job "Docker Build & Push" (ubuntu-latest) :
   - docker buildx build → ghcr.io/hienholo/[backend|frontend]:latest
5. Job "Deploy" (self-hosted runner sur VPS) :
   - docker login ghcr.io (GITHUB_TOKEN)
   - docker pull image:latest
   - docker stop --time=15 + docker rm ancien conteneur
   - docker run nouveau conteneur
6. Health check :
   - Backend : sleep 20 → curl /actuator/health → {"status":"UP"}
   - Frontend : curl localhost:3000 → 200 OK
7. Disponible sur https://digie-pharma.com
```

**Durée totale** : ~4-6 minutes (Maven ~2min, Docker build ~1min, démarrage Spring Boot ~20s)
