import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ListingCard from "../components/ListingCard";
import ListingActions from "../components/ListingActions";
import { CardSkeletons, EmptyState, ErrorState } from "../components/States";

export default function MyListings() {
  const [listings, setListings] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api("/listings/mine").then((d) => setListings(d.listings)).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!listings) return <CardSkeletons n={4} />;
  if (!listings.length)
    return <EmptyState title="You haven't listed anything yet" text="Create your first listing."><Link to="/listings/new" className="btn">Sell an item</Link></EmptyState>;

  return (
    <>
      <h1>My listings</h1>
      <div className="grid">
        {listings.map((l) => (
          <div key={l.id}>
            <ListingCard listing={l} />
            <div style={{ marginTop: ".5rem" }}>
              <ListingActions
                listing={l}
                onChange={(u) => setListings((ls) => ls.map((x) => (x.id === u.id ? u : x)))}
                onDeleted={(id) => setListings((ls) => ls.filter((x) => x.id !== id))}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}