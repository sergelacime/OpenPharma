"use client"

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

// Import dynamique du composant de carte pour éviter les problèmes SSR
const DynamicMap = dynamic(() => import("./map-component/index"), { 
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="pt-6">
        <div className="bg-muted rounded-md h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </CardContent>
    </Card>
  )
}) as React.ComponentType<PharmacyMapProps>;

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
interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  userLocation: { latitude: number; longitude: number } | null;
}

export function PharmacyMap({ pharmacies, userLocation }: PharmacyMapProps) {
  return <DynamicMap pharmacies={pharmacies} userLocation={userLocation} />;
}
