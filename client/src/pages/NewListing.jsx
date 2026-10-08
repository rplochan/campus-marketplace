import { useNavigate } from "react-router-dom";
import { api } from "../api";
import ListingForm from "../components/ListingForm";

export default function NewListing() {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="center" style={{ padding: "0 0 1rem" }}>Sell an item</h1>
      <ListingForm submitLabel="Publish listing" onSubmit={async (body) => {
        const { listing } = await api("/listings", { method: "POST", body });
        navigate(`/listings/${listing.id}`);
      }} />
    </>
  );
}