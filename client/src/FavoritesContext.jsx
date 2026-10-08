import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./AuthContext";

const Ctx = createContext(null);
export const useFavorites = () => useContext(Ctx);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) return setIds(new Set());
    api("/favorites/ids").then((d) => setIds(new Set(d.ids))).catch(() => {});
  }, [user]);

  async function toggle(id) {
    const had = ids.has(id);
    const next = new Set(ids);
    had ? next.delete(id) : next.add(id);
    setIds(next);
    try { await api(`/favorites/${id}`, { method: had ? "DELETE" : "PUT" }); }
    catch { setIds(ids); } // rollback
  }
  return <Ctx.Provider value={{ ids, toggle }}>{children}</Ctx.Provider>;
}