import { useEffect, useRef, useState } from 'react';
import { Worker } from '@/lib/demoWorkers';
import { Phone, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WorkerMapProps {
  workers: Worker[];
  selectedWorker: Worker | null;
  onSelectWorker: (worker: Worker | null) => void;
}

export function WorkerMap({ workers, selectedWorker, onSelectWorker }: WorkerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      console.log('Google Maps API key not configured');
      return;
    }

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    // Initialize map centered on Solapur
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 17.6599, lng: 75.9064 },
      zoom: 14,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    mapInstanceRef.current = map;

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for workers
    workers.forEach(worker => {
      const marker = new google.maps.Marker({
        position: { lat: worker.lat, lng: worker.lng },
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: worker.available ? '#22c55e' : '#9ca3af',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: worker.name
      });

      marker.addListener('click', () => {
        onSelectWorker(worker);
      });

      markersRef.current.push(marker);
    });
  }, [workers, mapLoaded, onSelectWorker]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const showPlaceholder = !apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <div className="relative w-full h-full">
      {showPlaceholder ? (
        <div className="w-full h-full bg-secondary flex flex-col items-center justify-center p-8">
          <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-center mb-2">Map Preview</p>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Add your Google Maps API key in Settings to see the live map
          </p>
          
          {/* Demo worker cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            {workers.slice(0, 4).map(worker => (
              <Card 
                key={worker.id} 
                className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectWorker(worker)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${worker.available ? 'bg-available' : 'bg-busy'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{worker.name}</p>
                    <p className="text-xs text-muted-foreground">{worker.skill}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}

      {/* Worker detail card */}
      {selectedWorker && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 animate-fade-in shadow-lg max-w-sm mx-auto">
          <button 
            onClick={() => onSelectWorker(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded-full mt-1 ${selectedWorker.available ? 'bg-available animate-pulse-ring' : 'bg-busy'}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedWorker.name}</h3>
              <p className="text-muted-foreground">{selectedWorker.skill}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedWorker.available ? '🟢 Available Now' : '⚫ Currently Busy'}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => handleCall(selectedWorker.phone)}
            className="w-full mt-4 gap-2 bg-available hover:bg-available/90 text-white text-lg font-semibold py-6 shadow-lg"
            size="lg"
          >
            <Phone className="w-6 h-6" />
            Call {selectedWorker.name.split(' ')[0]}
          </Button>
        </Card>
      )}
    </div>
  );
}
