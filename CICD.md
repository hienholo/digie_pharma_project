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
                    │                │
                    └───────┬────────┘
                            │
                       nginx :80 / :443
                            │
                    digie-pharma.com
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

### Créer le fichier d'environnement

```bash
mkdir -p /opt/app
cat > /opt/app/.env << 'EOF'
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/lahfia_db
SPRING_DATASOURCE_USERNAME=lahfia
SPRING_DATASOURCE_PASSWORD=lahfia@1er
EOF
```

---

## 2. Self-hosted runner GitHub Actions

Le runner s'installe sur le VPS et exécute les jobs de déploiement directement — sans SSH, sans firewall à ouvrir.

### Créer un utilisateur dédié

```bash
useradd -m -s /bin/bash github-runner
usermod -aG docker github-runner
chown root:github-runner /opt/app/.env
chmod 640 /opt/app/.env
```

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
2. Copier le token affiché
3. Lancer la configuration :

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

Aller sur **GitHub → Settings → Secrets and variables → Actions** et créer :

| Secret | Description | Exemple |
|---|---|---|
| *(aucun requis)* | Le runner est sur le VPS, pas de SSH | - |

> `GITHUB_TOKEN` est injecté automatiquement par GitHub — pas à créer.

---

## 4. Workflows GitHub Actions

### Structure

```
.github/workflows/
├── backend.yml    # Build + push + deploy backend Java
└── frontend.yml   # Build + push + deploy frontend React
```

### Déclencheurs

Les deux workflows se déclenchent :
- `git push` sur la branche `develop` (si fichiers du projet modifiés)
- Manuellement via **Actions → Run workflow**

### Pipeline backend (`pharmacie_back/`)

```
Build Maven (ubuntu-latest)
    ↓
Docker build + push → ghcr.io/hienholo/backend:latest (ubuntu-latest)
    ↓
Deploy (self-hosted)
  docker pull ghcr.io/hienholo/backend:latest
  docker stop/rm backend
  docker run --network host --env-file /opt/app/.env
    ↓
Health check → curl http://localhost:8080/actuator/health
```

### Pipeline frontend (`pharmacie_front/`)

```
Build Vite (ubuntu-latest)
  VITE_API_BASE_URL=/api/v1
    ↓
Docker build + push → ghcr.io/hienholo/frontend:latest (ubuntu-latest)
    ↓
Deploy (self-hosted)
  docker pull ghcr.io/hienholo/frontend:latest
  docker stop/rm frontend
  docker run -p 3000:80
    ↓
Health check → curl http://localhost:3000
```

### Points clés des workflows

| Point | Explication |
|---|---|
| `runs-on: self-hosted` | Job deploy tourne sur le VPS |
| `--network host` | Backend accède à PostgreSQL sur `localhost:5432` |
| `-p 3000:80` | Frontend nginx écoute sur 80 en interne, exposé sur 3000 |
| `VITE_API_BASE_URL=/api/v1` | URL relative → nginx route vers le backend |
| `workflow_dispatch` | Permet de relancer manuellement depuis GitHub |

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

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # IMPORTANT : pas de slash final → /api/v1/... est transmis tel quel
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> **Attention** : `proxy_pass http://localhost:8080/;` (avec `/` final) supprime le préfixe `/api/` — toujours utiliser sans slash final.

---

## 7. SSL / HTTPS

```bash
certbot --nginx -d digie-pharma.com
# Choisir option 2 (redirection HTTP → HTTPS)
```

Certbot modifie automatiquement la config nginx et renouvelle le certificat tous les 90 jours.

Vérifier le renouvellement automatique :
```bash
certbot renew --dry-run
```

---

## 8. Commandes utiles

### Relancer un déploiement manuellement

```
GitHub → Actions → Backend CI/CD (ou Frontend CI/CD) → Run workflow → develop
```

### Vérifier les conteneurs sur le VPS

```bash
docker ps
docker logs backend --tail 50
docker logs frontend --tail 20
```

### Redémarrer un conteneur manuellement

```bash
# Backend
docker stop backend && docker rm backend
docker run -d --name backend --restart unless-stopped \
  --network host -e SERVER_PORT=8080 \
  --env-file /opt/app/.env \
  ghcr.io/hienholo/backend:latest

# Frontend
docker stop frontend && docker rm frontend
docker run -d --name frontend --restart unless-stopped \
  -p 3000:80 ghcr.io/hienholo/frontend:latest
```

### Vérifier le statut du runner

```bash
systemctl status actions.runner.*
```

### Renouveler le token du runner (expire après 1h)

Sur GitHub → Settings → Actions → Runners → clic sur le runner → **Remove** → puis recréer avec un nouveau token.

---

## 9. Variables d'environnement

### Frontend (build-time)

| Variable | Valeur prod | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | URL relative, nginx route vers backend |

En dev local : `http://localhost:3000/api/v1` (fallback dans `api.ts`).

### Backend (runtime via `/opt/app/.env`)

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | URL PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur DB |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe DB |
| `SERVER_PORT` | Port Spring Boot (8080 en prod) |

---

## 10. Flux complet — de la modification au déploiement

```
1. Developer : git push origin develop
2. GitHub Actions détecte les fichiers modifiés
3. Job "Build" (ubuntu-latest) :
   - Maven build (backend) ou npm build (frontend)
4. Job "Docker Build & Push" (ubuntu-latest) :
   - docker buildx build → ghcr.io/hienholo/[backend|frontend]:latest
5. Job "Deploy" (self-hosted runner sur VPS) :
   - docker login ghcr.io
   - docker pull [image]:latest
   - docker stop/rm ancien conteneur
   - docker run nouveau conteneur
6. Health check :
   - Backend : curl /actuator/health → {"status":"UP"}
   - Frontend : curl localhost:3000 → 200 OK
7. Disponible sur https://digie-pharma.com
```

**Durée totale** : ~3-5 minutes (build Maven ~2min, Docker build ~1min, deploy ~30s)
