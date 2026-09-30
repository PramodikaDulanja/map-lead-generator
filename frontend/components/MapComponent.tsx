import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Standard Blue Icon for the Businesses (Leads)
const leadIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red Icon for the Search Center
const centerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Define Sri Lanka's geographical boundaries
const sriLankaBounds = L.latLngBounds(
  L.latLng(5.5, 79.0), // South-West ocean buffer
  L.latLng(10.0, 82.5)  // North-East ocean buffer
);

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
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

// NEW: Added `leads` to the interface
interface MapProps {
  radius: number;
  center?: [number, number];
  setCenter?: (pos: [number, number]) => void;
  leads?: any[]; 
}

export default function MapComponent({ radius, center = [6.9271, 79.8612], setCenter, leads = [] }: MapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={13} // Zoomed in a bit closer by default
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
      
      {/* SEARCH CENTER MARKER (Red) */}
      <Marker position={center} icon={centerIcon}>
        <Popup>
          <strong>Search Center</strong><br/>
          Radius: {radius} km
        </Popup>
      </Marker>
      
      <Circle 
        center={center} 
        radius={radius * 1000} 
        pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2 }}
      />

      {/* GENERATED LEADS MARKERS (Blue) */}
      {leads.map((lead) => {
        if (!lead.lat || !lead.lon) return null; // Skip if no coordinates
        return (
          <Marker key={`map-lead-${lead.id}`} position={[lead.lat, lead.lon]} icon={leadIcon}>
            <Popup>
              <div className="font-sans min-w-[150px]">
                <strong className="text-sm block mb-1 text-slate-800">{lead.name}</strong>
                <span className="text-xs text-slate-500 block mb-2">{lead.address}</span>
                {lead.google_maps_url && (
                  <a 
                    href={lead.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}