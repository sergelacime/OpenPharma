#!/bin/bash

# Script de configuration pour le développement local
echo "🚀 Configuration de l'environnement de développement..."

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer l'environnement virtuel Python s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel et installer les dépendances
echo "📥 Installation des dépendances Python..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Installer les dépendances Node.js
echo "📥 Installation des dépendances Node.js..."
npm install

echo "✅ Configuration terminée !"
echo ""
echo "Pour démarrer le développement :"
echo "  npm run dev"
echo ""
echo "Pour exécuter la mise à jour des pharmacies :"
echo "  npm run update-pharmacies-once"
echo ""
echo "Pour démarrer le service de planification :"
echo "  npm run start-scheduler"
