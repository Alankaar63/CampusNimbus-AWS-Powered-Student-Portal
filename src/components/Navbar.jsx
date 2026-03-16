import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearSession, getLoginUrl, getUserContext } from "../lib/auth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useMemo(() => getUserContext(), []);
  const onHome = location.pathname === "/";

  const login = () => {
    window.location.href = getLoginUrl();
  };

  const logout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <nav className="nav-shell">
      <div>
        <h1 className="brand-title">Symbiosis International University</h1>
        <p className="brand-subtitle">Student Portal</p>
      </div>

      <div className="nav-actions">
        {!onHome && (
          <div className="chip">
            {user.role} {user.prn ? `| ${user.prn}` : ""}
          </div>
        )}

        {onHome ? (
          <button onClick={login} className="portal-btn">
            Continue with Symbiosis ID
          </button>
        ) : (
          <button onClick={logout} className="portal-btn secondary">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
