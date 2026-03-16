import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { APP_CONFIG } from "../config";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get("error");
        const oauthErrorDescription = params.get("error_description");
        const code = params.get("code");

        if (oauthError) {
          throw new Error(`${oauthError}: ${oauthErrorDescription || "Authentication redirect failed."}`);
        }

        if (!code) {
          throw new Error("No authorization code found in callback URL.");
        }

        const res = await fetch(`${APP_CONFIG.cognitoDomain}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: APP_CONFIG.clientId,
            redirect_uri: APP_CONFIG.redirectUri,
            code,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error_description || data.error || "OAuth token exchange failed",
          );
        }

        if (!data.access_token || !data.id_token) {
          throw new Error("Missing tokens in OAuth response");
        }

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("id_token", data.id_token);

        const decoded = jwtDecode(data.id_token);
        const role = decoded["custom:role"] || decoded["cognito:groups"]?.[0] || "Student";
        const prn =
          decoded["custom:prn"] ||
          decoded.prn ||
          decoded["cognito:username"] ||
          "";

        localStorage.setItem("role", role);
        if (prn) localStorage.setItem("prn", prn);

        navigate("/result-access");
      } catch (err) {
        console.error("OAuth error:", err);
        setError(err.message || "OAuth token exchange failed.");
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="portal-scene callback-screen">
      <div className="animated-gradient" />
      <h1 className="callback-title">Signing you in...</h1>
      {error ? (
        <p className="error-text" style={{ position: "relative", zIndex: 4, marginTop: "1rem", maxWidth: "760px", textAlign: "center" }}>
          {error} Current redirect URI: {APP_CONFIG.redirectUri}
        </p>
      ) : null}
    </div>
  );
}
