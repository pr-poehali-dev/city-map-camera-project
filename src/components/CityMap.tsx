import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Camera {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  status: 'active' | 'inactive' | 'warning';
  coverage: number;
  lastActivity: string;
}

interface CityMapProps {
  cameras: Camera[];
  onCameraClick: (camera: Camera) => void;
  onMapClick?: (lat: number, lng: number) => void;
  isAddingCamera: boolean;
  newCameraPosition?: { lat: number; lng: number };
}

const CityMap = ({ cameras, onCameraClick, onMapClick, isAddingCamera, newCameraPosition }: CityMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: L.Marker; circle: L.Circle }>>(new Map());
  const newCameraMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map', {
        center: [52.2897, 104.2806],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (onMapClick) {
        map.on('click', (e) => {
          if (isAddingCamera) {
            onMapClick(e.latlng.lat, e.latlng.lng);
          }
        });
      }

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const currentMarkerIds = new Set(cameras.map(cam => cam.id));
    
    markersRef.current.forEach((value, id) => {
      if (!currentMarkerIds.has(id)) {
        value.marker.remove();
        value.circle.remove();
        markersRef.current.delete(id);
      }
    });

    cameras.forEach((camera) => {
      const existing = markersRef.current.get(camera.id);

      if (existing) {
        existing.marker.setLatLng([camera.lat, camera.lng]);
        existing.circle.setLatLng([camera.lat, camera.lng]);
        existing.circle.setRadius(camera.radius);
        
        const color = camera.status === 'active' ? '#0EA5E9' : camera.status === 'warning' ? '#F97316' : '#8E9196';
        existing.circle.setStyle({ color, fillColor: color });
      } else {
        const color = camera.status === 'active' ? '#0EA5E9' : camera.status === 'warning' ? '#F97316' : '#8E9196';
        
        const circle = L.circle([camera.lat, camera.lng], {
          radius: camera.radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(mapRef.current);

        const icon = L.divIcon({
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: white;
              border: 2px solid ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                <path d="M7 21h10"></path>
                <path d="M12 3v18"></path>
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
              </svg>
            </div>
          `,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([camera.lat, camera.lng], { icon })
          .addTo(mapRef.current)
          .on('click', () => onCameraClick(camera));

        markersRef.current.set(camera.id, { marker, circle });
      }
    });
  }, [cameras, onCameraClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (newCameraMarkerRef.current) {
      newCameraMarkerRef.current.remove();
      newCameraMarkerRef.current = null;
    }

    if (isAddingCamera && newCameraPosition) {
      const icon = L.divIcon({
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: rgba(14, 165, 233, 0.2);
            border: 2px dashed #0EA5E9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </div>
        `,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      newCameraMarkerRef.current = L.marker([newCameraPosition.lat, newCameraPosition.lng], { icon })
        .addTo(mapRef.current);
    }
  }, [isAddingCamera, newCameraPosition]);

  return (
    <div 
      id="map" 
      style={{ 
        width: '100%', 
        height: '600px',
        borderRadius: '0.5rem',
        cursor: isAddingCamera ? 'crosshair' : 'grab'
      }}
    />
  );
};

export default CityMap;
