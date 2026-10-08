import { Link } from "react-router-dom";
import { formatPrice } from "../api";

export default function ListingCard({ listing: l, children }) {
  return (
    <div className="card listing-card-wrap" style={{ position: "relative" }}>
      {l.is_sold && <span className="sold-badge">SOLD</span>}
      {children}
      <Link to={`/listings/${l.id}`} className={`listing-card ${l.is_sold ? "sold" : ""}`}>
        <img src={l.image_url} alt={l.title} loading="lazy" />
        <div className="body">
          <div className="price">{formatPrice(l.price)}</div>
          <strong>{l.title}</strong>
          <div className="muted">{l.category}{l.location_name ? ` · ${l.location_name.split(",")[0]}` : ""}</div>
        </div>
      </Link>
    </div>
  );
}