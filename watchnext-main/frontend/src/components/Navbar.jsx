import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, User } from "lucide-react";

const DEMO_USERS = [
  { id: 18, name: "Nikhil", role: "Demo profile" },
  { id: 28, name: "Shravanya", role: "Demo profile" },
  { id: 40, name: "Arnav", role: "Demo profile" },
  { id: 47, name: "Karuna", role: "Demo profile" },
];

const NAV_LINKS = [
  { label: "HOME", path: "/" },
  { label: "EXPLORE", path: "/explore" },
  { label: "FOR YOU", path: "/recommendations" },
  { label: "ANALYTICS", path: "/analytics" },
];

export default function Navbar({ activeUserId = 18, onSelectUser }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const numericUserId = Number(activeUserId) || 18;
  const currentUser = DEMO_USERS.find((user) => user.id === numericUserId) || {
    id: numericUserId,
    name: `User ${numericUserId}`,
    role: "Custom profile",
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const renderNavLinks = (mobile = false) =>
    NAV_LINKS.map((link) => {
      const isActive = link.path === "/"
        ? location.pathname === "/"
        : location.pathname === link.path ||
          (link.path === "/explore" && location.pathname.startsWith("/movie/"));
      return (
        <Link
          key={link.label}
          to={link.path}
          className={`iflix-header__link ${isActive ? "iflix-header__link--active" : ""}`}
          onClick={() => mobile && setMobileMenuOpen(false)}
        >
          <span>{link.label}</span>
        </Link>
      );
    });

  return (
    <header className={`iflix-header ${scrolled ? "iflix-header--scrolled" : ""}`}>
      <div className="iflix-header__left">
        <Link to="/" className="iflix-header__brand" aria-label="WatchNext home">
          Watch<span>Next</span>
        </Link>
        <nav className="iflix-header__nav" aria-label="Main navigation">
          {renderNavLinks()}
        </nav>
      </div>

      <div className="iflix-header__right">
        <div className="iflix-header__user-menu">
          <button
            type="button"
            className="iflix-header__user-pill"
            onClick={() => setUserDropdownOpen((open) => !open)}
            aria-expanded={userDropdownOpen}
            aria-label={`Select profile, current profile ${currentUser.name}`}
          >
            <User size={18} aria-hidden="true" />
            <span className="iflix-header__username">{currentUser.name}</span>
            <ChevronDown className="iflix-header__caret" size={15} aria-hidden="true" />
          </button>
          {userDropdownOpen && (
            <div className="iflix-header__dropdown" role="menu">
              {DEMO_USERS.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  role="menuitem"
                  className="iflix-header__dropdown-item"
                  onClick={() => {
                    onSelectUser?.(user.id);
                    setUserDropdownOpen(false);
                  }}
                >
                  <User size={16} aria-hidden="true" />
                  <span>{user.name} <small>({user.id})</small></span>
                </button>
              ))}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const id = Number(customInput);
                  if (Number.isInteger(id) && id >= 1 && id <= 138493) {
                    onSelectUser?.(id);
                    setUserDropdownOpen(false);
                  }
                }}
                style={{ display: "flex", gap: "6px", padding: "10px" }}
              >
                <label htmlFor="navbar-custom-user-id" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
                  Custom MovieLens user ID
                </label>
                <input
                  id="navbar-custom-user-id"
                  type="number"
                  min="1"
                  max="138493"
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  placeholder="Custom ID"
                  aria-label="Custom MovieLens user ID"
                  style={{ minWidth: 0, width: "100%" }}
                />
                <button type="submit" aria-label="Load custom MovieLens user ID">Load</button>
              </form>
            </div>
          )}
        </div>
        <button
          type="button"
          className="iflix-header__menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <nav className="iflix-header__mobile-nav" aria-label="Mobile navigation">
          {renderNavLinks(true)}
        </nav>
      )}
    </header>
  );
}
