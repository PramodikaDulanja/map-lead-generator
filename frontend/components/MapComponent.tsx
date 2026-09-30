import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for missing marker icons in Next.js + Leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Define Sri Lanka's geographical boundaries
const sriLankaBounds = L.latLngBounds(
  L.latLng(5.5, 79.0), // South-West ocean buffer
  L.latLng(10.0, 82.5)  // North-East ocean buffer
);

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Added smooth animation when moving the map
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

function MapClickHandler({ setCenter }: { setCenter: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setCenter([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

interface MapProps {
  radius: number;
  center?: [number, number];
  setCenter?: (pos: [number, number]) => void;
}

export default function MapComponent({ radius, center = [7.8731, 80.7718], setCenter }: MapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={8} 
      minZoom={7} 
      maxBounds={sriLankaBounds} 
      maxBoundsViscosity={1.0} 
      scrollWheelZoom={true} 
      className="w-full h-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      
      {setCenter && <MapClickHandler setCenter={setCenter} />}
      
      <Marker position={center} icon={customIcon}>
        <Popup>Search Center</Popup>
      </Marker>
      
      <Circle 
        center={center} 
        radius={radius * 1000} 
        pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }}
      />
    </MapContainer>
  );
}