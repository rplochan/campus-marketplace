import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import ListingForm from "../components/ListingForm";
import { ErrorState } from "../components/States";

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/listings/${id}`).then((d) => setListing(d.listing)).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!listing) return <div className="skeleton" />;
  if (listing.seller_id !== user.id) return <ErrorState message="You can only edit your own listings." />;

  return (
    <>
      <h1 className="center" style={{ padding: "0 0 1rem" }}>Edit listing</h1>
      <ListingForm initial={listing} submitLabel="Save changes" onSubmit={async (body) => {
        await api(`/listings/${id}`, { method: "PUT", body });
        navigate(`/listings/${id}`);
      }} />
    </>
  );
}