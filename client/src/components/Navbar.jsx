import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">🎓 Campus Marketplace</Link>
      <nav>
        {user ? (
          <>
            <NavLink to="/listings/new">Sell</NavLink>
            <NavLink to="/my-listings">My listings</NavLink>
            <NavLink to="/favorites">Wishlist</NavLink>
            <span className="muted">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn-ghost" onClick={async () => { await logout(); navigate("/"); }}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/signup" className="btn">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}