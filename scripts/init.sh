#!/bin/bash

echo "🚀 Initialisation de Find Pharma..."

# Créer le répertoire de logs s'il n'existe pas
mkdir -p /app/logs

# Vérifier si le fichier de données existe
if [ ! -f "/app/pharmacies_geo.json" ]; then
    echo "📊 Fichier de données non trouvé, exécution de la mise à jour initiale..."
    node scripts/run-once.js
    if [ $? -eq 0 ]; then
        echo "✅ Mise à jour initiale réussie"
    else
        echo "⚠️ Mise à jour initiale échouée, création d'un fichier vide"
        echo '[]' > /app/pharmacies_geo.json
    fi
else
    echo "✅ Fichier de données trouvé"
fi

echo "🌐 Démarrage de l'application avec PM2..."
exec pm2-runtime ecosystem.config.js
