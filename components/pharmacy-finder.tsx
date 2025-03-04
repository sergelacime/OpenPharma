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
import axios from "axios";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


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

// Mock pharmacy data
const mockPharmacies = [
  {
    id: "1",
    name: "Pharmacie Saint Joseph",
    address: "Rue de la Paix, Lomé",
    phone: "+228 22 21 20 19",
    hours: "8:00 AM - 8:00 PM",
    isOpen: true,
    latitude: 6.1304,
    longitude: 1.2158
  },
  {
    id: "2",
    name: "Pharmacie du Grand Marché",
    address: "Grand Marché, Lomé",
    phone: "+228 22 21 22 23",
    hours: "7:30 AM - 9:00 PM",
    isOpen: true,
    latitude: 6.1285,
    longitude: 1.2203
  },
  {
    id: "3",
    name: "Pharmacie Tokoin",
    address: "Tokoin, Lomé",
    phone: "+228 22 21 24 25",
    hours: "8:00 AM - 7:00 PM",
    isOpen: false,
    latitude: 6.1350,
    longitude: 1.2100
  },
  {
    id: "4",
    name: "Pharmacie de l'Indépendance",
    address: "Avenue de l'Indépendance, Lomé",
    phone: "+228 22 21 26 27",
    hours: "24/7",
    isOpen: true,
    latitude: 6.1256,
    longitude: 1.2250
  },
  {
    id: "5",
    name: "Pharmacie de la Caisse",
    address: "Rue des Banques, Lomé",
    phone: "+228 22 21 28 29",
    hours: "8:30 AM - 8:30 PM",
    isOpen: false,
    latitude: 6.1320,
    longitude: 1.2180
  }
];

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


  const handlegetpharmacy = async ()=>{
    const response = await axios.get("http://pharma-api.lami9315.odns.fr/api/pharmacies/");
    return response.data;
  }

  useEffect(() => {
    handlegetpharmacy().then(setMockPharmacies);
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">CimeIT Pharmacy Locator</h1>
          <p className="text-muted-foreground">Find on-duty pharmacies near you within a 4km radius</p>
          <p>{userLocation?.latitude}</p>
          <p>{userLocation?.longitude}</p>
        </div>

        {permissionDenied && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location access denied</AlertTitle>
            <AlertDescription>
              Please enable location services in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Nearby Pharmacies</CardTitle>
            <CardDescription>
              We need your location to show pharmacies within 4km of your position.
            </CardDescription>
            <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={requestLocationPermission} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="mr-2">Locating...</span>
                    <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    {userLocation ? "Refresh Location" : "Share My Location"}
                  </>
                )}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" size="lg">
                    <MapPin className="mr-2 h-4 w-4" />
                    View All Pharmacies
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All On-Duty Pharmacies</DialogTitle>
                    <DialogDescription>
                      List of all available pharmacies in our database
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {mockPharmacies.map((pharmacy) => (
                      <Card key={pharmacy.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{pharmacy.name}</CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                {pharmacy.address}
                              </CardDescription>
                            </div>
                            <Badge variant={pharmacy.isOpen ? "default" : "outline"}>
                              {pharmacy.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{pharmacy.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{pharmacy.hours}</span>
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
          </CardHeader>
          
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
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
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              {pharmacies.map((pharmacy) => (
                <Card key={pharmacy.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pharmacy.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {pharmacy.address}
                        </CardDescription>
                      </div>
                      <Badge variant={pharmacy.isOpen ? "default" : "outline"}>
                        {pharmacy.isOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{pharmacy.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{pharmacy.hours}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {pharmacy.distance.toFixed(1)} km away
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => getDirections(pharmacy.latitude, pharmacy.longitude)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="map">
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-muted rounded-md h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Map view will be implemented with a mapping library like Google Maps or Leaflet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : userLocation ? (
          <Card>
            <CardHeader>
              <CardTitle>No Pharmacies Found</CardTitle>
              <CardDescription>
                We couldn't find any on-duty pharmacies within 40km of your location.
              </CardDescription>
              
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Try expanding your search radius or check again later.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}