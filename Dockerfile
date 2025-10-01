# Multi-stage build pour Node.js et Python
FROM node:22-slim as base

# Installer Python et les dépendances système
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN groupmod -g 1000 node
RUN usermod -u 1000 -g node node

WORKDIR /app

# Copier les fichiers de dépendances
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node ecosystem.config.js ./

# Installer les dépendances Node.js
RUN npm install

# Installer PM2 globalement
RUN yarn global add npm@latest pnpm pm2

# Copier le script Python et créer l'environnement virtuel
COPY --chown=node:node find_pharma.py ./
COPY --chown=node:node requirements.txt ./

# Créer et configurer l'environnement virtuel Python
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install -r requirements.txt

# Copier le reste de l'application
COPY --chown=node:node . .

# Build l'application Next.js
RUN npm run build

# Créer un script wrapper pour exécuter Python avec l'environnement virtuel
RUN echo '#!/bin/bash\n/app/venv/bin/python3 "$@"' > /usr/local/bin/python-venv && \
    chmod +x /usr/local/bin/python-venv

# Modifier les scripts Node.js pour utiliser le wrapper Python
RUN sed -i 's/python3/python-venv/g' scripts/run-once.js
RUN sed -i 's/python3/python-venv/g' scripts/update-pharmacies.js

# Rendre le script d'initialisation exécutable
RUN chmod +x scripts/init.sh

RUN chown node:node -R /app

USER node

EXPOSE 3000

CMD ["/app/scripts/init.sh"]