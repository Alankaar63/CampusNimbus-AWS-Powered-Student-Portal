import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/campus", label: "Campus Life" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="site-logo" data-cursor="hover">
        Symbiosis International University
      </Link>

      <nav className="site-links">
        <a
          href="https://www.siu.edu.in/"
          target="_blank"
          rel="noreferrer"
          className="site-link"
          data-cursor="hover"
        >
          About Us
        </a>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `site-link ${isActive ? "active" : ""}`}
            data-cursor="hover"
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/siu-portal"
          className={({ isActive }) => `site-link ${isActive ? "active" : ""}`}
          data-cursor="hover"
        >
          SIU Portal
        </NavLink>
      </nav>
    </header>
  );
}
