import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface Worker {
  id: string;
  name: string;
  skill: string;
  phone: string;
  available: boolean;
  lat: number;
  lng: number;
}

interface WorkerMapProps {
  workers: Worker[];
  selectedWorker: Worker | null;
  onSelectWorker: (worker: Worker | null) => void;
}

// Solapur center coordinates
const SOLAPUR_CENTER: [number, number] = [17.6599, 75.9064];

export function WorkerMap({ workers, selectedWorker, onSelectWorker }: WorkerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(SOLAPUR_CENTER, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when workers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // If no workers, center on Solapur
    if (workers.length === 0) {
      mapRef.current.setView(SOLAPUR_CENTER, 14);
      return;
    }

    // Add new markers
    workers.forEach(worker => {
      const markerColor = worker.available ? '#22c55e' : '#9ca3af';
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 28px;
          height: 28px;
          background-color: ${markerColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([worker.lat, worker.lng], { icon: customIcon })
        .addTo(mapRef.current!);

      const popupContent = `
        <div style="padding: 8px; min-width: 180px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${markerColor};"></div>
            <span style="font-weight: 600; color: #111;">${worker.name}</span>
          </div>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${worker.skill}</p>
          <p style="font-size: 12px; color: #888; margin-bottom: 12px;">
            ${worker.available ? '🟢 Available Now' : '⚫ Currently Busy'}
          </p>
          <a href="tel:${worker.phone}" 
             style="display: flex; align-items: center; justify-content: center; gap: 8px; 
                    background-color: #22c55e; color: white; font-weight: 500; 
                    padding: 10px 16px; border-radius: 8px; text-decoration: none;
                    transition: background-color 0.2s;">
            📞 Call
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        onSelectWorker(worker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are workers
    if (workers.length > 0) {
      const bounds = L.latLngBounds(workers.map(w => [w.lat, w.lng] as L.LatLngTuple));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [workers, onSelectWorker]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg z-0" 
        style={{ minHeight: '500px' }}
      />

      {/* Worker detail card */}
      {selectedWorker && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 animate-fade-in shadow-lg max-w-sm mx-auto z-[1000]">
          <button 
            onClick={() => onSelectWorker(null)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded-full mt-1 ${selectedWorker.available ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
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
            className="w-full mt-4 gap-2 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-6 shadow-lg"
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
