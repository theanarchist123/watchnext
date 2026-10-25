import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Ticket,
  Sparkles,
  Settings,
  User,
  Plus
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const isCurrent = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <Link to="/" className="sidebar__brand">
          <div className="sidebar__brand-logo">W</div>
          <span className="sidebar__brand-text">WatchNext</span>
        </Link>

        {/* Navigation Groups */}
        <div className="sidebar__group">
          <div className="sidebar__label">MENU</div>
          <nav className="sidebar__nav">
            <Link
              to="/analytics"
              className={`sidebar__item ${isCurrent("/analytics") ? "sidebar__item--active" : ""}`}
            >
              <LayoutDashboard size={18} className="sidebar__icon" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/"
              className={`sidebar__item ${isCurrent("/") ? "sidebar__item--active" : ""}`}
            >
              <Film size={18} className="sidebar__icon" />
              <span>Films</span>
            </Link>

            <Link
              to="/explore"
              className={`sidebar__item ${isCurrent("/explore") ? "sidebar__item--active" : ""}`}
            >
              <Ticket size={18} className="sidebar__icon" />
              <span>Ticketings</span>
            </Link>

            <Link
              to="/recommendations"
              className={`sidebar__item ${isCurrent("/recommendations") ? "sidebar__item--active" : ""}`}
            >
              <Sparkles size={18} className="sidebar__icon" />
              <span>Memberships</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar__group">
          <div className="sidebar__label">SYSTEM</div>
          <nav className="sidebar__nav">
            <Link
              to="/analytics"
              className="sidebar__item"
            >
              <Settings size={18} className="sidebar__icon" />
              <span>Settings</span>
            </Link>

            <Link
              to="/recommendations"
              className="sidebar__item"
            >
              <User size={18} className="sidebar__icon" />
              <span>Account</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Promo & User Profile Card */}
      <div className="sidebar__bottom">
        <div className="sidebar__ad-card">
          <span className="sidebar__ad-badge">ad ⊗</span>
          <img
            src="https://image.tmdb.org/t/p/w500/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg"
            alt="Ready Player One"
            className="sidebar__ad-poster"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80";
            }}
          />
        </div>

        <div className="sidebar__user">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="Martin Gu"
            className="sidebar__user-avatar"
          />
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">Martin Gu</span>
            <span className="sidebar__user-role">ChengDu·Wuhou</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
