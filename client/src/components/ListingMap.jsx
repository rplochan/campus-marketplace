import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ListingMap({ lat, lng, name }) {
  return (
    <div>
      <strong>Pickup location</strong>
      <p className="muted" style={{ margin: ".25rem 0" }}>{name}</p>
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: 240, borderRadius: 12 }} scrollWheelZoom={false}>
        <TileLayer attribution="© OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={[lat, lng]} radius={10}><Popup>{name}</Popup></CircleMarker>
      </MapContainer>
    </div>
  );
}