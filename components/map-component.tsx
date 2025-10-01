"use client"

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Interface pour les pharmacies
interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  hours: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
}

// Props du composant
interface MapComponentProps {
  pharmacies: Pharmacy[];
  userLocation: { latitude: number; longitude: number } | null;
}

// Composant pour centrer la carte sur la position de l'utilisateur
function MapCenter({ userLocation }: { userLocation: { latitude: number; longitude: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation, map]);
  
  return null;
}

// Icône personnalisée pour les marqueurs
const createCustomIcon = (isOpen: boolean) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${isOpen ? '#22c55e' : '#ef4444'};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">
        ${isOpen ? '✓' : '✗'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Icône pour la position de l'utilisateur
const userIcon = L.divIcon({
  html: `
    <div style="
      background-color: #3b82f6;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">
      👤
    </div>
  `,
  className: 'user-marker',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

function MapComponent({ pharmacies, userLocation }: MapComponentProps) {
  // Position par défaut (Lomé, Togo)
  const defaultCenter: [number, number] = [6.1304, 1.2158];
  const defaultZoom = 12;

  return (
    <Card>
      <CardContent className="pt-6 p-0">
        <div className="h-[400px] w-full">
          <MapContainer
            center={userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter}
            zoom={defaultZoom}
            style={{ height: "100%", width: "100%" }}
            className="rounded-md"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Centrer la carte sur la position de l'utilisateur */}
            <MapCenter userLocation={userLocation} />
            
            {/* Marqueur de la position de l'utilisateur */}
            {userLocation && (
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={userIcon}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">Votre position</p>
                    <p className="text-sm text-muted-foreground">
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Marqueurs des pharmacies */}
            {pharmacies.map((pharmacy) => (
              <Marker
                key={pharmacy.id}
                position={[pharmacy.latitude, pharmacy.longitude]}
                icon={createCustomIcon(pharmacy.isOpen)}
              >
                <Popup>
                  <div className="min-w-[280px] p-2">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 leading-tight">
                        {pharmacy.name}
                      </h3>
                      <Badge 
                        variant={pharmacy.isOpen ? "default" : "outline"} 
                        className={`text-xs font-medium ${
                          pharmacy.isOpen 
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                            : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        }`}
                      >
                        {pharmacy.isOpen ? "Ouvert" : "Fermé"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{pharmacy.address}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pharmacy.phone}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pharmacy.hours}</span>
                      </div>
                      
                      {pharmacy.distance > 0 && (
                        <div className="flex items-center text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            Distance: {pharmacy.distance.toFixed(1)} km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default MapComponent;
