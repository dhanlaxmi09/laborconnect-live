import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Worker } from '@/lib/demoWorkers';
import { Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom green icon for available workers
const availableIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background-color: #22c55e;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Gray icon for busy workers
const busyIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background-color: #9ca3af;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

interface WorkerMapProps {
  workers: Worker[];
  selectedWorker: Worker | null;
  onSelectWorker: (worker: Worker | null) => void;
}

// Component to handle map bounds based on workers
function MapBounds({ workers }: { workers: Worker[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (workers.length > 0) {
      const bounds = L.latLngBounds(workers.map(w => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [workers, map]);
  
  return null;
}

export function WorkerMap({ workers, selectedWorker, onSelectWorker }: WorkerMapProps) {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const solapurCenter: [number, number] = [17.6599, 75.9064];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={solapurCenter}
        zoom={14}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds workers={workers} />
        
        {workers.map(worker => (
          <Marker
            key={worker.id}
            position={[worker.lat, worker.lng]}
            icon={worker.available ? availableIcon : busyIcon}
            eventHandlers={{
              click: () => onSelectWorker(worker)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${worker.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-semibold text-gray-900">{worker.name}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{worker.skill}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {worker.available ? '🟢 Available Now' : '⚫ Currently Busy'}
                </p>
                <button
                  onClick={() => handleCall(worker.phone)}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

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
