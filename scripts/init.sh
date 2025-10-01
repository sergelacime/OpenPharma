#!/bin/bash

echo "🚀 Initialisation de Find Pharma..."

# Vérifier si le fichier de données existe
if [ ! -f "/app/pharmacies_geo.json" ]; then
    echo "📊 Fichier de données non trouvé, exécution de la mise à jour initiale..."
    node scripts/run-once.js
else
    echo "✅ Fichier de données trouvé"
fi

echo "🌐 Démarrage de l'application avec PM2..."
exec pm2-runtime ecosystem.config.js
