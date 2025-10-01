"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Navigation, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PharmacyMap } from "./pharmacy-map";
import pharmaciesData from "../pharmacies_geo.json";


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


// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

export function PharmacyFinder() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [mockPharmacies, setMockPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    // Charger les données des pharmacies depuis le fichier JSON local
    // Ajouter les propriétés manquantes pour la compatibilité
    const pharmaciesWithDefaults = pharmaciesData.map(pharmacy => ({
      ...pharmacy,
      hours: "-", // Heures par défaut
      isOpen: true, // Par défaut ouvert
      distance: 0 // Distance par défaut, sera calculée plus tard
    }));
    setMockPharmacies(pharmaciesWithDefaults);
  }, []);

  
  const requestLocationPermission = () => {
    setLoading(true);
    setPermissionDenied(false);
    
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation services."
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        fetchNearbyPharmacies(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setPermissionDenied(true);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Location access denied",
          description: "Please enable location services to find nearby pharmacies."
        });
      }
    );
  };

  const fetchNearbyPharmacies = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      
      const radius = 40; // 4km radius
      
      // Process the mock data directly on the client
      const nearbyPharmacies = mockPharmacies.map(pharmacy => {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          pharmacy.latitude, 
          pharmacy.longitude
        );
        
        return {
          ...pharmacy,
          distance
        };
      })
      .filter(pharmacy => pharmacy.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPharmacies(nearbyPharmacies);
    } catch (error) {
      console.error("Error processing pharmacies:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process nearby pharmacies. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const getDirections = (lat: number, lng: number) => {
    if (!userLocation) return;
    window.open(`https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${lat},${lng}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight mb-3 gradient-text">
            Localisateur de Pharmacies CimeIT
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Trouvez les pharmacies de garde près de vous dans un rayon de 40km
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Géolocalisation</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Mise à jour quotidienne</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>Contact direct</span>
            </div>
          </div>
        </div>

        {permissionDenied && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès à la localisation refusé</AlertTitle>
            <AlertDescription>
              Veuillez activer les services de localisation dans les paramètres de votre navigateur pour utiliser cette fonctionnalité.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Trouver les Pharmacies Proches
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Nous avons besoin de votre localisation pour afficher les pharmacies dans un rayon de 40km de votre position.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-4">
              <Button 
                onClick={requestLocationPermission} 
                className="w-full h-12 text-lg font-semibold btn-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="mr-2">Localisation en cours...</span>
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-5 w-5" />
                    {userLocation ? "Actualiser la Position" : "Partager Ma Position"}
                  </>
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-12 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                    <MapPin className="mr-2 h-5 w-5" />
                    Voir Toutes les Pharmacies
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Toutes les Pharmacies de Garde</DialogTitle>
                    <DialogDescription className="text-base">
                      Liste de toutes les pharmacies disponibles dans notre base de données
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {mockPharmacies.map((pharmacy) => (
                      <Card key={pharmacy.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                {pharmacy.name}
                              </CardTitle>
                              <CardDescription className="flex items-center mt-2">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">{pharmacy.address}</span>
                              </CardDescription>
                            </div>
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
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium">{pharmacy.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium">{pharmacy.hours}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Recherche en cours...
              </h2>
              <p className="text-muted-foreground">
                Nous cherchons les pharmacies les plus proches de vous
              </p>
            </div>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pharmacies.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Pharmacies Trouvées
              </h2>
              <p className="text-muted-foreground">
                {pharmacies.length} pharmacie{pharmacies.length > 1 ? 's' : ''} trouvée{pharmacies.length > 1 ? 's' : ''} dans un rayon de 40km
              </p>
            </div>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="list" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  Vue Liste
                </TabsTrigger>
                <TabsTrigger value="map" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  Vue Carte
                </TabsTrigger>
              </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              {pharmacies.map((pharmacy, index) => (
                <Card key={pharmacy.id} className="pharmacy-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                            #{index + 1}
                          </span>
                          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {pharmacy.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="flex items-start mt-2">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{pharmacy.address}</span>
                        </CardDescription>
                      </div>
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
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Phone className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Téléphone</p>
                          <span className="text-sm font-semibold">{pharmacy.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Clock className="h-5 w-5 mr-3 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Horaires</p>
                          <span className="text-sm font-semibold">{pharmacy.hours}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {pharmacy.distance.toFixed(1)} km
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => getDirections(pharmacy.latitude, pharmacy.longitude)}
                      className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-200"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Itinéraire
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="map">
              <PharmacyMap 
                pharmacies={pharmacies} 
                userLocation={userLocation} 
              />
            </TabsContent>
            </Tabs>
          </div>
        ) : userLocation ? (
          <Card className="text-center py-12 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Aucune Pharmacie Trouvée
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Nous n'avons trouvé aucune pharmacie de garde dans un rayon de 40km de votre position.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-muted-foreground mb-4">
                Essayez d'élargir votre zone de recherche ou vérifiez à nouveau plus tard.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={requestLocationPermission}
                  variant="outline"
                  className="hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-900/20"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Actualiser la Recherche
                </Button>
                <Button 
                  onClick={() => setUserLocation(null)}
                  variant="ghost"
                >
                  Changer de Position
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}