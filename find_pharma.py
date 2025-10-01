import requests
from bs4 import BeautifulSoup
import json
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import os
import certifi

os.environ["SSL_CERT_FILE"] = certifi.where()

# Configuration de geopy
geolocator = Nominatim(user_agent="pharmacies_app")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

# Option pour désactiver le géocodage si nécessaire
ENABLE_GEOCODING = True  # Mettre à False pour désactiver le géocodage

def get_coordinates(address):
    try:
        location = geocode(f"{address}, Togo", timeout=10)
        return (location.latitude, location.longitude) if location else (None, None)
    except Exception as e:
        print(f"Erreur de géocodage pour '{address}': {e}")
        return (None, None)

# Récupération des données
url = 'https://www.inam.tg/pharmacies-de-garde/'
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

# Debug: Vérifier si la page se charge correctement
print(f"Status code: {response.status_code}")
print(f"Page title: {soup.title.string if soup.title else 'No title found'}")

# Chercher toutes les tables disponibles
tables = soup.find_all('table')
print(f"Nombre de tables trouvées: {len(tables)}")

# Chercher la table spécifique
table = soup.find('table', {'id': 'tablepress-189'})
if table is None:
    # Essayer de trouver une table avec une classe ou structure différente
    table = soup.find('table')
    print(f"Table trouvée (fallback): {table is not None}")
    if table:
        print(f"Classes de la table: {table.get('class', [])}")
        print(f"ID de la table: {table.get('id', 'No ID')}")

if table is None:
    print("Aucune table trouvée sur la page")
    exit(1)

pharmacies = []
rows = table.find_all('tr')
print(f"Nombre de lignes dans la table: {len(rows)}")

for idx, row in enumerate(rows[1:], start=1):
    cols = row.find_all('td')
    if len(cols) < 3:
        print(f"Ligne {idx}: Pas assez de colonnes ({len(cols)})")
        continue

    try:
        nom = cols[0].text.strip()
        telephone = cols[1].text.strip().replace('☎', '').strip()
        emplacement = cols[2].text.strip()
        
        # Nettoyage du numéro de téléphone
        if telephone.startswith('22'):
            telephone = f"+228 {telephone}"
        elif len(telephone) == 8 and not telephone.startswith('+'):
            telephone = f"+228 {telephone[1:]}" if telephone[0] == '0' else f"+228 {telephone}"
        elif not telephone.startswith('+'):
            telephone = f"+228 {telephone}"

        # Géocodage (optionnel, avec coordonnées par défaut si échec)
        if ENABLE_GEOCODING:
            print(f"Géocodage de: {nom}")
            latitude, longitude = get_coordinates(nom)
            
            # Coordonnées par défaut pour Lomé si le géocodage échoue
            if latitude is None or longitude is None:
                latitude, longitude = 6.1304, 1.2158  # Lomé par défaut
                print(f"Utilisation des coordonnées par défaut pour {nom}")
        else:
            # Utiliser des coordonnées par défaut sans géocodage
            latitude, longitude = 6.1304, 1.2158  # Lomé par défaut
            print(f"Géocodage désactivé - coordonnées par défaut pour {nom}")

        pharmacies.append({
            "id": str(idx),
            "name": nom,
            "address": emplacement,
            "phone": telephone,
            "latitude": latitude,
            "longitude": longitude
        })
        
        print(f"✓ Pharmacie ajoutée: {nom}")
        
    except Exception as e:
        print(f"Erreur lors du traitement de la ligne {idx}: {e}")
        continue

# Sauvegarde en JSON
with open('pharmacies_geo.json', 'w', encoding='utf-8') as f:
    json.dump(pharmacies, f, ensure_ascii=False, indent=4)

print("Fichier JSON généré avec les coordonnées géographiques !")