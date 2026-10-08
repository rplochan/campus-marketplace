import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, formatPrice } from "../api";
import { useAuth } from "../AuthContext";
import ListingActions from "../components/ListingActions";
import { ErrorState } from "../components/States";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api(`/listings/${id}`).then((d) => setListing(d.listing)).catch((e) => setError(e.message));
  };
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!listing) return <div className="skeleton" />;
  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="card detail">
      <div style={{ position: "relative" }}>
        {listing.is_sold && <span className="sold-badge">SOLD</span>}
        <img className={`main ${listing.is_sold ? "sold" : ""}`} src={listing.image_url} alt={listing.title} />
      </div>
      <div className="form" style={{ padding: 0 }}>
        <h1 style={{ margin: 0 }}>{listing.title}</h1>
        <div className="price" style={{ fontSize: "1.5rem" }}>{formatPrice(listing.price)}</div>
        <div className="muted">{listing.category} · Posted {new Date(listing.created_at).toLocaleDateString()}</div>
        <p style={{ whiteSpace: "pre-wrap" }}>{listing.description}</p>
        <div>Seller: <strong>{listing.seller_name}</strong></div>

        {isOwner ? (
          <ListingActions listing={listing} onChange={setListing} onDeleted={() => navigate("/my-listings")} />
        ) : listing.is_sold ? (
          <p className="error"><strong>This item has been sold.</strong></p>
        ) : user ? (
          <a className="btn" href={`mailto:${listing.seller_email}?subject=${encodeURIComponent("Interested in: " + listing.title)}`}>Contact seller</a>
        ) : (
          <Link className="btn" to="/login" state={{ from: `/listings/${id}` }}>Log in to contact seller</Link>
        )}
        {/* MAP_HERE */}
      </div>
    </div>
  );
}