import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, CATEGORIES } from "../api";
import ListingCard from "../components/ListingCard";
import { CardSkeletons, EmptyState, ErrorState } from "../components/States";

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  // debounce search typing into the URL
  useEffect(() => {
    const t = setTimeout(() => { if ((params.get("q") || "") !== search) update("q", search.trim()); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const qs = params.toString();
  const load = useCallback(() => {
    setLoading(true); setError("");
    api("/listings?" + qs).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [qs]);
  useEffect(load, [load]);

  const hasFilters = [...params.keys()].some((k) => k !== "page");

  return (
    <>
      <div className="card filters">
        <label>Search<input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <label>Category
          <select value={params.get("category") || ""} onChange={(e) => update("category", e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Min ₹<input type="number" min="0" defaultValue={params.get("minPrice") || ""} onBlur={(e) => update("minPrice", e.target.value)} /></label>
        <label>Max ₹<input type="number" min="0" defaultValue={params.get("maxPrice") || ""} onBlur={(e) => update("maxPrice", e.target.value)} /></label>
        <label>Sort
          <select value={params.get("sort") || ""} onChange={(e) => update("sort", e.target.value)}>
            <option value="">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
        <label className="row"><input type="checkbox" style={{ width: "auto" }} checked={params.get("showSold") === "true"} onChange={(e) => update("showSold", e.target.checked ? "true" : "")} /> Show sold</label>
        {hasFilters && <button className="btn-ghost" onClick={() => { setSearch(""); setParams({}); }}>Clear filters</button>}
      </div>

      {loading && <CardSkeletons />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data?.listings.length === 0 && (
        <EmptyState title="No listings found" text={hasFilters ? "Try changing or clearing your filters." : "Be the first to list something!"}>
          <Link to="/listings/new" className="btn">Sell an item</Link>
        </EmptyState>
      )}
      {!loading && !error && data?.listings.length > 0 && (
        <>
          <div className="grid">{data.listings.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
          <div className="pager">
            <button className="btn-ghost" disabled={data.page <= 1} onClick={() => update("page", data.page - 1)}>← Prev</button>
            <span>Page {data.page} of {data.totalPages}</span>
            <button className="btn-ghost" disabled={data.page >= data.totalPages} onClick={() => update("page", data.page + 1)}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}